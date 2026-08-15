/**
 * Player.js - Controllable Merchant Traveler
 * 
 * Supports smooth WASD/Arrow movement with delta-time consistency,
 * directional facing (up, down, left, right), walking step animation,
 * and AABB obstacle collision resolution.
 */

import { PLAYER_SPEED, WORLD_WIDTH, WORLD_HEIGHT, DEBUG_COLLISION } from '../../game/constants';
import { CollisionSystem } from './Collision';
import { PixelSpriteRenderer } from '../../game/rendering/PixelSpriteRenderer';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = PLAYER_SPEED; // pixels per second
    this.facing = 'down'; // 'up' | 'down' | 'left' | 'right'
    this.isMoving = false;
    this.walkTimer = 0;

    // Collision bounding box around feet/base of merchant
    this.collisionBox = {
      offsetX: -10,
      offsetY: -4,
      width: 20,
      height: 16
    };

    this.name = 'Merchant Traveler';
    this.gold = 250;
    this.knowledge = 0;
    this.currentLocation = 'Ujjain';
  }

  /**
   * Update player position using delta time and input vector
   * @param {number} dt - delta time in seconds
   * @param {{dx: number, dy: number, isMoving: boolean, direction: string | null}} inputVector 
   * @param {Array} obstacles 
   * @param {number} worldWidth 
   * @param {number} worldHeight 
   */
  update(dt, inputVector, obstacles, worldWidth = WORLD_WIDTH, worldHeight = WORLD_HEIGHT) {
    this.isMoving = inputVector.isMoving;

    if (inputVector.direction) {
      this.facing = inputVector.direction;
    }

    if (this.isMoving) {
      this.walkTimer += dt * 10;

      // Distance to move in pixels this frame
      const deltaX = inputVector.dx * this.speed * dt;
      const deltaY = inputVector.dy * this.speed * dt;

      // Resolve movement with AABB collision and world boundaries (with wall sliding)
      const resolved = CollisionSystem.resolveMovement(
        this.x,
        this.y,
        deltaX,
        deltaY,
        this.collisionBox,
        obstacles,
        worldWidth,
        worldHeight
      );

      this.x = resolved.x;
      this.y = resolved.y;

      // Spawn dust particle and trigger footstep audio during movement
      if (typeof window !== 'undefined') {
        import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
          globalAudioManager.playFootstep();
        });
        if (Math.random() < 0.15) {
          import('../../game/fx/ParticleSystem').then(({ globalParticleSystem }) => {
            globalParticleSystem.spawnDust(this.x, this.y);
          });
        }
      }
    } else {
      this.walkTimer = 0;
    }
  }

  draw(ctx, time = 0) {
    const x = this.x;
    const y = this.y;

    // 1. Subtle player focus ring
    ctx.save();
    const ringPulse = 14 + Math.sin(time * 3) * 1.5;
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.lineDashOffset = time * 5;
    ctx.beginPath();
    ctx.ellipse(x, y + 4, ringPulse, ringPulse * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2. Draw 2D Pixel-Art Merchant Player Sprite
    PixelSpriteRenderer.drawCharacter(ctx, x, y, {
      facing: this.facing,
      isMoving: this.isMoving,
      walkTimer: this.walkTimer,
      time: time,
      type: 'player',
      colors: {
        robe: '#c84b31', // Saffron-Crimson Kurta
        turban: '#f4a261', // Saffron Pagri
        sash: '#ffd166', // Golden Kamarbandh
        accent: '#1d3557'
      },
      scale: 1.05
    });

    // 3. Debug Collision Box
    if (DEBUG_COLLISION) {
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        x + this.collisionBox.offsetX,
        y + this.collisionBox.offsetY,
        this.collisionBox.width,
        this.collisionBox.height
      );
      ctx.fillStyle = '#00f0ff';
      ctx.font = '9px monospace';
      ctx.fillText(`(${Math.round(x)}, ${Math.round(y)})`, x, y + 16);
      ctx.restore();
    }
  }
}

