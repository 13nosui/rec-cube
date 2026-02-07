import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../stores/useGameStore';

export default function Phantom() {
    const meshRef = useRef();
    // 過去の移動ログを取得
    const previousMoveLogs = useGameStore((state) => state.previousMoveLogs);
    const roomStartTime = useGameStore((state) => state.roomStartTime);
    // 現在のテーマカラーを取得
    const themeColor = useGameStore((state) => state.themeColor);

    useFrame(() => {
        // メッシュまたはログがない場合は非表示にして戻る
        if (!meshRef.current || !previousMoveLogs || previousMoveLogs.length < 2) {
            if (meshRef.current) meshRef.current.visible = false;
            return;
        }

        const lastLog = previousMoveLogs[previousMoveLogs.length - 1];
        const maxTime = lastLog.time;
        // ループ全体の長さ（記録時間 + 2秒の待機時間）
        // 2秒間姿を消してから、また最初から再生します
        const loopDuration = maxTime + 2000;

        const currentTime = (Date.now() - roomStartTime) % loopDuration;

        // 記録時間を過ぎている場合（待機時間中）は非表示にする
        // これで「消えなくなった（固まったままになる）」問題を解決
        if (currentTime > maxTime) {
            meshRef.current.visible = false;
            return;
        }

        // 再生中は表示オン
        meshRef.current.visible = true;

        // --- スムーズな移動（線形補間） ---

        // 現在の時間の「直後」にあるログを探す
        let nextIndex = previousMoveLogs.findIndex(log => log.time > currentTime);

        // 端の処理：見つからない場合や先頭の場合は調整
        if (nextIndex === -1) nextIndex = previousMoveLogs.length - 1;
        if (nextIndex === 0) nextIndex = 1;

        const prevLog = previousMoveLogs[nextIndex - 1];
        const nextLog = previousMoveLogs[nextIndex];

        // 経過時間の割合（0.0 〜 1.0）を計算
        const timeDiff = nextLog.time - prevLog.time;
        // 0除算防止
        const alpha = timeDiff > 0 ? (currentTime - prevLog.time) / timeDiff : 0;

        // 位置を滑らかに補間
        const x = THREE.MathUtils.lerp(prevLog.pos[0], nextLog.pos[0], alpha);
        // Y軸も含めることで、はしごの昇降も滑らかに再現されます
        const y = THREE.MathUtils.lerp(prevLog.pos[1], nextLog.pos[1], alpha);
        const z = THREE.MathUtils.lerp(prevLog.pos[2], nextLog.pos[2], alpha);

        meshRef.current.position.set(x, y, z);
    });

    // そもそもデータがない場合はレンダリングしない
    if (!previousMoveLogs || previousMoveLogs.length === 0) return null;

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[0.75, 1.8, 0.75]} />
            <meshBasicMaterial
                color={themeColor}
                wireframe={true}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
}