import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGameStore } from '../stores/useGameStore';

const MOVE_SPEED = 5;
const LOG_INTERVAL = 0.2; // log every 0.2 seconds

export default function Player() {
    const rb = useRef();
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);
    const addLog = useGameStore((state) => state.addLog);
    const lastLogTime = useRef(0);

    // Sync state for teleportation
    const floor = useGameStore(state => state.floor);
    const lastFloor = useRef(floor);

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        // Handle Teleportation detection (if floor changed)
        if (floor !== lastFloor.current) {
            rb.current.setTranslation({ x: 0, y: 2, z: 0 }, true);
            rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            lastFloor.current = floor;
            return;
        }

        const { forward, backward, left, right } = getKeys();

        const velocity = new THREE.Vector3();
        if (forward) velocity.z -= 1;
        if (backward) velocity.z += 1;
        if (left) velocity.x -= 1;
        if (right) velocity.x += 1;

        velocity.normalize().multiplyScalar(MOVE_SPEED).applyQuaternion(state.camera.quaternion);
        velocity.y = 0;

        const currentVelocity = rb.current.linvel();
        rb.current.setLinvel({
            x: velocity.x,
            y: currentVelocity.y,
            z: velocity.z
        }, true);

        const pos = rb.current.translation();
        state.camera.position.set(pos.x, pos.y + 0.7, pos.z);

        // Logging movement
        lastLogTime.current += delta;
        if (lastLogTime.current >= LOG_INTERVAL) {
            // Only log if moving
            if (velocity.lengthSq() > 0.01) {
                addLog([pos.x, pos.y, pos.z]);
            }
            lastLogTime.current = 0;
        }
    });

    return (
        <>
            <PointerLockControls onLock={() => setIsLocked(true)} onUnlock={() => setIsLocked(false)} />
            <RigidBody
                ref={rb}
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
