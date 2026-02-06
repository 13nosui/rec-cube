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
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);
    const addLog = useGameStore((state) => state.addLog);
    const addGazeLog = useGameStore((state) => state.addGazeLog);
    const lastLogTime = useRef(0);
    const lastGazeTime = useRef(0);
    const floor = useGameStore(state => state.floor);
    const lastFloor = useRef(floor);

    const { camera, scene } = useThree();
    const raycaster = useRef(new THREE.Raycaster());

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        // 部屋移動時のリセット処理
        if (floor !== lastFloor.current) {
            rb.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastFloor.current = floor;
            lastGazeTime.current = 0;
            lastLogTime.current = 0;
            return;
        }

        const { forward, backward, left, right } = getKeys();

        const velocity = new THREE.Vector3();
        if (forward) velocity.z -= 1;
        if (backward) velocity.z += 1;
        if (left) velocity.x -= 1;
        if (right) velocity.x += 1;

        if (velocity.length() > 0) {
            velocity.normalize().multiplyScalar(MOVE_SPEED).applyQuaternion(state.camera.quaternion);
        }
        velocity.y = rb.current.linvel().y;

        rb.current.setLinvel(velocity, true);

        // カメラ位置を同期
        const pos = rb.current.translation();
        state.camera.position.set(pos.x, pos.y + 0.7, pos.z);

        // 移動ログ記録
        lastLogTime.current += delta;
        if (lastLogTime.current >= LOG_INTERVAL) {
            if (velocity.lengthSq() > 0.01) {
                addLog([pos.x, pos.y, pos.z]);
            }
            lastLogTime.current = 0;
        }

        // 注視ログ記録 (Raycasting)
        lastGazeTime.current += delta;
        if (lastGazeTime.current >= GAZE_INTERVAL) {
            raycaster.current.setFromCamera({ x: 0, y: 0 }, camera);
            // Check intersections with the scene (excluding player and possibly some other objects)
            const intersects = raycaster.current.intersectObjects(scene.children, true);

            // Look for the first valid hit (usually a wall, floor or ceiling)
            if (intersects.length > 0) {
                const hit = intersects[0];
                if (hit.distance < 15) {
                    addGazeLog([hit.point.x, hit.point.y, hit.point.z]);
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