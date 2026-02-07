import { Text } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';
import { useMemo } from 'react';
import * as THREE from 'three';

const MESSAGES = [
    "OBSERVED", "HESITATION", "RECORDED", "ERROR: SUBJECT",
    "NO ESCAPE", "WATCHING", "DATA: CORRUPT", "WHERE ARE YOU?",
    "SIN", "GUILTY", "DON'T LOOK", "IT SEES YOU", "TURN BACK"
];

export default function LogProjection() {
    const previousGazeLogs = useGameStore(state => state.previousGazeLogs);
    const floor = useGameStore(state => state.floor);

    const rawIntensity = Math.min((floor - 1) / 10, 1.0);
    // 【修正】文字数も二次曲線で制御
    const intensity = Math.pow(rawIntensity, 2);

    const projections = useMemo(() => {
        if (!previousGazeLogs || previousGazeLogs.length === 0) return [];

        // 【修正】表示数: 1個 (序盤) 〜 50個 (終盤)
        const maxCount = 1 + Math.floor(intensity * 49);

        const shuffled = [...previousGazeLogs].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, maxCount);

        return selected.map((point, i) => {
            const msg = Math.random() > 0.5
                ? MESSAGES[Math.floor(Math.random() * MESSAGES.length)]
                : `[${point[0].toFixed(1)}, ${point[1].toFixed(1)}]`;

            // 【修正】サイズ: 0.05 (極小) 〜 0.3 (中くらい)
            // 序盤は本当にゴミかドット欠けのように見えます
            const size = 0.05 + (rawIntensity * 0.25);

            const pos = new THREE.Vector3(point[0], point[1], point[2]);
            const lookAt = new THREE.Vector3(0, 1.7, 0);

            pos.lerp(lookAt, 0.05);

            return { pos, msg, size, lookAt, key: i };
        });
    }, [previousGazeLogs, floor, intensity, rawIntensity]);

    return (
        <group>
            {projections.map(({ pos, msg, size, lookAt, key }) => (
                <Text
                    key={key}
                    position={pos}
                    fontSize={size}
                    color={Math.random() > 0.8 ? "red" : "white"}
                    anchorX="center"
                    anchorY="middle"
                    onSync={(troika) => {
                        troika.lookAt(lookAt);
                    }}
                >
                    {msg}
                </Text>
            ))}
        </group>
    );
}