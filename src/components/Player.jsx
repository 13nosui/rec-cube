import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';

const MOVE_SPEED = 5;

export default function Player() {
    const rb = useRef();
    const [, getKeys] = useKeyboardControls();
    const [isLocked, setIsLocked] = useState(false);

    useFrame((state, delta) => {
        if (!rb.current || !isLocked) return;

        const { forward, backward, left, right } = getKeys();

        const velocity = new THREE.Vector3();
        if (forward) velocity.z -= 1;
        if (backward) velocity.z += 1;
        if (left) velocity.x -= 1;
        if (right) velocity.x += 1;

        velocity.normalize().multiplyScalar(MOVE_SPEED).applyQuaternion(state.camera.quaternion);

        // Lock vertical movement
        velocity.y = 0;

        const currentVelocity = rb.current.linvel();
        rb.current.setLinvel({
            x: velocity.x,
            y: currentVelocity.y, // Maintain gravity
            z: velocity.z
        }, true);

        // Sync camera with rigid body position
        const pos = rb.current.translation();
        state.camera.position.set(pos.x, pos.y + 0.7, pos.z);
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
