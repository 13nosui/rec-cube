import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';

import Player from './components/Player';
import Level from './components/Level';
import UI from './components/UI';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
];

function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={1}
        camera={{ fov: 45 }}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <Level />
          </Physics>
        </Suspense>

        <ambientLight intensity={0.5} />
        <pointLight position={[0, 5, 0]} intensity={1} />
      </Canvas>
      <UI />
    </KeyboardControls>
  );
}

export default App;
