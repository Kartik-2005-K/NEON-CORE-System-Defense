import { Vector2 } from './vector';
import { Player, Enemy, Bullet, Particle, GameEntity } from './entities';

export interface Collision {
  a: GameEntity;
  b: GameEntity;
  distance: number;
}

// AABB (Axis-Aligned Bounding Box) collision detection
export const checkCircleCollision = (
  a: GameEntity,
  b: GameEntity
): boolean => {
  const distance = Vector2.distance(a.position, b.position);
  return distance < a.radius + b.radius;
};

// Get all collisions between two arrays of entities
export const getCollisions = (
  group1: GameEntity[],
  group2: GameEntity[]
): Collision[] => {
  const collisions: Collision[] = [];

  for (const a of group1) {
    if (!a.isAlive) continue;
    for (const b of group2) {
      if (!b.isAlive) continue;
      if (checkCircleCollision(a, b)) {
        const distance = Vector2.distance(a.position, b.position);
        collisions.push({ a, b, distance });
      }
    }
  }

  return collisions;
};

export const handlePlayerBulletEnemyCollisions = (
  bullets: Bullet[],
  enemies: Enemy[],
  onEnemyKilled: (enemy: Enemy) => void
): { bulletsToRemove: string[]; enemiesToRemove: string[] } => {
  const bulletsToRemove = new Set<string>();
  const enemiesToRemove = new Set<string>();

  const collisions = getCollisions(bullets, enemies);

  for (const collision of collisions) {
    const bullet = collision.a as Bullet;
    const enemy = collision.b as Enemy;

    bulletsToRemove.add(bullet.id);
    enemy.takeDamage(25); // bullets do 25 damage

    if (!enemy.isAlive) {
      enemiesToRemove.add(enemy.id);
      onEnemyKilled(enemy);
    }
  }

  return {
    bulletsToRemove: Array.from(bulletsToRemove),
    enemiesToRemove: Array.from(enemiesToRemove),
  };
};

export const handlePlayerEnemyCollisions = (
  player: Player,
  enemies: Enemy[],
  onPlayerHit: (damage: number) => void
): string[] => {
  const enemiesToRemove = new Set<string>();

  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;
    if (checkCircleCollision(player, enemy)) {
      onPlayerHit(enemy.damage);
      enemiesToRemove.add(enemy.id);
    }
  }

  return Array.from(enemiesToRemove);
};

// Keep entities within bounds with wraparound
export const wrapEntityInBounds = (
  entity: GameEntity,
  width: number,
  height: number,
  padding: number = 50
): void => {
  if (entity.position.x < -padding) {
    entity.position.x = width + padding;
  }
  if (entity.position.x > width + padding) {
    entity.position.x = -padding;
  }
  if (entity.position.y < -padding) {
    entity.position.y = height + padding;
  }
  if (entity.position.y > height + padding) {
    entity.position.y = -padding;
  }
};
