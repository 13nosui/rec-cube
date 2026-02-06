import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

const tempObject = new THREE.Object3D();

export default function Traces() {
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const meshRef = useRef();

    useMemo(() => {
        if (!meshRef.current || previousMoveLogs.length === 0) return;

        previousMoveLogs.forEach((pos, i) => {
            tempObject.position.set(pos[0], 0.05, pos[2]);
            tempObject.rotation.x = -Math.PI / 2;
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(i, tempObject.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [previousMoveLogs]);

    if (previousMoveLogs.length === 0) return null;

    return (
        <instancedMesh
            ref={meshRef}
            args={[null, null, previousMoveLogs.length]}
        >
            <planeGeometry args={[0.5, 0.5]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.6} />
        </instancedMesh>
    );
}
