import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { generateFoliageData } from '../utils/geometry';
import { easing } from 'maath';

// Shader for the magical luxury look
const vertexShader = `
  uniform float uTime;
  uniform float uProgress; // 0 = Scatter, 1 = Tree
  uniform float uPixelRatio;

  attribute vec3 aScatterPos;
  attribute vec3 aTreePos;
  attribute float aRandom;

  varying float vAlpha;
  varying vec3 vColor;

  // Palette
  const vec3 colorDeep = vec3(0.005, 0.1, 0.05); // Very Deep Jungle Green
  const vec3 colorMid = vec3(0.0, 0.3, 0.15);    // Rich Emerald
  const vec3 colorGold = vec3(1.0, 0.9, 0.4);    // Bright Gold

  void main() {
    // Cubic bezier ease for smoother morph
    float t = uProgress;
    
    // Non-linear transition for particles to arrive at different times slightly
    float localProgress = smoothstep(0.0, 1.0, (t - aRandom * 0.1) / 0.9);
    
    vec3 pos = mix(aScatterPos, aTreePos, localProgress);
    
    // Breathing animation (Tree State)
    if (t > 0.8) {
       float breathe = sin(uTime * 1.5 + pos.y * 0.5) * 0.03 * (t - 0.8);
       pos += normalize(pos) * breathe;
    }

    // Floating animation (Scatter State)
    if (t < 0.5) {
       float floatScale = (1.0 - t * 2.0);
       pos.y += sin(uTime * 0.5 + aRandom * 100.0) * 0.2 * floatScale;
       pos.x += cos(uTime * 0.3 + aRandom * 50.0) * 0.1 * floatScale;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation
    // Scale up slightly for luxury fullness
    gl_PointSize = (50.0 * aRandom + 30.0) * (1.0 / -mvPosition.z) * uPixelRatio;

    // Color logic
    // Mix deep green and mid green
    vec3 baseColor = mix(colorDeep, colorMid, aRandom * 0.8 + 0.2);
    
    // Gold sparkle logic
    // Sparkle intensity increases based on time and random phase
    float sparkleCycle = sin(uTime * 2.0 + aRandom * 30.0);
    float sparkleSharp = pow(max(0.0, sparkleCycle), 10.0); // Sharp peaks for glint
    
    // More gold at the edges of the tree or randomly
    float isEdge = smoothstep(0.0, 1.0, length(pos.xz) / 5.0); // Assuming radius ~5
    
    vec3 finalColor = mix(baseColor, colorGold, sparkleSharp * 0.6);
    
    // Boost glow in Scatter mode for magical dust feel
    if (t < 0.5) {
        finalColor = mix(finalColor, colorGold, 0.3 * (1.0 - t * 2.0));
    }

    vColor = finalColor;
    vAlpha = 0.6 + 0.4 * aRandom + sparkleSharp * 0.4;
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // Soft particle glow
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Radial gradient for soft "fuzzy" look
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 1.5); // Tune falloff

    gl_FragColor = vec4(vColor, vAlpha * strength);
  }
`;

interface FoliageProps {
  state: TreeMorphState;
}

const Foliage: React.FC<FoliageProps> = ({ state }) => {
  const meshRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Increase particle count for high fidelity
  const { treePositions, scatterPositions, randoms } = useMemo(() => 
    generateFoliageData(20000, 14, 6), 
  []);

  const stateRef = useRef(state);
  stateRef.current = state;

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const target = stateRef.current === TreeMorphState.TREE_SHAPE ? 1 : 0;
      // Slower, majestic transition
      easing.damp(materialRef.current.uniforms.uProgress, 'value', target, 2.0, delta);
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={treePositions.length / 3}
          array={treePositions} 
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={{
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uPixelRatio: { value: typeof window !== 'undefined' ? window.devicePixelRatio : 1 }
        }}
      />
    </points>
  );
};

export default Foliage;