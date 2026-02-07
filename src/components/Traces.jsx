import { useRef, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Traces() {
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const floor = useGameStore((state) => state.floor);
    const meshRef = useRef();

    // 進行度: 0.0 -> 1.0
    const rawIntensity = Math.min((floor - 1) / 10, 1.0);
    // 【修正】二次曲線を使うことで、序盤の変化を緩やかに（繊細に）する
    const intensity = Math.pow(rawIntensity, 2);

    const visibleLogs = useMemo(() => {
        if (!previousMoveLogs || previousMoveLogs.length === 0) return [];

        // 【修正】出現率: 1% (序盤) 〜 100% (終盤)
        // 最初は本当にごくわずかしか残りません
        const showRatio = 0.01 + (intensity * 0.99);

        return previousMoveLogs.filter(() => Math.random() < showRatio);
    }, [previousMoveLogs, intensity]);

    useLayoutEffect(() => {
        if (!meshRef.current || visibleLogs.length === 0) return;

        const tempObject = new THREE.Object3D();

        // 【修正】サイズ: 0.2倍 (極小) 〜 1.0倍 (通常)
        const scale = 0.2 + (rawIntensity * 0.8);

        visibleLogs.forEach((log, index) => {
            let position = null;
            if (Array.isArray(log)) {
                position = log;
            } else if (log && log.pos) {
                position = log.pos;
            }

            if (position && position.length === 3) {
                tempObject.position.set(position[0], 0.02, position[2]);
                tempObject.rotation.x = -Math.PI / 2;
                tempObject.rotation.z = Math.random() * Math.PI * 2;
                tempObject.scale.setScalar(scale);

                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(index, tempObject.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [visibleLogs, rawIntensity]);

    if (visibleLogs.length === 0) return null;

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, visibleLogs.length]}
        >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
                color="#8b0000"
                transparent
                // 【修正】不透明度: 0.1 (ほぼ見えない) 〜 0.6 (そこそこ見える)
                opacity={0.1 + (rawIntensity * 0.5)}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </instancedMesh>
    );
}