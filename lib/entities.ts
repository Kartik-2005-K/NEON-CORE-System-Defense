import { Vector2, degToRad } from './vector';

export interface GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
}

export enum EnemyType {
  BASIC = 'basic',
  FAST = 'fast',
  TANK = 'tank',
  SHOOTER = 'shooter',
}

export class Player implements GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
  rotation: number = 0;
  health: number = 100;
  maxHealth: number = 100;
  speed: number = 250; // pixels per second
  rotationSpeed: number = 6; // radians per second
  private fireRate: number = 0.1; // seconds between shots
  private timeSinceLastShot: number = 0;

  constructor(x: number, y: number) {
    this.id = `player-${Date.now()}`;
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.radius = 12;
    this.isAlive = true;
  }

  update(deltaTime: number, keys: Set<string>) {
    // Rotation
    if (keys.has('ArrowLeft') || keys.has('a')) {
      this.rotation -= this.rotationSpeed * deltaTime;
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      this.rotation += this.rotationSpeed * deltaTime;
    }

    // Movement
    const moveDir = Vector2.create(0, 0);
    if (keys.has('ArrowUp') || keys.has('w')) {
      moveDir.y -= 1;
    }
    if (keys.has('ArrowDown') || keys.has('s')) {
      moveDir.y += 1;
    }
    if (keys.has('ArrowLeft') || keys.has('a')) {
      moveDir.x -= 1;
    }
    if (keys.has('ArrowRight') || keys.has('d')) {
      moveDir.x += 1;
    }

    const normalized = Vector2.normalize(moveDir);
    this.velocity = Vector2.multiply(normalized, this.speed);

    // Update position
    this.position = Vector2.add(
      this.position,
      Vector2.multiply(this.velocity, deltaTime)
    );

    // Update fire rate timer
    this.timeSinceLastShot += deltaTime;
  }

  canShoot(): boolean {
    return this.timeSinceLastShot >= this.fireRate;
  }

  shoot(): Bullet | null {
    if (!this.canShoot()) return null;

    this.timeSinceLastShot = 0;
    const shootSpeed = 500;
    const bulletVelocity = Vector2.fromAngle(this.rotation, shootSpeed);

    return new Bullet(
      this.position.x,
      this.position.y,
      bulletVelocity.x,
      bulletVelocity.y
    );
  }

  takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }

  heal(amount: number) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }
}

export class Bullet implements GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
  lifetime: number = 5; // max lifetime in seconds
  timeLived: number = 0;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.id = `bullet-${Date.now()}-${Math.random()}`;
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.radius = 4;
    this.isAlive = true;
  }

  update(deltaTime: number) {
    this.position = Vector2.add(
      this.position,
      Vector2.multiply(this.velocity, deltaTime)
    );

    this.timeLived += deltaTime;
    if (this.timeLived >= this.lifetime) {
      this.isAlive = false;
    }
  }
}

export class Enemy implements GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  type: EnemyType;
  targetX: number;
  targetY: number;
  actionTimer: number = 0;
  shootTimer: number = 0;
  circleAngle: number = 0;
  originalSpeed: number;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    type: EnemyType = EnemyType.BASIC
  ) {
    this.id = `enemy-${Date.now()}-${Math.random()}`;
    this.position = { x, y };
    this.targetX = targetX;
    this.targetY = targetY;
    this.type = type;
    this.isAlive = true;

    // Set properties based on type
    switch (type) {
      case EnemyType.FAST:
        this.maxHealth = 10;
        this.speed = 180;
        this.damage = 5;
        this.radius = 6;
        break;
      case EnemyType.TANK:
        this.maxHealth = 50;
        this.speed = 60;
        this.damage = 15;
        this.radius = 12;
        break;
      case EnemyType.SHOOTER:
        this.maxHealth = 25;
        this.speed = 80;
        this.damage = 10;
        this.radius = 9;
        break;
      case EnemyType.BASIC:
      default:
        this.maxHealth = 20;
        this.speed = 100;
        this.damage = 10;
        this.radius = 8;
    }

    this.health = this.maxHealth;
    this.originalSpeed = this.speed;

    // Initial direction towards target
    this.updateVelocity();
  }

  private updateVelocity() {
    const direction = Vector2.normalize(
      Vector2.subtract({ x: this.targetX, y: this.targetY }, this.position)
    );
    this.velocity = Vector2.multiply(direction, this.speed);
  }

  update(deltaTime: number, playerX: number, playerY: number) {
    // Update target position (player location)
    this.targetX = playerX;
    this.targetY = playerY;

    // Type-specific behavior
    switch (this.type) {
      case EnemyType.FAST:
        this.updateVelocity();
        break;
      case EnemyType.TANK:
        this.updateVelocity();
        break;
      case EnemyType.SHOOTER:
        // Circle around player
        this.actionTimer += deltaTime;
        if (this.actionTimer > 0.5) {
          this.actionTimer = 0;
          this.circleAngle += 0.1;
        }
        const distance = 120;
        const circleX = playerX + Math.cos(this.circleAngle) * distance;
        const circleY = playerY + Math.sin(this.circleAngle) * distance;
        const direction = Vector2.normalize(
          Vector2.subtract({ x: circleX, y: circleY }, this.position)
        );
        this.velocity = Vector2.multiply(direction, this.speed);
        break;
      case EnemyType.BASIC:
      default:
        this.updateVelocity();
    }

    // Update position
    this.position = Vector2.add(
      this.position,
      Vector2.multiply(this.velocity, deltaTime)
    );
  }

  canShoot(): boolean {
    return this.type === EnemyType.SHOOTER && this.shootTimer >= 1.0;
  }

  shoot(): EnemyBullet | null {
    if (!this.canShoot()) return null;

    this.shootTimer = 0;
    const shootSpeed = 300;
    const direction = Vector2.normalize(
      Vector2.subtract({ x: this.targetX, y: this.targetY }, this.position)
    );
    const bulletVelocity = Vector2.multiply(direction, shootSpeed);

    return new EnemyBullet(
      this.position.x,
      this.position.y,
      bulletVelocity.x,
      bulletVelocity.y
    );
  }

  updateShootTimer(deltaTime: number) {
    this.shootTimer += deltaTime;
  }

  takeDamage(amount: number) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isAlive = false;
    }
  }
}

export class EnemyBullet implements GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
  lifetime: number = 4;
  timeLived: number = 0;

  constructor(x: number, y: number, vx: number, vy: number) {
    this.id = `enemy-bullet-${Date.now()}-${Math.random()}`;
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.radius = 3;
    this.isAlive = true;
  }

  update(deltaTime: number) {
    this.position = Vector2.add(
      this.position,
      Vector2.multiply(this.velocity, deltaTime)
    );

    this.timeLived += deltaTime;
    if (this.timeLived >= this.lifetime) {
      this.isAlive = false;
    }
  }
}

export class Particle implements GameEntity {
  id: string;
  position: Vector2;
  velocity: Vector2;
  radius: number;
  isAlive: boolean;
  lifetime: number;
  timeLived: number = 0;
  opacity: number = 1;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    lifetime: number = 0.5
  ) {
    this.id = `particle-${Date.now()}-${Math.random()}`;
    this.position = { x, y };
    this.velocity = { x: vx, y: vy };
    this.radius = 2;
    this.isAlive = true;
    this.lifetime = lifetime;
  }

  update(deltaTime: number) {
    this.position = Vector2.add(
      this.position,
      Vector2.multiply(this.velocity, deltaTime)
    );

    this.timeLived += deltaTime;
    this.opacity = Math.max(0, 1 - this.timeLived / this.lifetime);

    if (this.timeLived >= this.lifetime) {
      this.isAlive = false;
    }
  }
}
