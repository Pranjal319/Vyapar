/**
 * Merchant.js - Moving Merchant NPC Game Object
 * 
 * Follows predefined waypoint paths with delta-time physics, pauses at waypoints,
 * tracks facing direction, renders distinct robes and turbans, and displays
 * a compact RPG interaction prompt when the player is within range.
 */

import { WORLD_WIDTH, WORLD_HEIGHT } from '../../game/constants';
import { PixelSpriteRenderer } from '../../game/rendering/PixelSpriteRenderer';

export class Merchant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.title = data.title || 'Merchant';
    this.role = data.role || 'npc';
    this.dialogueId = data.dialogueId || null;
    this.speed = data.speed || 30; // px per second
    this.colors = data.colors || {
      robe: '#1d3557',
      turban: '#ffd166',
      sash: '#e63946'
    };

    this.path = data.path && data.path.length > 0 ? data.path : [{ x: data.x || 800, y: data.y || 250 }];
    this.currentWaypointIndex = 0;
    this.idleDuration = data.idleTime || 1.8;
    this.idleTimer = 0;
    this.isIdle = false;
    this.isMoving = true;

    // Start position at first waypoint
    this.x = this.path[0].x;
    this.y = this.path[0].y;

    this.facing = 'down';
    this.walkTimer = Math.random() * 5; // offset walking step phase
    this.isPlayerNear = false;
  }

  /**
   * Update waypoint path progression and position with delta-time
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    if (this.path.length <= 1) {
      this.isMoving = false;
      return;
    }

    if (this.isIdle) {
      this.idleTimer -= dt;
      if (this.idleTimer <= 0) {
        this.isIdle = false;
        this.isMoving = true;
        this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.path.length;
      }
      return;
    }

    // Current target waypoint
    const target = this.path[this.currentWaypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Reached waypoint threshold
    if (dist <= 3.0) {
      this.x = target.x;
      this.y = target.y;
      this.isIdle = true;
      this.isMoving = false;
      this.idleTimer = this.idleDuration * (0.8 + Math.random() * 0.4);
      return;
    }

    // Normalize and step
    const dirX = dx / dist;
    const dirY = dy / dist;

    this.x += dirX * this.speed * dt;
    this.y += dirY * this.speed * dt;

    // Keep safely inside world bounds
    this.x = Math.max(10, Math.min(WORLD_WIDTH - 10, this.x));
    this.y = Math.max(10, Math.min(WORLD_HEIGHT - 10, this.y));

    // Update facing direction based on dominant movement axis
    if (Math.abs(dirX) > Math.abs(dirY)) {
      this.facing = dirX > 0 ? 'right' : 'left';
    } else {
      this.facing = dirY > 0 ? 'down' : 'up';
    }

    this.walkTimer += dt * 7;
  }

  /**
   * Draw the merchant/citizen NPC with pixel-art rendering
   */
  draw(ctx, time = 0, isPlayerNear = false) {
    this.isPlayerNear = isPlayerNear;
    const x = this.x;
    const y = this.y;

    // 1. Draw 2D Pixel-Art NPC Sprite
    let charType = 'merchant';
    if (this.id === 'merchant_dev') charType = 'elder_merchant';
    else if (this.role === 'guard') charType = 'guard';
    else if (this.role === 'citizen') charType = 'citizen';
    else if (this.role === 'artisan') charType = 'artisan';

    PixelSpriteRenderer.drawCharacter(ctx, x, y, {
      facing: this.facing,
      isMoving: this.isMoving,
      walkTimer: this.walkTimer,
      time: time,
      type: charType,
      colors: this.colors,
      scale: this.id === 'merchant_dev' ? 1.1 : 1.0
    });

    // 2. Compact Interaction Prompt on Proximity
    if (isPlayerNear) {
      ctx.save();
      const promptY = y - 44 + Math.sin(time * 4) * 2;
      const isGuide = (this.role === 'guide' || this.role === 'elder' || this.id === 'merchant_dev' || this.id === 'merchant_meera' || this.id === 'merchant_kalyan' || this.id === 'merchant_sundaram' || this.id === 'merchant_sutradhar' || (this.id && this.id.startsWith('narrator_')));
      const isTrader = !isGuide && (this.role === 'trader' || this.role === 'artisan');
      
      const promptText = isGuide 
        ? `[E] TALK • ${this.name}`
        : (isTrader ? `[E] TRADE • ${this.name}` : `[E] TALK • ${this.name}`);

      ctx.font = 'bold 9px "Outfit", sans-serif';
      const textWidth = ctx.measureText(promptText).width;
      const boxWidth = textWidth + 18;

      // Dark golden-bordered badge
      ctx.fillStyle = 'rgba(12, 17, 26, 0.92)';
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x - boxWidth / 2, promptY - 9, boxWidth, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Text
      ctx.fillStyle = '#ffd166';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(promptText, x, promptY);
      ctx.restore();
    }
  }
}
