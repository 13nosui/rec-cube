import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls } from '@react-three/drei';
import { Suspense } from 'react';
import Player from './components/Player';
import Level from './components/Level';
import UI from './components/UI';
import Traces from './components/Traces';
import Eyes from './components/Eyes';
import Phantom from './components/Phantom';
import LogProjection from './components/LogProjection';

export default function App() {
  const keyboardMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
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
            <Traces />
            <Eyes />
            <Phantom />
            <LogProjection />
          </Physics>
          <ambientLight intensity={0.5} />
        </Suspense>
      </Canvas>
      <UI />
    </KeyboardControls>
  );
}