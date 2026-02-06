import { RigidBody } from '@react-three/rapier';
import { Grid } from '@react-three/drei';

const GridPlane = ({ position, rotation }) => (
    <Grid
        position={position}
        rotation={rotation}
        args={[10, 10]}
        sectionSize={10}
        sectionThickness={1.5}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#ffffff"
        sectionColor="#ffffff"
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={false}
    />
);

export default function Level() {
    const size = 10;

    return (
        <group>
            {/* Floor */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, 0, 0]} rotation={[0, 0, 0]} />
            </RigidBody>

            {/* Ceiling */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size + 0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, size, 0]} rotation={[Math.PI, 0, 0]} />
            </RigidBody>

            {/* Walls */}
            {/* North (z = -5) */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, -size / 2 - 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} />
            </RigidBody>

            {/* South (z = 5) */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, size / 2 + 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} />
            </RigidBody>

            {/* West (x = -5) */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-size / 2 - 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} />
            </RigidBody>

            {/* East (x = 5) */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[size / 2 + 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} />
            </RigidBody>

            {/* Hatch Markers */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#000000" />
                <Grid args={[2, 2]} cellSize={1} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="white" sectionColor="white" fadeDistance={50} />
            </mesh>
            <mesh position={[0, size - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#000000" />
                <Grid args={[2, 2]} cellSize={1} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="white" sectionColor="white" fadeDistance={50} />
            </mesh>
        </group>
    );
}
