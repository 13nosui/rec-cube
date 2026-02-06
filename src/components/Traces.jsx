import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Traces() {
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const meshRef = useRef();

    // ログデータが変わったら、インスタンス（分身）の位置を更新する
    useLayoutEffect(() => {
        if (!meshRef.current || previousMoveLogs.length === 0) return;

        const tempObject = new THREE.Object3D();

        previousMoveLogs.forEach((pos, index) => {
            // position: [x, y, z]
            // 床より少しだけ浮かせる (y + 0.02)
            tempObject.position.set(pos[0], 0.02, pos[2]);

            // 床に寝かせる
            tempObject.rotation.x = -Math.PI / 2;

            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(index, tempObject.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [previousMoveLogs]);

    // データがない時は何も描画しない
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