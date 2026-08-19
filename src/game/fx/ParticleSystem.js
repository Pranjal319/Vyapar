/**
 * ParticleSystem.js - Lightweight Canvas particle engine for game feel
 * 
 * Supports:
 * - 'dust': Dust trail particles behind player / caravan movement
 * - 'gold': Floating gold gain/loss notification text (e.g. 💰 +35 Mudras)
 * - 'knowledge': Floating knowledge gain notification text (e.g. 📚 +10 Knowledge)
 * - 'water': Water wave reflection particles at port docks
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * Spawn dust particle at world position
   * @param {number} x 
   * @param {number} y 
   */
  spawnDust(x, y) {
    this.particles.push({
      type: 'dust',
      x: x + (Math.random() * 8 - 4),
      y: y + 10 + (Math.random() * 4 - 2),
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 8 - 4,
      radius: Math.random() * 2.5 + 1.5,
      alpha: 0.5,
      life: 0,
      maxLife: 0.4 + Math.random() * 0.3
    });
  }

  /**
   * Spawn floating text notification (Gold or Knowledge)
   * @param {number} x 
   * @param {number} y 
   * @param {string} text 
   * @param {'gold'|'knowledge'} type 
   */
  spawnFloatingText(x, y, text, type = 'gold') {
    this.particles.push({
      type,
      x,
      y: y - 20,
      text,
      vy: -25,
      alpha: 1.0,
      life: 0,
      maxLife: 1.2
    });
  }

  /**
   * Spawn water reflection particle
   * @param {number} x 
   * @param {number} y 
   */
  spawnWaterRipple(x, y) {
    this.particles.push({
      type: 'water',
      x,
      y,
      radius: Math.random() * 3 + 2,
      maxRadius: 14 + Math.random() * 6,
      alpha: 0.6,
      life: 0,
      maxLife: 1.5
    });
  }

  /**
   * Update particle positions and fade lifetimes
   * @param {number} dt 
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.type === 'dust') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, 0.5 * (1 - p.life / p.maxLife));
      } else if (p.type === 'gold' || p.type === 'knowledge') {
        p.y += p.vy * dt;
        p.alpha = Math.max(0, 1.0 - (p.life / p.maxLife));
      } else if (p.type === 'water') {
        p.radius += 8 * dt;
        p.alpha = Math.max(0, 0.6 * (1 - p.life / p.maxLife));
      }

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Render active particles onto canvas context
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Object} camera 
   */
  render(ctx, camera) {
    if (this.particles.length === 0) return;

    ctx.save();

    for (const p of this.particles) {
      const screenX = camera ? p.x - camera.x : p.x;
      const screenY = camera ? p.y - camera.y : p.y;

      if (p.type === 'dust') {
        ctx.fillStyle = `rgba(212, 163, 115, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'gold' || p.type === 'knowledge') {
        ctx.fillStyle = p.type === 'gold' ? `rgba(255, 209, 102, ${p.alpha})` : `rgba(46, 196, 182, ${p.alpha})`;
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.text, screenX, screenY);
      } else if (p.type === 'water') {
        ctx.strokeStyle = `rgba(46, 196, 182, ${p.alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY, p.radius, p.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
  }
}

export const globalParticleSystem = new ParticleSystem();
