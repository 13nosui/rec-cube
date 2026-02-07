import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../stores/useGameStore';
import * as THREE from 'three';

export default function Phantom() {
    const previousMoveLogs = useGameStore(state => state.previousMoveLogs);
    const roomStartTime = useGameStore(state => state.roomStartTime);
    const meshRef = useRef();

    // 身長（高さ）を定義
    const PHANTOM_HEIGHT = 1.8;

    const material = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#00ffff',
        wireframe: true,
        transparent: true,
        opacity: 0.6
    }), []);

    const geometry = useMemo(() => new THREE.BoxGeometry(0.75, PHANTOM_HEIGHT, 0.75), []);

    useEffect(() => {
        console.log("Phantom Data:", previousMoveLogs?.length);
    }, [previousMoveLogs]);

    useFrame(() => {
        if (!meshRef.current) return;

        if (!previousMoveLogs || previousMoveLogs.length < 2) {
            meshRef.current.visible = false;
            return;
        }

        if (Array.isArray(previousMoveLogs[0])) {
            meshRef.current.visible = false;
            return;
        }

        const playbackTime = Date.now() - roomStartTime;
        const lastLog = previousMoveLogs[previousMoveLogs.length - 1];

        if (playbackTime > lastLog.time) {
            meshRef.current.visible = false;
            return;
        }

        let nextIndex = previousMoveLogs.findIndex(log => log.time > playbackTime);

        if (nextIndex <= 0) {
            const startPos = previousMoveLogs[0].pos;
            if (startPos) {
                // 【修正】初期位置：足元(y=0)に接地させるため、中心を height/2 に設定
                meshRef.current.position.set(startPos[0], PHANTOM_HEIGHT / 2, startPos[2]);
                meshRef.current.visible = true;
            }
            return;
        }

        const prevLog = previousMoveLogs[nextIndex - 1];
        const nextLog = previousMoveLogs[nextIndex];

        if (prevLog && nextLog && prevLog.pos && nextLog.pos) {
            const duration = nextLog.time - prevLog.time;
            const elapsed = playbackTime - prevLog.time;
            const alpha = duration > 0 ? Math.max(0, Math.min(1, elapsed / duration)) : 0;

            // X, Z 座標は補間する
            const x = THREE.MathUtils.lerp(prevLog.pos[0], nextLog.pos[0], alpha);
            const z = THREE.MathUtils.lerp(prevLog.pos[2], nextLog.pos[2], alpha);

            // 【修正】Y座標はログを使わず、「足元が接地する高さ」に固定する
            // Boxの中心が原点なので、足元を y=0 に合わせるには、中心を height/2 に持ち上げる
            const y = PHANTOM_HEIGHT / 2;

            meshRef.current.position.set(x, y, z);
            meshRef.current.visible = true;
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry} material={material} />
    );
}