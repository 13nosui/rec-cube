import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';

// グリッド描画用のコンポーネント
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

// --- はしごコンポーネント ---
const Ladder = ({ position, height = 5, rotation = [0, 0, 0] }) => {
    const setIsClimbing = useGameStore(state => state.setIsClimbing);

    // はしごの「段（ラング）」を生成
    const rungs = useMemo(() => {
        const count = Math.floor(height / 0.4);
        return new Array(count).fill(0).map((_, i) => (
            <mesh key={i} position={[0, -height / 2 + 0.2 + i * 0.4, 0]}>
                <boxGeometry args={[0.6, 0.05, 0.05]} />
                <meshStandardMaterial color="#555" />
            </mesh>
        ));
    }, [height]);

    return (
        <group position={position} rotation={rotation}>
            {/* 視覚的なはしご */}
            <group>
                <mesh position={[-0.35, 0, 0]}>
                    <boxGeometry args={[0.05, height, 0.05]} />
                    <meshStandardMaterial color="#777" />
                </mesh>
                <mesh position={[0.35, 0, 0]}>
                    <boxGeometry args={[0.05, height, 0.05]} />
                    <meshStandardMaterial color="#777" />
                </mesh>
                {rungs}
            </group>

            {/* はしごセンサー */}
            <CuboidCollider
                sensor
                args={[0.4, height / 2, 0.4]}
                position={[0, 0, 0]}
                onIntersectionEnter={(payload) => {
                    if (payload.other.rigidBodyObject?.name === "player") {
                        setIsClimbing(true);
                    }
                }}
                onIntersectionExit={(payload) => {
                    if (payload.other.rigidBodyObject?.name === "player") {
                        setIsClimbing(false);
                    }
                }}
            />
        </group>
    );
};

// ハッチのコンポーネント
const Hatch = ({ position, rotation }) => {
    const nextRoom = useGameStore((state) => state.nextRoom);
    const addSystemLog = useGameStore((state) => state.addSystemLog);
    const [isNear, setIsNear] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isNear && (e.code === 'KeyE' || e.key === 'e' || e.key === 'E')) {
                nextRoom();
                setIsNear(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNear, nextRoom]);

    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            <group position={[0, 0, 0.15]}>
                <mesh>
                    <boxGeometry args={[0.1, 0.8, 0.1]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                </mesh>
                <mesh>
                    <boxGeometry args={[0.8, 0.1, 0.1]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                </mesh>
                <mesh position={[0, 0, -0.05]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* 【修正】センサー範囲を拡大 (args: [x, y, z] = [幅, 高さ, 奥行き]の半分) */}
            {/* 奥行き(z)を 0.5 -> 1.5 に拡大して、はしごの位置まで届くようにする */}
            <CuboidCollider
                sensor
                args={[1.2, 1.2, 1.5]}
                position={[0, 0, 0]}
                onIntersectionEnter={(payload) => {
                    if (payload.other.rigidBodyObject?.name === "player") {
                        setIsNear(true);
                        if (addSystemLog) addSystemLog("PRESS 'E' TO OPEN");
                    }
                }}
                onIntersectionExit={(payload) => {
                    if (payload.other.rigidBodyObject?.name === "player") {
                        setIsNear(false);
                    }
                }}
            />
        </group>
    );
};

export default function Level() {
    const size = 10;

    return (
        <group>
            {/* 部屋の構造 */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[0, 0, 0]} rotation={[0, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size + 0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[0, size, 0]} rotation={[Math.PI, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, -size / 2 - 0.5]}><boxGeometry args={[size, size, 1]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, size / 2 + 0.5]}><boxGeometry args={[size, size, 1]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-size / 2 - 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[size / 2 + 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshStandardMaterial color="#000000" /></mesh>
            </RigidBody>
            <GridPlane position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} />

            {/* ハッチ */}
            <Hatch position={[0, size / 2, -size / 2 + 0.1]} rotation={[0, 0, 0]} />
            <Hatch position={[0, size / 2, size / 2 - 0.1]} rotation={[0, Math.PI, 0]} />
            <Hatch position={[-size / 2 + 0.1, size / 2, 0]} rotation={[0, Math.PI / 2, 0]} />
            <Hatch position={[size / 2 - 0.1, size / 2, 0]} rotation={[0, -Math.PI / 2, 0]} />
            <Hatch position={[0, size - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />
            <Hatch position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} />

            {/* はしご */}
            <Ladder position={[0, 2.5, -4.5]} height={5} />
            <Ladder position={[0, 2.5, 4.5]} height={5} />
            <Ladder position={[-4.5, 2.5, 0]} height={5} rotation={[0, Math.PI / 2, 0]} />
            <Ladder position={[4.5, 2.5, 0]} height={5} rotation={[0, Math.PI / 2, 0]} />
            <Ladder position={[0, 5.0, 0]} height={10} />

        </group>
    );
}