import { RigidBody } from '@react-three/rapier';
import { Edges } from '@react-three/drei';

export default function Level() {
    const size = 10;

    return (
        <group>
            {/* Floor */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* Ceiling */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size - 0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* Walls */}
            {/* North */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2 - 0.5, -size / 2 - 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* South */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2 - 0.5, size / 2 + 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* West */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-size / 2 - 0.5, size / 2 - 0.5, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* East */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[size / 2 + 0.5, size / 2 - 0.5, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                    <Edges color="white" />
                </mesh>
            </RigidBody>

            {/* Hatch Markers (Visual only for now) */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#000000" />
                <Edges color="white" />
            </mesh>
            <mesh position={[0, size - 1.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#000000" />
                <Edges color="white" />
            </mesh>
        </group>
    );
}
