import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import { TreeMorphState } from '../types';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import * as THREE from 'three';

interface SceneProps {
  treeState: TreeMorphState;
}

const Scene: React.FC<SceneProps> = ({ treeState }) => {
  return (
    <Canvas
      dpr={[1, 2]} 
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
        powerPreference: "high-performance"
      }}
    >
      <PerspectiveCamera makeDefault position={[0, 2, 30]} fov={40} />
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minDistance={15} 
        maxDistance={45} 
        autoRotate 
        autoRotateSpeed={0.8}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 3}
      />

      {/* Lighting & Environment */}
      <Suspense fallback={null}>
         {/* City preset provides rich, high-contrast reflections for metal */}
        <Environment preset="city" blur={1} /> 
      </Suspense>

      <ambientLight intensity={0.1} color="#010a05" />
      
      {/* Key Light (Warm Gold) */}
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.6} 
        penumbra={0.5} 
        intensity={300} 
        color="#ffeebb" 
        castShadow 
      />
      
      {/* Rim Light (Cool/Emerald) */}
      <pointLight position={[-15, 10, -15]} intensity={100} color="#00ffcc" distance={60} decay={2} />
      
      {/* Fill Light (Warm) */}
      <pointLight position={[0, -10, 15]} intensity={50} color="#ffaa00" distance={40} decay={2} />

      {/* Background Starfield */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={1} fade speed={0.5} />

      {/* Scene Content */}
      <group position={[0, -6, 0]}>
        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <Foliage state={treeState} />
          <Ornaments state={treeState} />
        </Float>
      </group>

      {/* Cinematic Post-Processing */}
      <EffectComposer disableNormalPass>
        {/* Intense bloom for the 'Glow' effect on gold/stars */}
        <Bloom 
          luminanceThreshold={0.9} 
          mipmapBlur 
          intensity={2.0} 
          radius={0.4}
        />
        <Vignette eskil={false} offset={0.2} darkness={1.2} />
        <Noise opacity={0.03} /> 
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;