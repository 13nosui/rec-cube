import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useGameStore } from '../stores/useGameStore';

// グリッド描画用のコンポーネント（見た目のみ）
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

// ハッチのコンポーネント（壁に配置するセンサー）
const Hatch = ({ position, rotation }) => {
    const nextRoom = useGameStore((state) => state.nextRoom);
    return (
        <group position={position} rotation={rotation}>
            {/* ビジュアル（黒い四角＋赤い枠） */}
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            <Grid args={[2, 2]} cellSize={0.5} cellThickness={2} sectionSize={2} sectionThickness={2} cellColor="red" sectionColor="red" />

            {/* センサー（プレイヤーが触れると次へ進む） */}
            <CuboidCollider
                sensor
                args={[1, 1, 0.5]} // 判定サイズ
                position={[0, 0, 0]}
                onIntersectionEnter={(payload) => {
                    // プレイヤー（name="player"）だけが反応するようにする
                    if (payload.other.rigidBodyObject?.name === "player") {
                        console.log("Entering Next Room...");
                        nextRoom();
                    }
                }}
            />
        </group>
    );
};

export default function Level() {
    const size = 10;
    const availableHatches = useGameStore((state) => state.availableHatches);

    return (
        <group>
            {/* --- 床 (Floor) --- */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, -0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, 0, 0]} rotation={[0, 0, 0]} />

            {/* --- 天井 (Ceiling) --- */}
            <RigidBody type="fixed" colliders="cuboid">
                <mesh position={[0, size + 0.5, 0]}>
                    <boxGeometry args={[size, 1, size]} />
                    <meshStandardMaterial color="#000000" />
                </mesh>
            </RigidBody>
            <GridPlane position={[0, size, 0]} rotation={[Math.PI, 0, 0]} />

            {/* --- 壁 (Walls) --- */}
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

            {/* --- ハッチ (動的生成) --- */}
            {availableHatches >= 1 && <Hatch position={[0, 2, -size / 2 + 0.1]} rotation={[0, 0, 0]} />} {/* 奥 */}
            {availableHatches >= 2 && <Hatch position={[0, 2, size / 2 - 0.1]} rotation={[0, Math.PI, 0]} />} {/* 手前 */}
            {availableHatches >= 3 && <Hatch position={[-size / 2 + 0.1, 2, 0]} rotation={[0, Math.PI / 2, 0]} />} {/* 左 */}
            {availableHatches >= 4 && <Hatch position={[size / 2 - 0.1, 2, 0]} rotation={[0, -Math.PI / 2, 0]} />} {/* 右 */}
        </group>
    );
}