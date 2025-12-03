import React, { useState } from 'react';
import Scene from './components/Scene';
import { TreeMorphState } from './types';

function App() {
  const [treeState, setTreeState] = useState<TreeMorphState>(TreeMorphState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState(prev => 
      prev === TreeMorphState.TREE_SHAPE 
        ? TreeMorphState.SCATTERED 
        : TreeMorphState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        {/* Header */}
        <header className="flex flex-col items-center md:items-start space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-[1px] bg-[#C5A028]"></div>
            <h1 className="text-[#F4E3B2] text-xs tracking-[0.3em] uppercase font-bold font-serif">
              Arix Signature Collection
            </h1>
            <div className="w-8 h-[1px] bg-[#C5A028]"></div>
          </div>
          <h2 className="text-4xl md:text-6xl text-white font-serif tracking-tighter drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">
            The Golden Spruce
          </h2>
        </header>

        {/* Footer Controls */}
        <footer className="flex flex-col items-center md:flex-row md:justify-between w-full">
          <div className="text-[#888] text-xs tracking-widest mb-6 md:mb-0 max-w-xs text-center md:text-left">
            <p>EXPERIENCE THE HOLIDAY MAGIC.</p>
            <p className="mt-2 text-[#555]">
              Rendered in real-time. Drag to rotate. Scroll to zoom.
            </p>
          </div>

          <div className="pointer-events-auto">
            <button
              onClick={toggleState}
              className="group relative px-8 py-4 bg-transparent overflow-hidden transition-all duration-500 ease-out"
            >
              {/* Button Border Animation */}
              <span className="absolute inset-0 border border-[#C5A028] opacity-30 group-hover:opacity-100 transition-opacity duration-500"></span>
              <span className="absolute inset-0 border border-[#C5A028] scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500 delay-75"></span>
              
              {/* Button Content */}
              <div className="relative flex items-center space-x-4">
                <span className={`text-sm tracking-[0.2em] font-serif uppercase transition-colors duration-300 ${treeState === TreeMorphState.TREE_SHAPE ? 'text-[#F4E3B2]' : 'text-white'}`}>
                  {treeState === TreeMorphState.TREE_SHAPE ? 'Disassemble' : 'Assemble'}
                </span>
                <span className={`w-2 h-2 rounded-full shadow-[0_0_10px_#ffd700] transition-colors duration-300 ${treeState === TreeMorphState.TREE_SHAPE ? 'bg-[#ffd700]' : 'bg-red-500'}`}></span>
              </div>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-[#C5A028] opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl"></div>
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;