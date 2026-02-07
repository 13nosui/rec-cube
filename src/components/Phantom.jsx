import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/useGameStore';

export default function Phantom() {
    const meshRef = useRef();
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const roomStartTime = useGameStore((state) => state.roomStartTime);

    useFrame(() => {
        if (!meshRef.current || previousMoveLogs.length === 0) return;

        const playbackTime = Date.now() - roomStartTime;

        // Find the bracket
        let nextIndex = previousMoveLogs.findIndex(log => log.time > playbackTime);

        if (nextIndex === -1) {
            // Reached the end
            const lastLog = previousMoveLogs[previousMoveLogs.length - 1];
            meshRef.current.position.set(...lastLog.pos);
            meshRef.current.visible = false; // Hide when finished
            return;
        }

        meshRef.current.visible = true;

        if (nextIndex === 0) {
            meshRef.current.position.set(...previousMoveLogs[0].pos);
            return;
        }

        const prevLog = previousMoveLogs[nextIndex - 1];
        const nextLog = previousMoveLogs[nextIndex];

        // Interpolate
        const alpha = (playbackTime - prevLog.time) / (nextLog.time - prevLog.time);

        const lerpPos = [
            THREE.MathUtils.lerp(prevLog.pos[0], nextLog.pos[0], alpha),
            THREE.MathUtils.lerp(prevLog.pos[1], nextLog.pos[1], alpha),
            THREE.MathUtils.lerp(prevLog.pos[2], nextLog.pos[2], alpha)
        ];

        meshRef.current.position.set(...lerpPos);
    });

    if (previousMoveLogs.length === 0) return null;

    return (
        <group>
            {/* The Body */}
            <mesh ref={meshRef}>
                <boxGeometry args={[0.75, 1.8, 0.75]} />
                <meshPhysicalMaterial
                    transparent
                    opacity={0.3}
                    transmission={0.8}
                    thickness={0.5}
                    roughness={0}
                    color="#a0f0ff"
                    wireframe={false}
                />
            </mesh>
            {/* Wireframe Overlay for extra "tech" look */}
            <mesh position={meshRef.current?.position} visible={meshRef.current?.visible}>
                <boxGeometry args={[0.76, 1.81, 0.76]} />
                <meshBasicMaterial wireframe color="#00ffff" transparent opacity={0.2} />
            </mesh>
        </group>
    );
}
