import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid } from '@react-three/drei';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

// --- プレビュー用: 亡霊コンポーネント ---
const PreviewPhantom = ({ type }) => {
    const meshRef = useRef();
    const cameraTarget = useGameStore(state => state.previewTarget);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;
        const t = clock.elapsedTime;

        if (type === 'GHOST_FAST') {
            // 異常: 高速移動
            const speed = 15;
            meshRef.current.position.x = Math.sin(t * speed) * 4;
            meshRef.current.position.z = Math.cos(t * speed) * 4;
            meshRef.current.position.y = 0.9 + Math.sin(t * 20) * 0.2;
            meshRef.current.rotation.y = -t * speed;
        }
        else if (type === 'GHOST_STARE') {
            // 異常: 凝視
            meshRef.current.position.set(0, 0.9, 0);

            let lookAtPos = new THREE.Vector3(0, 0.9, 0);
            const dist = 10;
            if (cameraTarget === 'front') lookAtPos.z += dist;
            else if (cameraTarget === 'back') lookAtPos.z -= dist;
            else if (cameraTarget === 'left') lookAtPos.x -= dist;
            else if (cameraTarget === 'right') lookAtPos.x += dist;
            else if (cameraTarget === 'up') lookAtPos.y -= dist;
            else if (cameraTarget === 'down') lookAtPos.y += dist;

            meshRef.current.lookAt(lookAtPos);
        }
        else {
            // 正常: ゆったり移動
            meshRef.current.position.x = Math.sin(t * 0.8) * 2;
            meshRef.current.position.z = Math.cos(t * 0.8) * 2;
            meshRef.current.position.y = 0.9 + Math.sin(t * 2) * 0.15;

            const targetX = Math.sin((t + 0.1) * 0.8) * 2;
            const targetZ = Math.cos((t + 0.1) * 0.8) * 2;
            meshRef.current.lookAt(targetX, 0.9, targetZ);
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0.9, 0]}>
            <boxGeometry args={[0.75, 1.8, 0.75]} />
            <meshBasicMaterial
                color="#222222"
                transparent
                opacity={0.85}
            />
        </mesh>
    );
};

// --- プレビュー用: 目のコンポーネント ---
const PreviewEyes = ({ isAnomaly }) => {
    const count = isAnomaly ? 80 : 0;

    const eyes = useMemo(() => {
        return new Array(count).fill(0).map((_, i) => {
            const side = Math.floor(Math.random() * 4);
            const pos = new THREE.Vector3();
            const rot = new THREE.Euler();
            const offset = 4.8;

            if (side === 0) { pos.set(Math.random() * 8 - 4, Math.random() * 8 + 1, -offset); rot.y = 0; }
            else if (side === 1) { pos.set(Math.random() * 8 - 4, Math.random() * 8 + 1, offset); rot.y = Math.PI; }
            else if (side === 2) { pos.set(-offset, Math.random() * 8 + 1, Math.random() * 8 - 4); rot.y = Math.PI / 2; }
            else { pos.set(offset, Math.random() * 8 + 1, Math.random() * 8 - 4); rot.y = -Math.PI / 2; }

            return { pos, rot, scale: 0.8 + Math.random() * 0.5 };
        });
    }, [count, isAnomaly]);

    if (count === 0) return null;

    return (
        <group>
            {eyes.map((eye, i) => (
                <group key={i} position={eye.pos} rotation={eye.rot} scale={eye.scale}>
                    <mesh position={[0, 0, 0]}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    <mesh position={[0, 0, 0.12]}>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial color="black" />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

// --- プレビュー用の部屋コンポーネント ---
const PreviewRoom = () => {
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const nextRoomStatus = useGameStore(state => state.nextRoomStatus);
    const anomalyType = useGameStore(state => state.anomalyType);

    const position = [0, -1000, 0];
    const size = 10;
    const nextThemeColor = "#ffffff";

    const showPhantom = useMemo(() => {
        if (nextRoomStatus === 'SAFE') return Math.random() < 0.5;
        // 【修正】nullチェックを追加
        return anomalyType && anomalyType.startsWith('GHOST');
    }, [nextRoomStatus, anomalyType]);

    // 【修正】nullチェックを追加 (または初期値 'NORMAL' を設定)
    const phantomType = nextRoomStatus === 'SAFE' ? 'NORMAL' : (anomalyType || 'NORMAL');
    const showEyes = anomalyType === 'EYES_CLUSTER';

    if (!isPreviewMode) return null;

    return (
        <group position={position}>
            <mesh position={[0, -0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            <mesh position={[0, size + 0.5, 0]}><boxGeometry args={[size, 1, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size, 0]} rotation={[Math.PI, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            <mesh position={[0, size / 2, -size / 2 - 0.5]}><boxGeometry args={[size, size, 1]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size / 2, -size / 2]} rotation={[Math.PI / 2, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            <mesh position={[0, size / 2, size / 2 + 0.5]}><boxGeometry args={[size, size, 1]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[0, size / 2, size / 2]} rotation={[-Math.PI / 2, 0, 0]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            <mesh position={[-size / 2 - 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[-size / 2, size / 2, 0]} rotation={[0, 0, -Math.PI / 2]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            <mesh position={[size / 2 + 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshBasicMaterial color="#000000" /></mesh>
            <Grid position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            {showPhantom && <PreviewPhantom type={phantomType} />}
            <PreviewEyes isAnomaly={showEyes} />

        </group>
    );
};

// ... 以下、GridPlane, Ladder, Hatch, Levelコンポーネントは省略 (変更なし) ...
// (実際の更新時はLevel.jsx全体を反映させてください)
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
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const confirmMovement = useGameStore(state => state.confirmMovement);
    const exitPreviewMode = useGameStore(state => state.exitPreviewMode);

    useEffect(() => {
        if (!isPreviewMode) return;
        const handlePreviewKeys = (e) => {
            if (e.code === 'Space' || e.key === 'Enter') {
                confirmMovement();
            } else if (e.code === 'KeyX' || e.key === 'Escape' || e.key === 'Backspace') {
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