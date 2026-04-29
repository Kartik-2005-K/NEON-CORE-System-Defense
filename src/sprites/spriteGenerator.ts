/**
 * Neon Sprite Generator - High-Tech Sci-Fi Asset Creation
 * Generates fighter jets, enemy drones, and VFX with glowing neon outlines
 */

export class NeonSpriteGenerator {
  /**
   * Creates a player fighter jet sprite with cyan neon glow
   */
  static generateFighterJet(
    width: number = 32,
    height: number = 48,
    glow: boolean = true
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = width + (glow ? 8 : 0);
    canvas.height = height + (glow ? 8 : 0);
    const ctx = canvas.getContext('2d')!;

    const offsetX = glow ? 4 : 0;
    const offsetY = glow ? 4 : 0;

    // Cyan neon glow layer
    if (glow) {
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Main fighter body - angular aggressive design
    ctx.fillStyle = '#00FFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 2;

    // Fuselage
    ctx.beginPath();
    ctx.moveTo(offsetX + width / 2, offsetY + 2);
    ctx.lineTo(offsetX + width / 2 + 8, offsetY + height - 8);
    ctx.lineTo(offsetX + width / 2, offsetY + height);
    ctx.lineTo(offsetX + width / 2 - 8, offsetY + height - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit/Head
    ctx.fillStyle = '#FF00FF';
    ctx.beginPath();
    ctx.arc(offsetX + width / 2, offsetY + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#00FFFF';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(offsetX + width / 2 - 8, offsetY + height / 2);
    ctx.lineTo(offsetX + 2, offsetY + height / 2 + 5);
    ctx.lineTo(offsetX + width / 2 - 6, offsetY + height / 2 + 10);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(offsetX + width / 2 + 8, offsetY + height / 2);
    ctx.lineTo(offsetX + width - 2, offsetY + height / 2 + 5);
    ctx.lineTo(offsetX + width / 2 + 6, offsetY + height / 2 + 10);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;

    // Engine glow
    ctx.fillStyle = '#FF00FF';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(offsetX + width / 2, offsetY + height - 2, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Creates an aggressive enemy drone sprite with magenta neon glow
   */
  static generateEnemyDrone(
    width: number = 40,
    height: number = 40,
    glow: boolean = true
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = width + (glow ? 10 : 0);
    canvas.height = height + (glow ? 10 : 0);
    const ctx = canvas.getContext('2d')!;

    const offsetX = glow ? 5 : 0;
    const offsetY = glow ? 5 : 0;

    // Magenta neon glow layer
    if (glow) {
      ctx.shadowColor = '#FF00FF';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Main drone body - hexagonal aggressive form
    ctx.fillStyle = '#FF00FF';
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 2.5;

    const centerX = offsetX + width / 2;
    const centerY = offsetY + height / 2;
    const radius = width / 2.5;

    // Hexagon body
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Central core - cyan
    ctx.fillStyle = '#00FFFF';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Targeting reticle
    ctx.strokeStyle = '#FF00FF';
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Weapon ports (magenta)
    ctx.fillStyle = '#FF00FF';
    ctx.globalAlpha = 0.9;
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius * 0.7;
      const y = centerY + Math.sin(angle) * radius * 0.7;
      ctx.beginPath();
      ctx.rect(x - 2, y - 2, 4, 4);
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Glow pulse effect (additive)
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = '#FF00FF';
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    return canvas;
  }

  /**
   * Creates a small aggressive fighter variant
   */
  static generateAggressiveFighter(
    width: number = 24,
    height: number = 36,
    glow: boolean = true
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = width + (glow ? 8 : 0);
    canvas.height = height + (glow ? 8 : 0);
    const ctx = canvas.getContext('2d')!;

    const offsetX = glow ? 4 : 0;
    const offsetY = glow ? 4 : 0;

    // Cyan glow
    if (glow) {
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = 12;
    }

    // Sleek delta-wing design
    ctx.fillStyle = '#00FFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1.5;

    // Main body - sharp angular
    ctx.beginPath();
    ctx.moveTo(offsetX + width / 2, offsetY + 2);
    ctx.lineTo(offsetX + width, offsetY + height * 0.4);
    ctx.lineTo(offsetX + width / 2 + 4, offsetY + height);
    ctx.lineTo(offsetX + width / 2 - 4, offsetY + height);
    ctx.lineTo(offsetX, offsetY + height * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Hot engine glow
    ctx.fillStyle = '#FF00FF';
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(offsetX + width / 2, offsetY + height - 1, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit
    ctx.fillStyle = '#FF00FF';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(offsetX + width / 2, offsetY + 6, 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  }

  /**
   * Creates holographic HUD display elements
   */
  static generateHUDElement(
    type: 'reticle' | 'radar' | 'target' | 'bar',
    size: number = 64
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    const centerX = size / 2;
    const centerY = size / 2;

    ctx.strokeStyle = '#00FFFF';
    ctx.fillStyle = '#00FFFF';
    ctx.lineWidth = 1.5;

    switch (type) {
      case 'reticle':
        // Targeting reticle
        ctx.globalAlpha = 0.8;

        // Outer circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.2, 0, Math.PI * 2);
        ctx.stroke();

        // Crosshairs
        ctx.beginPath();
        ctx.moveTo(centerX - size * 0.45, centerY);
        ctx.lineTo(centerX - size * 0.35, centerY);
        ctx.moveTo(centerX + size * 0.35, centerY);
        ctx.lineTo(centerX + size * 0.45, centerY);
        ctx.moveTo(centerX, centerY - size * 0.45);
        ctx.lineTo(centerX, centerY - size * 0.35);
        ctx.moveTo(centerX, centerY + size * 0.35);
        ctx.lineTo(centerX, centerY + size * 0.45);
        ctx.stroke();

        // Lock indicator dots
        ctx.fillStyle = '#FF00FF';
        for (let i = 0; i < 4; i++) {
          const angle = (Math.PI / 2) * i;
          const x = centerX + Math.cos(angle) * size * 0.35;
          const y = centerY + Math.sin(angle) * size * 0.35;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'radar':
        // Radar display
        ctx.globalAlpha = 0.6;

        // Sweep circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.45, 0, Math.PI * 2);
        ctx.stroke();

        // Grid lines
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, (size * 0.45 * i) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Center point
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#00FFFF';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'target':
        // Target lock indicator
        ctx.globalAlpha = 0.9;

        // Pulsing square
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(
          centerX - size * 0.3,
          centerY - size * 0.3,
          size * 0.6,
          size * 0.6
        );
        ctx.stroke();

        // Corner brackets
        const cornerSize = size * 0.15;
        const corners = [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ];

        for (const [dx, dy] of corners) {
          const x = centerX + dx * size * 0.3;
          const y = centerY + dy * size * 0.3;

          ctx.beginPath();
          ctx.moveTo(x - dx * cornerSize, y);
          ctx.lineTo(x, y);
          ctx.lineTo(x, y - dy * cornerSize);
          ctx.stroke();
        }
        break;

      case 'bar':
        // Energy/health bar
        ctx.strokeStyle = '#00FFFF';
        ctx.fillStyle = '#00FFFF';

        // Bar frame
        ctx.beginPath();
        ctx.rect(size * 0.1, size * 0.4, size * 0.8, size * 0.2);
        ctx.stroke();

        // Fill (80%)
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.rect(size * 0.1, size * 0.4, size * 0.64, size * 0.2);
        ctx.fill();

        // Segments
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          const x = size * 0.1 + (size * 0.8 * i) / 4;
          ctx.beginPath();
          ctx.moveTo(x, size * 0.4);
          ctx.lineTo(x, size * 0.6);
          ctx.stroke();
        }
        break;
    }

    ctx.globalAlpha = 1;
    return canvas;
  }

  /**
   * Generates particle/explosion VFX sprites
   */
  static generateExplosionParticle(
    size: number = 16,
    variant: 'spark' | 'burst' | 'shockwave' = 'spark'
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = size * 2;
    canvas.height = size * 2;
    const ctx = canvas.getContext('2d')!;

    const centerX = size;
    const centerY = size;

    switch (variant) {
      case 'spark':
        // Bright spark particle
        ctx.fillStyle = '#FF00FF';
        ctx.globalAlpha = 0.9;

        // Central bright core
        ctx.beginPath();
        ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Glow halo
        ctx.shadowColor = '#FF00FF';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Trailing effect
        ctx.globalAlpha = 0.3;
        for (let i = 1; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(centerX - i * 1.5, centerY, 2 - i * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case 'burst':
        // Explosive burst
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.8;

        // Multiple rays
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 / 8) * i;
          const x = centerX + Math.cos(angle) * size * 0.8;
          const y = centerY + Math.sin(angle) * size * 0.8;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }

        // Core flash
        ctx.fillStyle = '#FF00FF';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'shockwave':
        // Expanding shockwave ring
        ctx.strokeStyle = '#00FFFF';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;

        ctx.shadowColor = '#00FFFF';
        ctx.shadowBlur = 10;

        // Multiple rings for depth
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = 0.7 - i * 0.15;
          ctx.beginPath();
          ctx.arc(centerX, centerY, (size * 0.6 * i) / 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
    }

    ctx.globalAlpha = 1;
    ctx.shadowColor = 'transparent';
    return canvas;
  }

  /**
   * Generates 80s synthwave grid background pattern
   */
  static generateGridBackground(
    width: number = 800,
    height: number = 600,
    gridSize: number = 40
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Dark cosmic background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#0f0f2e');
    gradient.addColorStop(1, '#1a0a2e');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Horizontal grid lines - cyan
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.3;

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Vertical grid lines - magenta
    ctx.strokeStyle = '#FF00FF';

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Far background stars
    ctx.fillStyle = '#00FFFF';
    ctx.globalAlpha = 0.6;

    const seededRandom = (x: number, y: number) => {
      const sin = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return sin - Math.floor(sin);
    };

    for (let y = 0; y < height; y += gridSize * 2) {
      for (let x = 0; x < width; x += gridSize * 2) {
        if (seededRandom(x, y) > 0.85) {
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Horizon glow
    ctx.globalAlpha = 0.2;
    const horizonGradient = ctx.createLinearGradient(0, height * 0.6, 0, height);
    horizonGradient.addColorStop(0, 'transparent');
    horizonGradient.addColorStop(1, '#FF00FF');
    ctx.fillStyle = horizonGradient;
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.globalAlpha = 1;
    return canvas;
  }

  /**
   * Generates parallax mountain silhouette for depth
   */
  static generateMountainSilhouette(
    width: number = 800,
    height: number = 200,
    depth: 'near' | 'far' = 'far'
  ): Canvas {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = depth === 'far' ? '#1a0a2e' : '#0f0f2e';
    ctx.fillRect(0, 0, width, height);

    // Mountain silhouette
    const mountainColor = depth === 'far' ? '#FF00FF' : '#00FFFF';
    ctx.fillStyle = mountainColor;
    ctx.globalAlpha = depth === 'far' ? 0.15 : 0.25;

    ctx.beginPath();
    ctx.moveTo(0, height);

    const peaks = depth === 'far' ? 4 : 6;
    const peakHeight = depth === 'far' ? height * 0.6 : height * 0.5;

    for (let i = 0; i <= peaks; i++) {
      const x = (width / peaks) * i;
      const peakX = x + (width / peaks) * 0.5;
      const peakY = height - Math.random() * peakHeight;

      ctx.lineTo(x, peakY);
      ctx.lineTo(peakX, height - peakHeight);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    return canvas;
  }
}

export default NeonSpriteGenerator;
