import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

const OMINOUS_STRINGS = [
    "OBSERVED",
    "HESITATION",
    "RECORDED",
    "ERROR: SUBJECT",
    "NO ESCAPE",
];

const center = new THREE.Vector3(0, 1.7, 0);

export default function LogProjection() {
    const previousGazeLogs = useGameStore((state) => state.previousGazeLogs);
    const floor = useGameStore((state) => state.floor);

    const projectedLogs = useMemo(() => {
        if (!previousGazeLogs || previousGazeLogs.length === 0) return [];

        return previousGazeLogs.map((pos, index) => {
            const position = new THREE.Vector3(...pos);

            // Offset slightly towards center to avoid z-fighting
            const offsetPosition = position.clone().multiplyScalar(0.99);

            // Increase size with floor
            const size = 0.3 + floor * 0.05;

            // Random ominous text or coordinate
            let text = OMINOUS_STRINGS[Math.floor(Math.random() * OMINOUS_STRINGS.length)];
            if (Math.random() > 0.7) {
                text = `[X:${pos[0].toFixed(1)}]`;
            }

            return {
                id: index,
                position: offsetPosition,
                text,
                size,
                color: Math.random() > 0.8 ? "red" : "white"
            };
        });
    }, [previousGazeLogs, floor]);

    if (projectedLogs.length === 0) return null;

    return (
        <group>
            {projectedLogs.map((log) => (
                <Text
                    key={log.id}
                    position={log.position}
                    fontSize={log.size}
                    color={log.color}
                    font="monospace"
                    anchorX="center"
                    anchorY="middle"
                    opacity={0.8}
                    transparent
                    onSync={(mesh) => {
                        mesh.lookAt(center);
                    }}
                >
                    {log.text}
                </Text>
            ))}
        </group>
    );
}
