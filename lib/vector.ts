// Vector Math Utilities - Core math for the shooter game
export interface Vector2 {
  x: number;
  y: number;
}

export const Vector2 = {
  create: (x: number = 0, y: number = 0): Vector2 => ({ x, y }),
  
  add: (a: Vector2, b: Vector2): Vector2 => ({
    x: a.x + b.x,
    y: a.y + b.y,
  }),
  
  subtract: (a: Vector2, b: Vector2): Vector2 => ({
    x: a.x - b.x,
    y: a.y - b.y,
  }),
  
  multiply: (v: Vector2, scalar: number): Vector2 => ({
    x: v.x * scalar,
    y: v.y * scalar,
  }),
  
  magnitude: (v: Vector2): number => {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },
  
  normalize: (v: Vector2): Vector2 => {
    const mag = Vector2.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return { x: v.x / mag, y: v.y / mag };
  },
  
  distance: (a: Vector2, b: Vector2): number => {
    return Vector2.magnitude(Vector2.subtract(b, a));
  },
  
  angle: (v: Vector2): number => {
    return Math.atan2(v.y, v.x);
  },
  
  fromAngle: (angle: number, magnitude: number = 1): Vector2 => ({
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude,
  }),
  
  dot: (a: Vector2, b: Vector2): number => {
    return a.x * b.x + a.y * b.y;
  },
};

// Common constants
export const PI2 = Math.PI * 2;
export const degToRad = (deg: number) => (deg * Math.PI) / 180;
export const radToDeg = (rad: number) => (rad * 180) / Math.PI;
