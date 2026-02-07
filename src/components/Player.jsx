import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';
import { playStep } from '../utils/AudioSynth';

const MOVE_SPEED = 5;
const CLIMB_SPEED = 3;
const LOG_INTERVAL = 0.2;
const GAZE_INTERVAL = 0.5;
const STEP_INTERVAL = 0.5;

// プレビュー部屋の基準位置 (床の位置: Y = -1000)
const PREVIEW_BASE_POS = new THREE.Vector3(0, -1000, 0);

export default function Player() {
    const rb = useRef();
    const { camera, scene, raycaster } = useThree();
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);

    // Store
    const addLog = useGameStore(state => state.addLog);
    const addGazeLog = useGameStore(state => state.addGazeLog);
    const addSystemLog = useGameStore(state => state.addSystemLog);
    const floor = useGameStore(state => state.floor);
    const roomStartTime = useGameStore(state => state.roomStartTime);
    const isClimbing = useGameStore(state => state.isClimbing);
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const previewTarget = useGameStore(state => state.previewTarget);

    const lastLogTime = useRef(0);
    const lastGazeTime = useRef(0);
    const lastStepTime = useRef(0);
    const lastFloor = useRef(floor);
    const lastHitPoint = useRef(new THREE.Vector3(0, 0, 0));
    const stareCount = useRef(0);

    const isPreviewInitialized = useRef(false);

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        // --- プレビューモード中の処理 ---
        if (isPreviewMode) {
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

            if (!isPreviewInitialized.current) {
                const offset = 4.5; // 壁からの距離
                const camPos = PREVIEW_BASE_POS.clone();
                let lookTarget = PREVIEW_BASE_POS.clone();

                // lookTargetのY初期値を部屋の中央に設定しておく (Y + 5)
                lookTarget.y += 5;

                switch (previewTarget) {
                    case 'front': // 手前(Z+)から
                        camPos.y += 5; // 高さ中央
                        camPos.z += offset;
                        lookTarget.z -= 1;
                        break;
                    case 'back': // 奥(Z-)から
                        camPos.y += 5;
                        camPos.z -= offset;
                        lookTarget.z += 1;
                        break;
                    case 'left': // 左(X-)から
                        camPos.y += 5;
                        camPos.x -= offset;
                        lookTarget.x += 1;
                        break;
                    case 'right': // 右(X+)から
                        camPos.y += 5;
                        camPos.x += offset;
                        lookTarget.x -= 1;
                        break;

                    // 【修正】上下のカメラ位置を部屋の内側に設定
                    case 'up':
                        // 天井ハッチを開けて上に行く = 次の部屋の「床」から侵入する
                        // カメラ位置: 部屋の床付近 (Y=1.5)
                        camPos.y += 1.5;
                        // 視点: やや上を見上げる
                        lookTarget.y = camPos.y + 1;
                        break;

                    case 'down':
                        // 床ハッチを開けて下に行く = 次の部屋の「天井」から侵入する
                        // カメラ位置: 部屋の天井付近 (Y=8.5)
                        camPos.y += 8.5;
                        // 視点: やや下を見下ろす
                        lookTarget.y = camPos.y - 1;
                        break;

                    default:
                        break;
                }

                camera.position.copy(camPos);
                camera.lookAt(lookTarget);
                isPreviewInitialized.current = true;
            }
            return;
        } else {
            isPreviewInitialized.current = false;
        }

        // --- 以下、通常モード ---

        if (floor !== lastFloor.current) {
            rb.current.setTranslation({ x: 0, y: 2, z: 2 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastFloor.current = floor;
            stareCount.current = 0;
            return;
        }

        const { forward, backward, left, right } = getKeys();

        if (isClimbing) {
            rb.current.setGravityScale(0, true);

            const climbVelocity = new THREE.Vector3();
            if (forward) climbVelocity.y += 1;
            if (backward) climbVelocity.y -= 1;

            const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
            cameraRight.y = 0;
            cameraRight.normalize();

            if (left) climbVelocity.add(cameraRight.clone().multiplyScalar(-1));
            if (right) climbVelocity.add(cameraRight);

            climbVelocity.normalize().multiplyScalar(CLIMB_SPEED);

            rb.current.setLinvel({
                x: climbVelocity.x,
                y: climbVelocity.y,
                z: climbVelocity.z
            }, true);

            const pos = rb.current.translation();
            camera.position.set(pos.x, pos.y + 0.7, pos.z);

        } else {
            rb.current.setGravityScale(1, true);

            const velocity = new THREE.Vector3();
            if (forward) velocity.z -= 1;
            if (backward) velocity.z += 1;
            if (left) velocity.x -= 1;
            if (right) velocity.x += 1;

            if (velocity.length() > 0) {
                velocity.normalize().multiplyScalar(MOVE_SPEED).applyQuaternion(camera.quaternion);
            }

            const currentVel = rb.current.linvel();
            velocity.y = currentVel.y;
            rb.current.setLinvel(velocity, true);

            const pos = rb.current.translation();
            camera.position.set(pos.x, pos.y + 0.7, pos.z);

            const horizontalSpeed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
            const isGrounded = Math.abs(currentVel.y) < 0.5;
            if (horizontalSpeed > 1 && isGrounded) {
                if (state.clock.elapsedTime - lastStepTime.current > STEP_INTERVAL) {
                    playStep();
                    lastStepTime.current = state.clock.elapsedTime;
                }
            }
        }

        const pos = rb.current.translation();

        lastLogTime.current += delta;
        if (lastLogTime.current >= LOG_INTERVAL) {
            const vel = rb.current.linvel();
            if (Math.abs(vel.x) > 0.1 || Math.abs(vel.y) > 0.1 || Math.abs(vel.z) > 0.1) {
                addLog({
                    pos: [pos.x, pos.y, pos.z],
                    time: Date.now() - roomStartTime
                });
            }
            lastLogTime.current = 0;
        }

        lastGazeTime.current += delta;
        if (lastGazeTime.current >= GAZE_INTERVAL) {
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
                const hit = intersects.find(obj => obj.object.name !== "player" && obj.object.type !== "GridHelper");

                if (hit && hit.distance < 15) {
                    addGazeLog(hit.point.toArray());

                    const dist = hit.point.distanceTo(lastHitPoint.current);
                    if (dist < 1.0) {
                        stareCount.current += 1;
                    } else {
                        stareCount.current = 0;
                    }
                    lastHitPoint.current.copy(hit.point);

                    if (stareCount.current >= 4) {
                        addSystemLog("GAZE FOCUS DETECTED.");
                        stareCount.current = 0;
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
                position={[0, 2, 2]}
                enabledRotations={[false, false, false]}
                type="dynamic"
            >
                <CapsuleCollider args={[0.75, 0.4]} />
                <mesh name="player" visible={false}>
                    <capsuleGeometry args={[0.4, 1.5]} />
                </mesh>
            </RigidBody>
        </>
    );
}