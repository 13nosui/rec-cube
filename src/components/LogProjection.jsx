import { Text } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';
import { useMemo } from 'react';
import * as THREE from 'three';

const MESSAGES = [
    "OBSERVED", "HESITATION", "RECORDED", "ERROR: SUBJECT",
    "NO ESCAPE", "WATCHING", "DATA: CORRUPT", "WHERE ARE YOU?"
];

export default function LogProjection() {
    const previousGazeLogs = useGameStore(state => state.previousGazeLogs);
    const floor = useGameStore(state => state.floor);

    const projections = useMemo(() => {
        if (!previousGazeLogs || previousGazeLogs.length === 0) return [];

        // 重くなりすぎないように間引く
        const logs = previousGazeLogs.length > 20
            ? previousGazeLogs.filter((_, i) => i % Math.ceil(previousGazeLogs.length / 20) === 0)
            : previousGazeLogs;

        return logs.map((point, i) => {
            const msg = Math.random() > 0.5
                ? MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
                : `[${point[0].toFixed(1)}, ${point[1].toFixed(1)}]`;

            const size = 0.2 + (floor * 0.05);
            const pos = new THREE.Vector3(point[0], point[1], point[2]);
            const lookAt = new THREE.Vector3(0, 1.7, 0);
            pos.lerp(lookAt, 0.05);

            return { pos, msg, size, lookAt, key: i };
        });
    }, [previousGazeLogs, floor]);

    return (
        <group>
            {projections.map(({ pos, msg, size, lookAt, key }) => (
                <Text
                    key={key}
                    position={pos}
                    fontSize={size}
                    color={Math.random() > 0.8 ? "red" : "white"}
                    // fontプロパティを削除（デフォルトフォントを使用）
                    anchorX="center"
                    anchorY="middle"
                    onSync={(mesh) => mesh.lookAt(lookAt)}
                >
                    {msg}
                </Text>
            ))}
        </group>
    );
}