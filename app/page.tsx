'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useGame } from '@/hooks/useGame';
import GameRenderer from '@/components/GameRenderer';

export default function GamePage() {
  const [mounted, setMounted] = useState(false);
  const { gameState, canvasWidth, canvasHeight, resetGame } = useGame();

  const handleRestart = useCallback(() => {
    resetGame();
  }, [resetGame]);

  // Handle restart key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (gameState.gameOver) {
          handleRestart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameOver, handleRestart]);

  // Set mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-cyan-300">Loading game...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-8 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Vector Shooter</h1>
        <p className="text-cyan-300 text-sm">
          A physics-based top-down shooter powered by vector math
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <GameRenderer
          gameState={gameState}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />

        <div className="bg-slate-900 border border-cyan-500 rounded-lg p-4 text-cyan-300">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Controls</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="text-cyan-400">WASD/Arrows</span> - Move
                </li>
                <li>
                  <span className="text-cyan-400">A/D or ←/→</span> - Rotate
                </li>
                <li>
                  <span className="text-cyan-400">SPACE</span> - Shoot
                </li>
                <li>
                  <span className="text-cyan-400">R</span> - Restart
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-cyan-400 mb-2">Game Info</h3>
              <ul className="text-sm space-y-1">
                <li>
                  <span className="text-green-400">Green</span> - Your ship
                </li>
                <li>
                  <span className="text-red-400">Red</span> - Enemies
                </li>
                <li>
                  <span className="text-yellow-400">Yellow</span> - Bullets
                </li>
                <li>
                  <span className="text-cyan-400">Cyan</span> - Particles
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-cyan-500 pt-4">
            <h3 className="font-bold text-cyan-400 mb-2">How to Play</h3>
            <ul className="text-sm space-y-2">
              <li>
                • Destroy enemies to earn points and progress through waves
              </li>
              <li>• Each wave spawns more enemies that move faster</li>
              <li>
                • Your health decreases when hit by enemies—avoid contact!
              </li>
              <li>
                • Use trigonometry and vector math to aim and calculate bullet
                trajectories
              </li>
              <li>• Complete all waves to become the ultimate vector master</li>
            </ul>
          </div>
        </div>

        {gameState.gameOver && (
          <button
            onClick={handleRestart}
            className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Restart Game (R)
          </button>
        )}
      </div>
    </main>
  );
}
