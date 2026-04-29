'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameState } from '@/hooks/useGame';
import { Player, Bullet, Enemy, Particle, EnemyBullet, EnemyType } from '@/lib/entities';

interface GameRendererProps {
  gameState: GameState;
  canvasWidth: number;
  canvasHeight: number;
}

const GameRenderer: React.FC<GameRendererProps> = ({
  gameState,
  canvasWidth,
  canvasHeight,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fps, setFps] = useState(0);
  const fpsCounterRef = useRef(0);
  const lastFpsTimeRef = useRef(Date.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update FPS counter
    frameCountRef.current += 1;
    const now = Date.now();
    if (now - lastFpsTimeRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsTimeRef.current = now;
    }

    // Clear canvas with dark background
    ctx.fillStyle = '#0f0f1e';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply screen shake
    ctx.save();
    if (gameState.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * gameState.screenShake * 20;
      const shakeY = (Math.random() - 0.5) * gameState.screenShake * 20;
      ctx.translate(shakeX, shakeY);
    }

    // Draw grid background
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let i = 0; i <= canvasWidth; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= canvasHeight; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasWidth, i);
      ctx.stroke();
    }

    // Draw enemies
    for (const enemy of gameState.enemies) {
      drawEnemy(ctx, enemy);
    }

    // Draw bullets
    for (const bullet of gameState.bullets) {
      drawBullet(ctx, bullet);
    }

    // Draw enemy bullets
    for (const bullet of gameState.enemyBullets) {
      drawEnemyBullet(ctx, bullet);
    }

    // Draw particles
    for (const particle of gameState.particles) {
      drawParticle(ctx, particle);
    }

    // Draw player
    if (gameState.player) {
      drawPlayer(ctx, gameState.player);
    }

    ctx.restore();

    // Draw HUD
    drawHUD(ctx, gameState, canvasWidth, canvasHeight, fps);
  }, [gameState, canvasWidth, canvasHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      className="border-2 border-cyan-500 bg-slate-900 shadow-lg"
      style={{ display: 'block', margin: '0 auto' }}
    />
  );
};

const drawPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
  ctx.save();
  ctx.translate(player.position.x, player.position.y);
  ctx.rotate(player.rotation);

  // Draw ship body
  ctx.fillStyle = '#00ff00';
  ctx.beginPath();
  ctx.moveTo(12, 0); // Front point
  ctx.lineTo(-8, -8); // Back left
  ctx.lineTo(-4, 0); // Back center
  ctx.lineTo(-8, 8); // Back right
  ctx.closePath();
  ctx.fill();

  // Draw direction indicator
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, 0);
  ctx.lineTo(16, 0);
  ctx.stroke();

  ctx.restore();

  // Draw health bar
  const barWidth = 24;
  const barHeight = 4;
  const healthPercent = player.health / player.maxHealth;

  ctx.fillStyle = '#333';
  ctx.fillRect(
    player.position.x - barWidth / 2,
    player.position.y - 20,
    barWidth,
    barHeight
  );

  ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff3333';
  ctx.fillRect(
    player.position.x - barWidth / 2,
    player.position.y - 20,
    barWidth * healthPercent,
    barHeight
  );
};

const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
  // Determine color and style based on type
  let color = '#ff3333';
  let strokeColor = 'rgba(255, 0, 0, 0.5)';
  
  switch (enemy.type) {
    case EnemyType.FAST:
      color = '#ffaa00';
      strokeColor = 'rgba(255, 170, 0, 0.5)';
      break;
    case EnemyType.TANK:
      color = '#aa3333';
      strokeColor = 'rgba(170, 50, 50, 0.5)';
      break;
    case EnemyType.SHOOTER:
      color = '#ff00ff';
      strokeColor = 'rgba(255, 0, 255, 0.5)';
      break;
    case EnemyType.BASIC:
    default:
      color = '#ff3333';
      strokeColor = 'rgba(255, 0, 0, 0.5)';
  }

  // Draw enemy circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(enemy.position.x, enemy.position.y, enemy.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw type-specific details
  if (enemy.type === EnemyType.SHOOTER) {
    // Draw cannon for shooter
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(enemy.position.x, enemy.position.y);
    const angle = Math.atan2(enemy.targetY - enemy.position.y, enemy.targetX - enemy.position.x);
    ctx.lineTo(
      enemy.position.x + Math.cos(angle) * enemy.radius,
      enemy.position.y + Math.sin(angle) * enemy.radius
    );
    ctx.stroke();
  } else if (enemy.type === EnemyType.TANK) {
    // Draw rings for tank
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(enemy.position.x, enemy.position.y, enemy.radius - 3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (enemy.type === EnemyType.FAST) {
    // Draw chevrons for fast enemy
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    const offset = 4;
    ctx.beginPath();
    ctx.moveTo(enemy.position.x - offset, enemy.position.y - 3);
    ctx.lineTo(enemy.position.x, enemy.position.y + 3);
    ctx.lineTo(enemy.position.x + offset, enemy.position.y - 3);
    ctx.stroke();
  }

  // Draw glow
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(enemy.position.x, enemy.position.y, enemy.radius + 2, 0, Math.PI * 2);
  ctx.stroke();

  // Draw health bar
  const barWidth = 16;
  const barHeight = 3;
  const healthPercent = enemy.health / enemy.maxHealth;

  ctx.fillStyle = '#333';
  ctx.fillRect(
    enemy.position.x - barWidth / 2,
    enemy.position.y - 14,
    barWidth,
    barHeight
  );

  ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff3333';
  ctx.fillRect(
    enemy.position.x - barWidth / 2,
    enemy.position.y - 14,
    barWidth * healthPercent,
    barHeight
  );
};

const drawBullet = (ctx: CanvasRenderingContext2D, bullet: Bullet) => {
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw bullet glow
  ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(bullet.position.x, bullet.position.y, bullet.radius + 3, 0, Math.PI * 2);
  ctx.stroke();
};

const drawEnemyBullet = (ctx: CanvasRenderingContext2D, bullet: EnemyBullet) => {
  ctx.fillStyle = '#ff00ff';
  ctx.beginPath();
  ctx.arc(bullet.position.x, bullet.position.y, bullet.radius, 0, Math.PI * 2);
  ctx.fill();

  // Draw bullet glow
  ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(bullet.position.x, bullet.position.y, bullet.radius + 2, 0, Math.PI * 2);
  ctx.stroke();
};

const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
  ctx.fillStyle = `rgba(0, 255, 255, ${particle.opacity * 0.8})`;
  ctx.beginPath();
  ctx.arc(
    particle.position.x,
    particle.position.y,
    particle.radius,
    0,
    Math.PI * 2
  );
  ctx.fill();
};

const drawHUD = (
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  width: number,
  height: number,
  fps: number
) => {
  ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'left';

  // Score
  ctx.fillText(`Score: ${gameState.score}`, 10, 25);

  // Wave
  ctx.fillText(`Wave: ${gameState.wave}`, 10, 50);

  // Health
  if (gameState.player) {
    ctx.fillText(
      `HP: ${gameState.player.health}/${gameState.player.maxHealth}`,
      10,
      75
    );
  }

  // Enemy count
  ctx.fillText(`Enemies: ${gameState.enemies.length}`, 10, 100);

  // Bullets count
  ctx.fillText(`Bullets: ${gameState.bullets.length}`, 10, 125);

  // Enemy bullets count
  ctx.fillText(`Enemy Fire: ${gameState.enemyBullets.length}`, 10, 150);

  // FPS
  ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
  ctx.textAlign = 'right';
  ctx.fillText(`FPS: ${fps}`, width - 10, 25);

  // Game Over message
  if (gameState.gameOver) {
    ctx.fillStyle = 'rgba(255, 51, 51, 0.9)';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', width / 2, height / 2);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(
      `Final Score: ${gameState.score}`,
      width / 2,
      height / 2 + 50
    );
    ctx.fillText('Press R to restart', width / 2, height / 2 + 80);
  }
};

export default GameRenderer;
