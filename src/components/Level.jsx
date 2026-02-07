import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useState, useEffect } from 'react';
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

// ハッチのコンポーネント
const Hatch = ({ position, rotation }) => {
    const nextRoom = useGameStore((state) => state.nextRoom);
    const addSystemLog = useGameStore((state) => state.addSystemLog);

    // プレイヤーが近くにいるかどうかの状態
    const [isNear, setIsNear] = useState(false);

    // Eキー監視
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
            {/* ベース：黒い板 */}
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* グリッド（赤） */}
            <Grid args={[2, 2]} cellSize={0.5} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="red" sectionColor="red" />

            {/* 【追加】十字の取手（白） */}
            <group position={[0, 0, 0.15]}>
                {/* 縦の棒 */}
                <mesh>
                    <boxGeometry args={[0.1, 0.8, 0.1]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                </mesh>
                {/* 横の棒 */}
                <mesh>
                    <boxGeometry args={[0.8, 0.1, 0.1]} />
                    <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
                </mesh>
                {/* 中心軸 */}
                <mesh position={[0, 0, -0.05]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
            </group>

            {/* センサー */}
            <CuboidCollider
                sensor
                args={[1, 1, 0.5]}
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
    const availableHatches = useGameStore((state) => state.availableHatches) ?? 4;

    return (
        <group>
            {/* 床・天井・壁の定義 */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, 0, 0]} rotation={[0, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size + 0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, size, 0]} rotation={[Math.PI, 0, 0]} />

            {/* 壁 */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, -size / 2 - 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size / 2, size / 2 + 0.5]}>
                    <boxGeometry args={[size, size, 1]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[-size / 2 - 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} />

            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[size / 2 + 0.5, size / 2, 0]}>
                    <boxGeometry args={[1, size, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} />

            {/* ハッチ (動的生成) */}
            {availableHatches >= 1 && <Hatch position={[0, 2, -size / 2 + 0.1]} rotation={[0, 0, 0]} />}
            {availableHatches >= 2 && <Hatch position={[0, 2, size / 2 - 0.1]} rotation={[0, Math.PI, 0]} />}
            {availableHatches >= 3 && <Hatch position={[-size / 2 + 0.1, 2, 0]} rotation={[0, Math.PI / 2, 0]} />}
            {availableHatches >= 4 && <Hatch position={[size / 2 - 0.1, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />}
        </group>
    );
}