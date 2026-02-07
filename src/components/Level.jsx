import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

// --- プレビュー用の部屋コンポーネント ---
const PreviewRoom = () => {
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const nextRoomStatus = useGameStore(state => state.nextRoomStatus);

    // プレビュー部屋の位置 (Y=-1000)
    const position = [0, -1000, 0];
    const size = 10;

    const nextThemeColor = useMemo(() => {
        if (nextRoomStatus === 'ANOMALY') return "#ff0000";
        return "#00ff00";
    }, [nextRoomStatus]);

    if (!isPreviewMode) return null;

    return (
        <group position={position}>
            {/* 床 */}
            <mesh position={[0, -0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
            {/* 天井 */}
            <mesh position={[0, size + 0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size, 0]} rotation={[Math.PI, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
            {/* 壁 */}
            <mesh position={[0, size / 2, -size / 2 - 0.5]}><boxGeometry args={[size, size, 1]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
            <mesh position={[0, size / 2, size / 2 + 0.5]}><boxGeometry args={[size, size, 1]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
            <mesh position={[-size / 2 - 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
            <mesh position={[size / 2 + 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />
        </group>
    );
};

// グリッド描画用
const GridPlane = ({ position, rotation, color = "#ffffff" }) => (
    <Grid
        position={position}
        rotation={rotation}
        args={[10, 10]}
        sectionSize={10}
        sectionThickness={1.5}
        cellSize={0.5}
        cellThickness={1}
        cellColor={color}
        sectionColor={color}
        fadeDistance={50}
        fadeStrength={1}
        infiniteGrid={false}
    />
);

// はしご
const Ladder = ({ position, height = 5, rotation = [0, 0, 0] }) => {
    const setIsClimbing = useGameStore(state => state.setIsClimbing);
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
            <CuboidCollider
                sensor
                args={[0.4, height / 2, 0.4]}
                position={[0, 0, 0]}
                onIntersectionEnter={(p) => p.other.rigidBodyObject?.name === "player" && setIsClimbing(true)}
                onIntersectionExit={(p) => p.other.rigidBodyObject?.name === "player" && setIsClimbing(false)}
            />
        </group>
    );
};

// ハッチ
const Hatch = ({ position, rotation, direction }) => {
    const enterPreviewMode = useGameStore((state) => state.enterPreviewMode);
    const isPreviewMode = useGameStore((state) => state.isPreviewMode);
    const addSystemLog = useGameStore((state) => state.addSystemLog);
    const [isNear, setIsNear] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isNear && !isPreviewMode && (e.code === 'KeyE' || e.key === 'e' || e.key === 'E')) {
                enterPreviewMode(direction);
                addSystemLog("CONNECTING TO CAMERA...");
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isNear, isPreviewMode, enterPreviewMode, direction, addSystemLog]);

    return (
        <group position={position} rotation={rotation}>
            <mesh position={[0, 0, 0.05]}>
                <planeGeometry args={[2, 2]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
            <group position={[0, 0, 0.15]}>
                <mesh><boxGeometry args={[0.1, 0.8, 0.1]} /><meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} /></mesh>
                <mesh><boxGeometry args={[0.8, 0.1, 0.1]} /><meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} /></mesh>
                <mesh position={[0, 0, -0.05]}><cylinderGeometry args={[0.15, 0.15, 0.1, 16]} /><meshStandardMaterial color="#333" /></mesh>
            </group>
            <CuboidCollider
                sensor
                args={[1.2, 1.2, 1.5]}
                position={[0, 0, 0]}
                onIntersectionEnter={(p) => {
                    if (p.other.rigidBodyObject?.name === "player") {
                        setIsNear(true);
                        if (!isPreviewMode && addSystemLog) addSystemLog("PRESS 'E' TO HACK CAMERA");
                    }
                }}
                onIntersectionExit={(p) => {
                    if (p.other.rigidBodyObject?.name === "player") setIsNear(false);
                }}
            />
        </group>
    );
};

export default function Level() {
    const size = 10;
    const themeColor = useGameStore(state => state.themeColor);
    // 【追加】プレビュー操作のためのフック
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const confirmMovement = useGameStore(state => state.confirmMovement);
    const exitPreviewMode = useGameStore(state => state.exitPreviewMode);

    // 【追加】プレビュー中のキー入力監視
    useEffect(() => {
        if (!isPreviewMode) return;

        const handlePreviewKeys = (e) => {
            // Space または Enter で侵入
            if (e.code === 'Space' || e.key === 'Enter') {
                confirmMovement();
            }
            // X, Esc, Backspace でキャンセル
            else if (e.code === 'KeyX' || e.key === 'Escape' || e.key === 'Backspace') {
                exitPreviewMode();
            }
        };

        window.addEventListener('keydown', handlePreviewKeys);
        return () => window.removeEventListener('keydown', handlePreviewKeys);
    }, [isPreviewMode, confirmMovement, exitPreviewMode]);

    return (
        <group>
            <group>
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[0, -0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[0, 0, 0]} rotation={[0, 0, 0]} color={themeColor} />
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[0, size + 0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[0, size, 0]} rotation={[Math.PI, 0, 0]} color={themeColor} />
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[0, size / 2, -size / 2 - 0.5]}><boxGeometry args={[size, size, 1]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} color={themeColor} />
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[0, size / 2, size / 2 + 0.5]}><boxGeometry args={[size, size, 1]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} color={themeColor} />
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[-size / 2 - 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} color={themeColor} />
                <RigidBody type="fixed" colliders="cuboid">
                    <mesh position={[size / 2 + 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshStandardMaterial color="#000000" /></mesh>
                </RigidBody>
                <GridPlane position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} color={themeColor} />

                <Hatch position={[0, size / 2, -size / 2 + 0.1]} rotation={[0, 0, 0]} direction="back" />
                <Hatch position={[0, size / 2, size / 2 - 0.1]} rotation={[0, Math.PI, 0]} direction="front" />
                <Hatch position={[-size / 2 + 0.1, size / 2, 0]} rotation={[0, Math.PI / 2, 0]} direction="left" />
                <Hatch position={[size / 2 - 0.1, size / 2, 0]} rotation={[0, -Math.PI / 2, 0]} direction="right" />
                <Hatch position={[0, size - 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} direction="up" />
                <Hatch position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} direction="down" />

                <Ladder position={[0, 2.5, -4.5]} height={5} />
                <Ladder position={[0, 2.5, 4.5]} height={5} />
                <Ladder position={[-4.5, 2.5, 0]} height={5} rotation={[0, Math.PI / 2, 0]} />
                <Ladder position={[4.5, 2.5, 0]} height={5} rotation={[0, Math.PI / 2, 0]} />
                <Ladder position={[0, 5.0, 0]} height={10} />
            </group>
            <PreviewRoom />
        </group>
    );
}