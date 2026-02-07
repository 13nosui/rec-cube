import { useRef, useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

const tempSclera = new THREE.Object3D();
const tempPupil = new THREE.Object3D();
const center = new THREE.Vector3(0, 1.7, 0);

export default function Eyes() {
    const previousGazeLogs = useGameStore((state) => state.previousGazeLogs);
    const floor = useGameStore((state) => state.floor);
    const scleraRef = useRef();
    const pupilRef = useRef();

    const rawIntensity = Math.min((floor - 1) / 10, 1.0);
    // 【修正】目はさらに緩やかに増えるように三次曲線を使用
    const intensity = Math.pow(rawIntensity, 3);

    const visibleLogs = useMemo(() => {
        if (!previousGazeLogs || previousGazeLogs.length === 0) return [];
        // 【修正】出現率: 0.5% 〜 100%
        // 序盤は「見間違いかな？」レベル
        const showRatio = 0.005 + (intensity * 0.995);
        return previousGazeLogs.filter(() => Math.random() < showRatio);
    }, [previousGazeLogs, intensity]);

    useLayoutEffect(() => {
        if (!scleraRef.current || !pupilRef.current || visibleLogs.length === 0) return;

        // 【修正】サイズ: 0.2倍 (非常に小さい) 〜 1.0倍
        const scale = 0.2 + (rawIntensity * 0.8);

        visibleLogs.forEach((pos, index) => {
            const position = new THREE.Vector3(...pos);

            // 白目
            tempSclera.position.copy(position);
            tempSclera.lookAt(center);
            tempSclera.scale.setScalar(scale);
            tempSclera.updateMatrix();
            scleraRef.current.setMatrixAt(index, tempSclera.matrix);

            // 黒目
            const direction = new THREE.Vector3().subVectors(center, position).normalize();
            tempPupil.position.copy(position).add(direction.multiplyScalar(0.12 * scale));
            tempPupil.lookAt(center);
            tempPupil.scale.setScalar(scale);
            tempPupil.updateMatrix();
            pupilRef.current.setMatrixAt(index, tempPupil.matrix);
        });

        scleraRef.current.instanceMatrix.needsUpdate = true;
        pupilRef.current.instanceMatrix.needsUpdate = true;
    }, [visibleLogs, rawIntensity]);

    if (visibleLogs.length === 0) return null;

    return (
        <group>
            <instancedMesh ref={scleraRef} args={[null, null, visibleLogs.length]}>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="white" />
            </instancedMesh>
            <instancedMesh ref={pupilRef} args={[null, null, visibleLogs.length]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="black" />
            </instancedMesh>
        </group>
    );
}