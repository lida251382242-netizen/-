import * as THREE from 'three';

// Helper to generate random point in a sphere
export const getRandomSpherePoint = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return [
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  ];
};

// Generate foliage particles
export const generateFoliageData = (count: number, treeHeight: number, baseRadius: number) => {
  const treePositions = new Float32Array(count * 3);
  const scatterPositions = new Float32Array(count * 3);
  const randoms = new Float32Array(count); // For twinkling/phase

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    
    // --- Tree Shape (Cone) ---
    const y = Math.random() * treeHeight; // Height from bottom (0) to top
    const radiusAtHeight = baseRadius * (1 - y / treeHeight);
    
    // Bias distribution towards the surface for a more defined shape, but keep some inner volume
    const r = radiusAtHeight * (0.4 + 0.6 * Math.sqrt(Math.random()));
    const theta = i * 2.39996; // Golden angle
    
    treePositions[i3] = r * Math.cos(theta);
    treePositions[i3 + 1] = y - treeHeight / 2;
    treePositions[i3 + 2] = r * Math.sin(theta);

    // --- Scatter Shape (Explosion) ---
    const [sx, sy, sz] = getRandomSpherePoint(treeHeight * 1.5);
    scatterPositions[i3] = sx;
    scatterPositions[i3 + 1] = sy;
    scatterPositions[i3 + 2] = sz;

    randoms[i] = Math.random();
  }

  return { treePositions, scatterPositions, randoms };
};

// Generate ornament instances
export const generateOrnamentsData = (count: number, treeHeight: number, baseRadius: number) => {
  const data: any[] = [];
  
  // Luxury Palette: Deep Emerald, Metallic Golds, Silver, hints of deep red/burgundy
  const palette = [
    '#FFD700', // Gold
    '#C5A028', // Dark Goldenrod
    '#DAA520', // Goldenrod
    '#B8860B', // Dark Gold
    '#E5E4E2', // Platinum/Silver
    '#004225', // British Racing Green (Deep Emerald)
    '#3B0000', // Deepest Red (almost black)
  ];

  for (let i = 0; i < count; i++) {
    const y = Math.random() * treeHeight;
    const progress = y / treeHeight;
    const radiusAtHeight = baseRadius * (1 - progress);
    
    // Ornaments sit closer to surface
    const theta = Math.random() * Math.PI * 2;
    const r = radiusAtHeight * 0.95; 

    const tx = r * Math.cos(theta);
    const ty = y - treeHeight / 2;
    const tz = r * Math.sin(theta);

    const [sx, sy, sz] = getRandomSpherePoint(treeHeight * 2.5);

    // Determine type based on rarity
    const randType = Math.random();
    let type = 'ball';
    if (randType > 0.85) type = 'box';    // 15% Heavy Boxes
    else if (randType > 0.5) type = 'star'; // 35% Light Stars
    // else 50% Balls

    // Stars should be mostly gold/white
    let color = palette[Math.floor(Math.random() * palette.length)];
    if (type === 'star') {
      color = Math.random() > 0.3 ? '#FFD700' : '#FFFFFF';
    }

    data.push({
      id: i,
      type,
      color,
      treePosition: [tx, ty, tz],
      scatterPosition: [sx, sy, sz],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: Math.random() * 0.3 + 0.2
    });
  }
  return data;
};