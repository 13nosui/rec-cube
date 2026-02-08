import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Grid, Instance, Instances } from '@react-three/drei';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

// --- 破壊エフェクト（赤いワイヤーボクセルの飛散） ---
const ShatterEffect = ({ position }) => {
    const particleCount = 40;
    const spawnY = position?.y !== undefined ? position.y : (position?.[1] || 0);
    const particles = useMemo(() => {
        return new Array(particleCount).fill(0).map(() => ({
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 5 + 4, // 少し上に跳ねる
                (Math.random() - 0.5) * 5
            ),
            rotation: new THREE.Vector3(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            ),
            scale: 0.1 + Math.random() * 0.1
        }));
    }, []);

    const meshRef = useRef();

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // 子要素（Instances）の更新はやや複雑なので、
        // ここでは簡易的に個別のmeshをレンダリングするか、
        // あるいはgroup内のchildrenを操作する
        meshRef.current.children.forEach((child, i) => {
            const p = particles[i];

            // 重力
            p.velocity.y -= 9.8 * delta;

            // 位置更新
            child.position.add(p.velocity.clone().multiplyScalar(delta));

            // 回転
            // child.rotation.x += p.rotation.x * delta;
            // child.rotation.y += p.rotation.y * delta;

            // ボクセルの中心から底面までの距離（geometryが1x1x1なので scale / 2）
            const halfHeight = p.scale / 2;

            // 地面衝突 (簡易)
            if (child.position.y - halfHeight < -spawnY) {
                child.position.y = -spawnY + halfHeight; // 床の位置に補正
                p.velocity.y *= -0.1; // バウンド係数
                p.velocity.x *= 0.8; // 摩擦
                p.velocity.z *= 0.8; // 摩擦
            }
        });
    });

    return (
        <group position={position} ref={meshRef}>
            {particles.map((p, i) => (
                <mesh key={i} scale={p.scale}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial color="#ff0000" wireframe={true} />
                </mesh>
            ))}
        </group>
    );
};

// --- プレビュー用: デコイ（身代わり）コンポーネント ---
const PreviewPhantom = () => {
    const meshRef = useRef();
    const decoyLogs = useGameStore(state => state.decoyLogs);
    const nextRoomStatus = useGameStore(state => state.nextRoomStatus);

    // デコイ再生用のローカル時間
    const [playbackTime, setPlaybackTime] = useState(0);
    // デコイが「死んだ」かどうか
    const [isDead, setIsDead] = useState(false);

    // 死亡タイミング
    const deathTime = useMemo(() => {
        if (nextRoomStatus !== 'ANOMALY') return Infinity;
        if (!decoyLogs || decoyLogs.length === 0) return 0;

        const maxTime = decoyLogs[decoyLogs.length - 1].time;
        // 録画時間の 30% 〜 70% の間のどこかで死ぬ
        return maxTime * (0.3 + Math.random() * 0.4);
    }, [nextRoomStatus, decoyLogs]);

    useFrame((state, delta) => {
        if (!meshRef.current || !decoyLogs || decoyLogs.length < 2) return;
        if (isDead) return;

        let newTime = playbackTime + (delta * 1000);

        // 異常発生時刻を超えたら死亡
        if (newTime > deathTime) {
            setIsDead(true);
            return;
        }

        const lastLog = decoyLogs[decoyLogs.length - 1];
        if (newTime > lastLog.time) {
            newTime = 0; // ループ
        }
        setPlaybackTime(newTime);

        // 位置補間
        let nextIndex = decoyLogs.findIndex(log => log.time > newTime);
        if (nextIndex === -1) nextIndex = decoyLogs.length - 1;
        if (nextIndex === 0) nextIndex = 1;

        const prevLog = decoyLogs[nextIndex - 1];
        const nextLog = decoyLogs[nextIndex];

        const timeDiff = nextLog.time - prevLog.time;
        const alpha = timeDiff > 0 ? (newTime - prevLog.time) / timeDiff : 0;

        const x = THREE.MathUtils.lerp(prevLog.pos[0], nextLog.pos[0], alpha);
        const y = THREE.MathUtils.lerp(prevLog.pos[1], nextLog.pos[1], alpha);
        const z = THREE.MathUtils.lerp(prevLog.pos[2], nextLog.pos[2], alpha);

        meshRef.current.position.set(x, y, z);
        meshRef.current.lookAt(nextLog.pos[0], y, nextLog.pos[2]);
    });

    if (!decoyLogs || decoyLogs.length === 0) return null;

    if (isDead) {
        // 死亡時は本体を隠し、破壊エフェクトを表示
        return (
            <ShatterEffect position={meshRef.current ? meshRef.current.position : [0, 0, 0]} />
        );
    }

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[0.75, 0.75, 1.8]} />
            <meshBasicMaterial
                color="#00ff00"
                wireframe={true}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};

// --- プレビュー用の部屋コンポーネント ---
const PreviewRoom = () => {
    const isPreviewMode = useGameStore(state => state.isPreviewMode);
    const nextRoomStatus = useGameStore(state => state.nextRoomStatus);
    const decoyLogs = useGameStore(state => state.decoyLogs);
    const floor = useGameStore(state => state.floor);

    const position = [0, -1000, 0];
    const size = 10;
    const nextThemeColor = "#444444";

    // Floor 1以外で、ログがない場合のみ警告を表示する
    const showWarning = floor > 1 && (!decoyLogs || decoyLogs.length === 0);

    if (!isPreviewMode) return null;

    return (
        <group position={position}>
            {/* 部屋の構造 */}
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
            <mesh position={[size / 2 + 0.5, size / 2, 0]}><boxGeometry args={[1, size, size]} /><meshStandardMaterial color="#000000" /></mesh>
            <Grid position={[size / 2, size / 2, 0]} rotation={[0, 0, Math.PI / 2]} args={[10, 10]} cellColor={nextThemeColor} sectionColor={nextThemeColor} />

            {/* 【修正】デコイ表示：Floor 1（最初の部屋）では表示しない */}
            {floor > 1 && <PreviewPhantom />}

            {/* データなし警告 (Floor 2以降のみ表示) */}
            {showWarning && (
                <group position={[0, 2, 0]}>
                    <mesh>
                        <boxGeometry args={[3, 1, 0.1]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                </group>
            )}
        </group>
    );
};

// ... (以下、GridPlane, Ladder, Hatch, Levelコンポーネントは既存のまま) ...
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