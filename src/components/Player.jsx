import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';

const MOVE_SPEED = 5;
const LOG_INTERVAL = 0.2;  // 移動ログの記録間隔
const GAZE_INTERVAL = 0.5; // 視線チェックの間隔

export default function Player() {
    const rb = useRef();
    const { camera, scene, raycaster } = useThree();
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);

    // Storeからアクションを個別に取得（無限ループ回避のため）
    const addLog = useGameStore(state => state.addLog);
    const addGazeLog = useGameStore(state => state.addGazeLog);
    const addSystemLog = useGameStore(state => state.addSystemLog);
    const floor = useGameStore(state => state.floor);

    const lastLogTime = useRef(0);
    const lastGazeTime = useRef(0);
    const lastFloor = useRef(floor);

    // ★ 凝視判定用の新しい変数
    const lastHitPoint = useRef(new THREE.Vector3(0, 0, 0));
    const stareCount = useRef(0);

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        // --- 部屋移動時のリセット ---
        if (floor !== lastFloor.current) {
            rb.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastFloor.current = floor;
            stareCount.current = 0; // カウンターリセット
            return;
        }

        // --- 移動処理 ---
        const { forward, backward, left, right } = getKeys();
        const velocity = new THREE.Vector3();
        if (forward) velocity.z -= 1;
        if (backward) velocity.z += 1;
        if (left) velocity.x -= 1;
        if (right) velocity.x += 1;

        if (velocity.length() > 0) {
            velocity.normalize().multiplyScalar(MOVE_SPEED).applyQuaternion(camera.quaternion);
        }
        velocity.y = rb.current.linvel().y;
        rb.current.setLinvel(velocity, true);

        const pos = rb.current.translation();
        camera.position.set(pos.x, pos.y + 0.7, pos.z);

        // --- ログ記録 (移動) ---
        lastLogTime.current += delta;
        if (lastLogTime.current >= LOG_INTERVAL) {
            if (velocity.x !== 0 || velocity.z !== 0) {
                addLog([pos.x, pos.y, pos.z]);
            }
            lastLogTime.current = 0;
        }

        // --- 視線検知 (Gaze) ---
        lastGazeTime.current += delta;
        if (lastGazeTime.current >= GAZE_INTERVAL) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

            // 自分自身やグリッド以外のオブジェクトを探す
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const hit = intersects.find(obj => obj.object.name !== "player" && obj.object.type !== "GridHelper");

                if (hit && hit.distance < 15) {
                    // 1. 視線データは常に記録（次の部屋の「目」のため）
                    addGazeLog(hit.point.toArray());

                    // 2. 凝視判定（音とログのトリガー）
                    // 前回の視点との距離を測る
                    const dist = hit.point.distanceTo(lastHitPoint.current);

                    // 視点が1m以内の範囲に留まっているなら「見つめている」と判定
                    if (dist < 1.0) {
                        stareCount.current += 1;
                    } else {
                        stareCount.current = 0; // 視線が動いたらリセット
                    }

                    // 今回の座標を保存
                    lastHitPoint.current.copy(hit.point);

                    // 0.5秒 x 4回 = 2秒間見つめ続けたら発動
                    if (stareCount.current >= 4) {
                        addSystemLog("GAZE FOCUS DETECTED."); // 「凝視を検知」
                        stareCount.current = 0; // リセット（見続けると2秒ごとに鳴る）
                    }
                }
            } else {
                stareCount.current = 0; // 虚空を見ている時はリセット
            }
            lastGazeTime.current = 0;
        }
    });

    return (
        <>
            <PointerLockControls onLock={() => setIsLocked(true)} onUnlock={() => setIsLocked(false)} />
            <RigidBody
                ref={rb}
                name="player"
                colliders={false}
                position={[0, 2, 0]}
                enabledRotations={[false, false, false]}
                type="dynamic"
            >
                <CapsuleCollider args={[0.75, 0.4]} />
                {/* Raycast無視用のダミーメッシュ */}
                <mesh name="player" visible={false}>
                    <capsuleGeometry args={[0.4, 1.5]} />
                </mesh>
            </RigidBody>
        </>
    );
}