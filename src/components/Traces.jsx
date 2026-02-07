import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Traces() {
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const meshRef = useRef();

    useLayoutEffect(() => {
        if (!meshRef.current || !previousMoveLogs || previousMoveLogs.length === 0) return;

        const tempObject = new THREE.Object3D();

        previousMoveLogs.forEach((log, index) => {
            // 配列かオブジェクトかを判別して座標を取り出す
            let position = null;
            if (Array.isArray(log)) {
                position = log;
            } else if (log && log.pos) {
                position = log.pos;
            }

            if (position && position.length === 3) {
                tempObject.position.set(position[0], 0.02, position[2]);
                tempObject.rotation.x = -Math.PI / 2;
                tempObject.updateMatrix();
                meshRef.current.setMatrixAt(index, tempObject.matrix);
            }
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [previousMoveLogs]);

    if (!previousMoveLogs || previousMoveLogs.length === 0) return null;

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, previousMoveLogs.length]}
        >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial
                color="red"
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
            />
        </instancedMesh>
    );
}