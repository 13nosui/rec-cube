import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';

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
    const nextRoom = useGameStore((state) => state.nextRoom);

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
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, -size / 2 - 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} />
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, size / 2 + 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} />
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-size / 2 - 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} />
            </RigidBody>

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[size / 2 + 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
                <GridPlane position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} />
            </RigidBody>

            {/* Hatch Markers & Sensors */}
            <group>
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2, 2]} />
                    <meshStandardMaterial color="#000000" />
                    <Grid args={[2, 2]} cellSize={1} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="white" sectionColor="white" fadeDistance={50} />
                </mesh>
                <CuboidCollider
                    sensor
                    args={[1, 0.5, 1]}
                    position={[0, 0.25, 0]}
                    onIntersectionEnter={() => {
                        console.log("Room Advanced");
                        nextRoom();
                    }}
                />
            </group>

            <group>
                <mesh position={[0, size - 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2, 2]} />
                    <meshStandardMaterial color="#000000" />
                    <Grid args={[2, 2]} cellSize={1} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="white" sectionColor="white" fadeDistance={50} />
                </mesh>
                <CuboidCollider
                    sensor
                    args={[1, 0.5, 1]}
                    position={[0, size - 0.25, 0]}
                    onIntersectionEnter={() => {
                        console.log("Room Advanced");
                        nextRoom();
                    }}
                />
            </group>
        </group>
    );
}
