/**
 * Caravan.js - Renders Player Merchant Caravan & Background Trade Caravans
 * 
 * Draws detailed historical merchant caravans with camels/oxen, gold badges,
 * and smooth position interpolation along strategic trade routes.
 */

import { RouteRenderer } from './RouteRenderer';

export class Caravan {
  /**
   * Render Player Merchant Caravan at current progress on active route
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Object} route - Active travel route definition
   * @param {number} progress - 0.0 to 1.0 travel completion ratio
   * @param {number} time - Animation timer
   */
  static drawPlayerCaravan(ctx, route, progress, time = 0) {
    if (!route) return;

    const pos = RouteRenderer.getPointAtProgress(route, progress);
    const bobY = Math.sin(time * 6) * 3;

    ctx.save();

    // 1. Caravan Ground Aura Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 10, 18, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing golden pulsing ring
    const ringPulse = 20 + Math.sin(time * 4) * 3;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 10, ringPulse, ringPulse * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Caravan Entity (Merchant & Camel/Ox Cart Sprite)
    // Draw Merchant Camel body
    ctx.fillStyle = '#c68b59'; // Warm camel brown
    ctx.beginPath();
    ctx.ellipse(pos.x - 4, pos.y + bobY, 10, 6, 0, 0, Math.PI * 2); // Body
    ctx.fill();

    // Camel Hump & Satchel Packs
    ctx.fillStyle = '#8e562e';
    ctx.beginPath();
    ctx.arc(pos.x - 6, pos.y - 4 + bobY, 5, 0, Math.PI * 2); // Hump
    ctx.fill();

    // Cargo Packs / Bales
    ctx.fillStyle = '#e07a5f';
    ctx.fillRect(pos.x - 10, pos.y - 6 + bobY, 8, 5);
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(pos.x - 2, pos.y - 6 + bobY, 7, 5);

    // Camel Neck & Head
    ctx.fillStyle = '#c68b59';
    ctx.beginPath();
    ctx.ellipse(pos.x + 8, pos.y - 5 + bobY, 3.5, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(pos.x + 11, pos.y - 10 + bobY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Merchant Traveler Rider with Saffron Turban
    ctx.fillStyle = '#f4a261'; // Turban
    ctx.beginPath();
    ctx.arc(pos.x - 4, pos.y - 11 + bobY, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Floating Label Badge: "🐪 YOUR CARAVAN"
    const labelY = pos.y - 28 + bobY;
    ctx.font = 'bold 10px "Outfit", sans-serif';
    const textWidth = ctx.measureText('🐪 YOUR CARAVAN').width;
    const boxWidth = textWidth + 16;

    ctx.fillStyle = 'rgba(12, 17, 26, 0.92)';
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pos.x - boxWidth / 2, labelY - 9, boxWidth, 18, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐪 YOUR CARAVAN', pos.x, labelY);

    ctx.restore();
  }

  /**
   * Render subtle background merchant caravans moving along trade network
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Array} bgCaravans - List of background caravan objects { route, progressSpeed, offset }
   * @param {number} time 
   */
  static drawBackgroundCaravans(ctx, bgCaravans = [], time = 0) {
    if (!bgCaravans || bgCaravans.length === 0) return;

    ctx.save();

    bgCaravans.forEach(caravan => {
      const progress = (time * caravan.speed + caravan.offset) % 1.0;
      const pos = RouteRenderer.getPointAtProgress(caravan.route, progress);
      const bobY = Math.sin(time * 3 + caravan.offset * 10) * 1.5;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + 6, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Muted camel dot
      ctx.fillStyle = 'rgba(198, 139, 89, 0.7)';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y + bobY, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(233, 196, 106, 0.8)';
      ctx.fillRect(pos.x - 3, pos.y - 3 + bobY, 5, 3);
    });

    ctx.restore();
  }
}
