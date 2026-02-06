import { useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

const tempSclera = new THREE.Object3D();
const tempPupil = new THREE.Object3D();
const center = new THREE.Vector3(0, 1.7, 0);

export default function Eyes() {
    const previousGazeLogs = useGameStore((state) => state.previousGazeLogs);
    const scleraRef = useRef();
    const pupilRef = useRef();

    useLayoutEffect(() => {
        if (!scleraRef.current || !pupilRef.current || previousGazeLogs.length === 0) return;

        previousGazeLogs.forEach((pos, index) => {
            const position = new THREE.Vector3(...pos);

            // Sclera (White part)
            tempSclera.position.copy(position);
            tempSclera.lookAt(center);
            tempSclera.updateMatrix();
            scleraRef.current.setMatrixAt(index, tempSclera.matrix);

            // Pupil (Black part)
            // Slightly offset towards the center from the sclera position
            const direction = new THREE.Vector3().subVectors(center, position).normalize();
            tempPupil.position.copy(position).add(direction.multiplyScalar(0.12));
            tempPupil.lookAt(center);
            tempPupil.updateMatrix();
            pupilRef.current.setMatrixAt(index, tempPupil.matrix);
        });

        scleraRef.current.instanceMatrix.needsUpdate = true;
        pupilRef.current.instanceMatrix.needsUpdate = true;
    }, [previousGazeLogs]);

    if (!previousGazeLogs || previousGazeLogs.length === 0) return null;

    return (
        <group>
            {/* Sclera - White Sphere */}
            <instancedMesh
                ref={scleraRef}
                args={[null, null, previousGazeLogs.length]}
            >
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="white" />
            </instancedMesh>

            {/* Pupil - Black Sphere */}
            <instancedMesh
                ref={pupilRef}
                args={[null, null, previousGazeLogs.length]}
            >
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="black" />
            </instancedMesh>
        </group>
    );
}
