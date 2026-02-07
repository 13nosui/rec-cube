import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls } from '@react-three/drei';
import { Suspense } from 'react';

// コンポーネントのインポート
import Player from './components/Player';
import Level from './components/Level';
import UI from './components/UI';
import Traces from './components/Traces';
import Phantom from './components/Phantom';
import LogProjection from './components/LogProjection';
import Eyes from './components/Eyes';

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
    { name: 'interact', keys: ['KeyE', 'e', 'E'] }, // ← 追加: Eキー
  ];

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        camera={{ fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={1}
      >
        <color attach="background" args={['#000000']} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.8, 0]}>
            <Player />
            <Level />

            {/* --- 恐怖の記録たち --- */}
            <Traces />
            <Phantom />
            <LogProjection />
            <Eyes />

          </Physics>
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
      <UI />
    </KeyboardControls>
  );
}