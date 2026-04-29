'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Player, Bullet, Enemy, Particle, EnemyBullet, EnemyType } from '@/lib/entities';
import {
  handlePlayerBulletEnemyCollisions,
  handlePlayerEnemyCollisions,
  wrapEntityInBounds,
} from '@/lib/collision';

export interface GameState {
  player: Player | null;
  bullets: Bullet[];
  enemyBullets: EnemyBullet[];
  enemies: Enemy[];
  particles: Particle[];
  score: number;
  wave: number;
  gameOver: boolean;
  isPaused: boolean;
  screenShake: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    particles: [],
    score: 0,
    wave: 1,
    gameOver: false,
    isPaused: false,
    screenShake: 0,
  });

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const enemySpawnTimerRef = useRef<number>(0);
  const waveEnemiesSpawnedRef = useRef<number>(0);
  const waveEnemiesRequiredRef = useRef<number>(5);
  const gameStateRef = useRef<GameState | null>(null);

  // Keep track of current game state for use in callbacks
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Initialize game
  const initGame = useCallback(() => {
    const player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    const newState: GameState = {
      player,
      bullets: [],
      enemyBullets: [],
      enemies: [],
      particles: [],
      score: 0,
      wave: 1,
      gameOver: false,
      isPaused: false,
      screenShake: 0,
    };
    setGameState(newState);
    gameStateRef.current = newState;
    enemySpawnTimerRef.current = 0;
    waveEnemiesSpawnedRef.current = 0;
    waveEnemiesRequiredRef.current = 5;
    lastTimeRef.current = Date.now();
  }, []);

  // Handle key down
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysPressed.current.add(e.key);
    if (e.key === ' ') {
      e.preventDefault();
    }
  }, []);

  // Handle key up
  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysPressed.current.delete(e.key);
  }, []);

  // Game update loop
  const updateGame = useCallback(() => {
    setGameState((prevState) => {
      if (prevState.gameOver) return prevState;

      const now = Date.now();
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.033);
      lastTimeRef.current = now;

      let state = prevState;

      // Update player
      if (state.player) {
        state.player.update(deltaTime, keysPressed.current);
        wrapEntityInBounds(state.player, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Shoot if space pressed
        if (keysPressed.current.has(' ')) {
          const newBullet = state.player.shoot();
          if (newBullet) {
            state = {
              ...state,
              bullets: [...state.bullets, newBullet],
            };
          }
        }
      }

      // Update bullets
      const aliveBullets: Bullet[] = [];
      const newParticles: Particle[] = [];

      for (const bullet of state.bullets) {
        bullet.update(deltaTime);
        if (bullet.isAlive) {
          wrapEntityInBounds(bullet, CANVAS_WIDTH, CANVAS_HEIGHT);
          aliveBullets.push(bullet);
        }
      }

      // Update enemies and generate enemy bullets
      const aliveEnemies: Enemy[] = [];
      const newEnemyBullets: EnemyBullet[] = [];
      const playerPos = state.player?.position || { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
      
      for (const enemy of state.enemies) {
        enemy.update(deltaTime, playerPos.x, playerPos.y);
        enemy.updateShootTimer(deltaTime);
        
        if (enemy.isAlive) {
          wrapEntityInBounds(enemy, CANVAS_WIDTH, CANVAS_HEIGHT);
          aliveEnemies.push(enemy);
          
          // Generate enemy bullets
          const newBullet = enemy.shoot();
          if (newBullet) {
            newEnemyBullets.push(newBullet);
          }
        }
      }

      state = {
        ...state,
        bullets: aliveBullets,
        enemyBullets: [...state.enemyBullets, ...newEnemyBullets],
        enemies: aliveEnemies,
      };

      // Handle collisions
      if (state.player) {
        const {
          bulletsToRemove,
          enemiesToRemove: collidedEnemies,
        } = handlePlayerBulletEnemyCollisions(
          state.bullets,
          state.enemies,
          (enemy) => {
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * Math.PI * 2;
              const speed = 150 + Math.random() * 100;
              const particleVx = Math.cos(angle) * speed;
              const particleVy = Math.sin(angle) * speed;
              newParticles.push(
                new Particle(
                  enemy.position.x,
                  enemy.position.y,
                  particleVx,
                  particleVy,
                  0.6
                )
              );
            }
          }
        );

        state = {
          ...state,
          bullets: state.bullets.filter((b) => !bulletsToRemove.includes(b.id)),
          enemies: state.enemies.filter(
            (e) => !collidedEnemies.includes(e.id)
          ),
          score: state.score + collidedEnemies.length * 100,
        };

        // Handle player-enemy collisions
        const player = state.player;
        if (player) {
          const hitEnemies = handlePlayerEnemyCollisions(
            player,
            state.enemies,
            (damage) => {
              player.takeDamage(damage);
            }
          );

          state = {
            ...state,
            enemies: state.enemies.filter((e) => !hitEnemies.includes(e.id)),
            screenShake: 0.1,
          };

          if (!player.isAlive) {
            state = { ...state, gameOver: true };
          }

          // Handle enemy bullet collisions with player
          const aliveEnemyBullets: EnemyBullet[] = [];
          for (const bullet of state.enemyBullets) {
            const dx = player.position.x - bullet.position.x;
            const dy = player.position.y - bullet.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.radius + bullet.radius) {
              player.takeDamage(5);
              state = { ...state, screenShake: 0.05 };
            } else if (bullet.isAlive) {
              aliveEnemyBullets.push(bullet);
            }
          }

          state = {
            ...state,
            enemyBullets: aliveEnemyBullets,
          };

          if (!player.isAlive) {
            state = { ...state, gameOver: true };
          }
        }
      }

      // Update particles
      const aliveParticles: Particle[] = [];
      for (const particle of [...state.particles, ...newParticles]) {
        particle.update(deltaTime);
        if (particle.isAlive) {
          aliveParticles.push(particle);
        }
      }

      // Update enemy bullets
      const updatedEnemyBullets: EnemyBullet[] = [];
      for (const bullet of state.enemyBullets) {
        bullet.update(deltaTime);
        if (bullet.isAlive) {
          wrapEntityInBounds(bullet, CANVAS_WIDTH, CANVAS_HEIGHT);
          updatedEnemyBullets.push(bullet);
        }
      }

      state = {
        ...state,
        particles: aliveParticles,
        enemyBullets: updatedEnemyBullets,
      };

      // Spawn enemies
      enemySpawnTimerRef.current += deltaTime;
      const spawnInterval = Math.max(0.5, 2 - state.wave * 0.1);
      const enemiesPerWave = 5 + state.wave * 2;

      if (
        enemySpawnTimerRef.current >= spawnInterval &&
        waveEnemiesSpawnedRef.current < enemiesPerWave
      ) {
        enemySpawnTimerRef.current = 0;
        const side = Math.floor(Math.random() * 4);
        let spawnX = 0,
          spawnY = 0;

        if (side === 0) {
          spawnX = Math.random() * CANVAS_WIDTH;
          spawnY = -30;
        } else if (side === 1) {
          spawnX = CANVAS_WIDTH + 30;
          spawnY = Math.random() * CANVAS_HEIGHT;
        } else if (side === 2) {
          spawnX = Math.random() * CANVAS_WIDTH;
          spawnY = CANVAS_HEIGHT + 30;
        } else {
          spawnX = -30;
          spawnY = Math.random() * CANVAS_HEIGHT;
        }

        // Determine enemy type based on wave
        let enemyType = EnemyType.BASIC;
        const rand = Math.random();
        if (state.wave >= 5 && rand < 0.2) {
          enemyType = EnemyType.SHOOTER;
        } else if (state.wave >= 4 && rand < 0.15) {
          enemyType = EnemyType.TANK;
        } else if (state.wave >= 2 && rand < 0.25) {
          enemyType = EnemyType.FAST;
        }

        const enemy = new Enemy(
          spawnX,
          spawnY,
          state.player?.position.x || CANVAS_WIDTH / 2,
          state.player?.position.y || CANVAS_HEIGHT / 2,
          enemyType
        );

        state = {
          ...state,
          enemies: [...state.enemies, enemy],
        };
        waveEnemiesSpawnedRef.current += 1;
      }

      // Check if wave complete
      if (
        waveEnemiesSpawnedRef.current >= enemiesPerWave &&
        state.enemies.length === 0
      ) {
        waveEnemiesSpawnedRef.current = 0;
        state = {
          ...state,
          wave: state.wave + 1,
          score: state.score + 500,
        };
      }

      // Update screen shake
      state = {
        ...state,
        screenShake: Math.max(0, state.screenShake - deltaTime * 2),
      };

      return state;
    });
  }, []);

  // Setup game loop
  useEffect(() => {
    initGame();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const gameLoop = () => {
      updateGame();
      gameLoopRef.current = window.requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = window.requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [initGame, handleKeyDown, handleKeyUp, updateGame]);

  return {
    gameState,
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    resetGame: initGame,
  };
};
