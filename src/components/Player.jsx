import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';

const MOVE_SPEED = 5;
const LOG_INTERVAL = 0.2;
const GAZE_INTERVAL = 0.5;

export default function Player() {
    const rb = useRef();
    const { camera, scene, raycaster } = useThree(); // Raycaster用に取得
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);

    // Storeからアクションを取得
    const { addLog, addGazeLog, addSystemLog, floor } = useGameStore(state => ({
        addLog: state.addLog,
        addGazeLog: state.addGazeLog,
        addSystemLog: state.addSystemLog,
        floor: state.floor
    }));

    const lastLogTime = useRef(0);
    const lastGazeTime = useRef(0);
    const lastFloor = useRef(floor);

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        // 部屋移動リセット
        if (floor !== lastFloor.current) {
            rb.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastFloor.current = floor;
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
            // 画面中央からRayを飛ばす
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            // player自身のコライダーに当たらないよう注意（レイヤー分けが理想だが簡易的に距離チェック）
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const hit = intersects[0];
                // 距離が近すぎず（自分自身）、遠すぎない（壁）場合
                if (hit.distance > 1 && hit.distance < 15) {
                    addGazeLog(hit.point.toArray());

                    // 【ここが重要】視線を検知したらログを出す（確率で）
                    if (Math.random() < 0.3) {
                        addSystemLog("VISUAL CONTACT RECORDED.");
                    }
                }
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
            </RigidBody>
        </>
    );
}