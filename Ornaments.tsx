import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TreeMorphState } from '../types';
import { generateOrnamentsData } from '../utils/geometry';

interface OrnamentsProps {
  state: TreeMorphState;
}

const Ornaments: React.FC<OrnamentsProps> = ({ state }) => {
  const baubleRef = useRef<THREE.InstancedMesh>(null);
  const boxRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.InstancedMesh>(null);
  
  // Generate data once
  const { boxes, baubles, stars, allData } = useMemo(() => {
    const all = generateOrnamentsData(400, 14, 6);
    return {
      allData: all,
      boxes: all.filter(o => o.type === 'box'),
      baubles: all.filter(o => o.type === 'ball'),
      stars: all.filter(o => o.type === 'star')
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Track animation progress for each individual ornament to handle swarm physics
  // Size = max ID + 1 to be safe
  const progressArray = useMemo(() => new Float32Array(allData.length).fill(0), [allData.length]); 

  useFrame((_state, delta) => {
    const targetState = stateRef.current === TreeMorphState.TREE_SHAPE ? 1 : 0;
    const time = _state.clock.elapsedTime;

    // --- Update Boxes (Heavy) ---
    if (boxRef.current) {
      boxes.forEach((data, i) => {
        // Heavy: slow damping (lower value), less noise
        const currentP = progressArray[data.id];
        const dampFactor = 1.0; 
        const nextP = THREE.MathUtils.damp(currentP, targetState, dampFactor, delta);
        progressArray[data.id] = nextP;

        const vStart = new THREE.Vector3(...data.scatterPosition);
        const vEnd = new THREE.Vector3(...data.treePosition);
        const pos = vStart.lerp(vEnd, nextP);

        // Add heavy drift in scatter
        if (nextP < 0.9) {
           pos.y += Math.sin(time * 0.5 + data.id) * 0.05 * (1 - nextP);
        }

        dummy.position.copy(pos);
        
        // Slow rotation
        dummy.rotation.set(
            data.rotation[0] + time * 0.1 * (1-nextP),
            data.rotation[1] + time * 0.1,
            data.rotation[2]
        );
        
        const scale = data.scale * (0.6 + 0.4 * nextP); 
        dummy.scale.set(scale, scale, scale);

        dummy.updateMatrix();
        boxRef.current!.setMatrixAt(i, dummy.matrix);
      });
      boxRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Baubles (Medium) ---
    if (baubleRef.current) {
      baubles.forEach((data, i) => {
        // Medium: standard damping
        const currentP = progressArray[data.id];
        const dampFactor = 2.0; 
        const nextP = THREE.MathUtils.damp(currentP, targetState, dampFactor, delta);
        progressArray[data.id] = nextP;

        const vStart = new THREE.Vector3(...data.scatterPosition);
        const vEnd = new THREE.Vector3(...data.treePosition);
        const pos = vStart.lerp(vEnd, nextP);
        
        // Medium drift
        if (nextP < 0.9) {
            pos.x += Math.cos(time + data.id) * 0.1 * (1 - nextP);
            pos.y += Math.sin(time + data.id) * 0.1 * (1 - nextP);
        }

        dummy.position.copy(pos);
        dummy.rotation.set(
            data.rotation[0] + time * 0.5 * (1-nextP), 
            data.rotation[1] + time * 0.2, 
            data.rotation[2]
        );
        dummy.scale.setScalar(data.scale * (0.3 + 0.7 * nextP));
        
        dummy.updateMatrix();
        baubleRef.current!.setMatrixAt(i, dummy.matrix);
      });
      baubleRef.current.instanceMatrix.needsUpdate = true;
    }

    // --- Update Stars (Light/Ethereal) ---
    if (starRef.current) {
      stars.forEach((data, i) => {
        // Light: Fast damping, "snappy"
        const currentP = progressArray[data.id];
        const dampFactor = 3.5; 
        const nextP = THREE.MathUtils.damp(currentP, targetState, dampFactor, delta);
        progressArray[data.id] = nextP;

        const vStart = new THREE.Vector3(...data.scatterPosition);
        const vEnd = new THREE.Vector3(...data.treePosition);
        
        // Non-linear lerp for "zipping" effect
        const smoothT = nextP * nextP * (3 - 2 * nextP);
        const pos = vStart.lerp(vEnd, smoothT);
        
        // High frequency noise in scatter state (firefly effect)
        if (nextP < 0.95) {
            const noiseAmp = 0.5 * (1 - nextP);
            pos.x += Math.sin(time * 3.0 + data.id * 0.1) * noiseAmp;
            pos.y += Math.cos(time * 2.5 + data.id * 0.1) * noiseAmp;
            pos.z += Math.sin(time * 4.0 + data.id * 0.2) * noiseAmp;
        }

        dummy.position.copy(pos);
        
        // Fast twirl
        dummy.rotation.set(
            data.rotation[0] + time * 2.0, 
            data.rotation[1] + time * 1.5, 
            0
        );
        
        // Pulse size
        const pulse = 1.0 + 0.3 * Math.sin(time * 5.0 + data.id);
        dummy.scale.setScalar(data.scale * 0.5 * pulse); // Stars are smaller generally
        
        dummy.updateMatrix();
        starRef.current!.setMatrixAt(i, dummy.matrix);
      });
      starRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  useLayoutEffect(() => {
    if (boxRef.current) {
      boxes.forEach((data, i) => boxRef.current!.setColorAt(i, new THREE.Color(data.color)));
      boxRef.current.instanceColor!.needsUpdate = true;
    }
    if (baubleRef.current) {
      baubles.forEach((data, i) => baubleRef.current!.setColorAt(i, new THREE.Color(data.color)));
      baubleRef.current.instanceColor!.needsUpdate = true;
    }
    if (starRef.current) {
      stars.forEach((data, i) => {
          // Stars are emissive, color tinting handled here, intensity in material
          starRef.current!.setColorAt(i, new THREE.Color(data.color));
      });
      starRef.current.instanceColor!.needsUpdate = true;
    }
  }, [boxes, baubles, stars]);

  return (
    <group>
      {/* Heavy Boxes: Reflective, solid */}
      <instancedMesh ref={boxRef} args={[undefined, undefined, boxes.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          roughness={0.15} 
          metalness={0.9} 
          envMapIntensity={2}
        />
      </instancedMesh>

      {/* Medium Baubles: Highly polished */}
      <instancedMesh ref={baubleRef} args={[undefined, undefined, baubles.length]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial 
          roughness={0.05} 
          metalness={1.0} 
          envMapIntensity={3}
        />
      </instancedMesh>

      {/* Light Stars: Glowing, self-illuminated */}
      <instancedMesh ref={starRef} args={[undefined, undefined, stars.length]}>
        <octahedronGeometry args={[1, 0]} /> 
        <meshStandardMaterial 
          roughness={0.4} 
          metalness={1.0}
          emissive="white"
          emissiveIntensity={2}
          toneMapped={false} // Make them blow out in bloom
        />
      </instancedMesh>
    </group>
  );
};

export default Ornaments;