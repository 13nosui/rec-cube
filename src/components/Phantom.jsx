import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Phantom() {
    const meshRef = useRef();
    // 過去の移動ログを取得
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const roomStartTime = useGameStore((state) => state.roomStartTime);

    // 【削除】テーマカラーはもう使わないので削除
    // const themeColor = useGameStore((state) => state.themeColor);

    useFrame(() => {
        // メッシュまたはログがない場合は非表示にして戻る
        if (!meshRef.current || !previousMoveLogs || previousMoveLogs.length < 2) {
            if (meshRef.current) meshRef.current.visible = false;
            return;
        }

        const lastLog = previousMoveLogs[previousMoveLogs.length - 1];
        const maxTime = lastLog.time;
        // ループ全体の長さ（記録時間 + 2秒の待機時間）
        const loopDuration = maxTime + 2000;

        const currentTime = (Date.now() - roomStartTime) % loopDuration;

        // 記録時間を過ぎている場合（待機時間中）は非表示にする
        if (currentTime > maxTime) {
            meshRef.current.visible = false;
            return;
        }

        // 再生中は表示オン
        meshRef.current.visible = true;

        // --- スムーズな移動（線形補間） ---
        let nextIndex = previousMoveLogs.findIndex(log => log.time > currentTime);

        if (nextIndex === -1) nextIndex = previousMoveLogs.length - 1;
        if (nextIndex === 0) nextIndex = 1;

        const prevLog = previousMoveLogs[nextIndex - 1];
        const nextLog = previousMoveLogs[nextIndex];

        const timeDiff = nextLog.time - prevLog.time;
        const alpha = timeDiff > 0 ? (currentTime - prevLog.time) / timeDiff : 0;

        const x = THREE.MathUtils.lerp(prevLog.pos[0], nextLog.pos[0], alpha);
        const y = THREE.MathUtils.lerp(prevLog.pos[1], nextLog.pos[1], alpha);
        const z = THREE.MathUtils.lerp(prevLog.pos[2], nextLog.pos[2], alpha);

        meshRef.current.position.set(x, y, z);
    });

    // そもそもデータがない場合はレンダリングしない
    if (!previousMoveLogs || previousMoveLogs.length === 0) return null;

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[0.75, 1.8, 0.75]} />
            {/* 【修正】黒い塗りのマテリアルに変更 */}
            <meshBasicMaterial
                color="#000000"  // 黒
                wireframe={false} // 塗りつぶし
                transparent
                opacity={0.8}     // 濃い影のようにする
            />
        </mesh>
    );
}