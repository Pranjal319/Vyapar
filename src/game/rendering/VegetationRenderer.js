/**
 * VegetationRenderer.js - Dedicated 2D Pixel-Art Trees & Foliage Renderer
 * 
 * Renders:
 * - Sacred Great Banyan Tree: wide gnarled bark trunk, aerial prop roots,
 *   circular stone chabutra platform, multi-tiered leafy pixel foliage
 * - Peepal & Neem Trees: organic pixel leaf clusters, deep canopy shading
 * - Date Palms: ringed trunks, arching fronds & dates
 * - Flowering Shrubs & Planters: marigold, frangipani & hibiscus
 */

export class VegetationRenderer {
  /**
   * Draw the Sacred Great Banyan Tree of Ujjain
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} tx - Center X (600)
   * @param {number} ty - Base Y (700)
   * @param {number} time 
   */
  static drawBanyanTree(ctx, tx = 600, ty = 700, time = 0) {
    ctx.save();

    // 1. Chabutra (Circular Ashlar Stone Sitting Platform)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 16, 38, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c4e41';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 12, 34, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#857361';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Gnarled Ancient Banyan Trunk with Bark Texture
    ctx.fillStyle = '#3a2012';
    ctx.beginPath();
    ctx.ellipse(tx, ty + 4, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk vertical wood grain
    ctx.strokeStyle = '#24140a';
    ctx.lineWidth = 1.5;
    for (let bx = -10; bx <= 10; bx += 5) {
      ctx.beginPath();
      ctx.moveTo(tx + bx, ty - 18);
      ctx.lineTo(tx + bx + (bx > 0 ? 2 : -2), ty + 6);
      ctx.stroke();
    }

    // 3. Aerial Prop Roots (Draping from branches to ground)
    ctx.strokeStyle = '#4e2d19';
    ctx.lineWidth = 2;
    const roots = [-18, -10, 0, 9, 17];
    roots.forEach(rx => {
      ctx.beginPath();
      ctx.moveTo(tx + rx, ty - 22);
      ctx.quadraticCurveTo(tx + rx + (rx > 0 ? 4 : -4), ty - 4, tx + rx, ty + 10);
      ctx.stroke();
    });

    // 4. Multi-Layered Pixel-Art Foliage Clusters
    const foliageClusters = [
      // Deep shadow under-layer
      { dx: 0, dy: -46, r: 42, col: '#1b4332' },
      { dx: -32, dy: -36, r: 34, col: '#1b4332' },
      { dx: 32, dy: -36, r: 34, col: '#1b4332' },
      // Mid-tone green layer
      { dx: -22, dy: -42, r: 30, col: '#2d6a4f' },
      { dx: 22, dy: -42, r: 30, col: '#2d6a4f' },
      { dx: 0, dy: -56, r: 32, col: '#40916c' },
      // Sunlit top highlights
      { dx: -12, dy: -58, r: 24, col: '#52b788' },
      { dx: 14, dy: -54, r: 22, col: '#74c69d' },
      { dx: 0, dy: -68, r: 18, col: '#95d5b2' }
    ];

    foliageClusters.forEach(fc => {
      ctx.fillStyle = fc.col;
      ctx.beginPath();
      ctx.arc(tx + fc.dx, ty + fc.dy, fc.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Scattered Marigold Flower Offerings on Chabutra
    ctx.fillStyle = '#ffb703';
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      const fx = tx + Math.cos(ang) * 26;
      const fy = ty + 12 + Math.sin(ang) * 10;
      ctx.beginPath();
      ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw a Peepal / Neem Tree
   */
  static drawPeepalTree(ctx, x, y, r = 26, time = 0) {
    ctx.save();

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, r * 0.8, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#4a2c1d';
    ctx.fillRect(x - 4, y - 6, 8, 18);
    ctx.strokeStyle = '#2b190f';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 4, y - 6, 8, 18);

    // Multi-shade foliage
    const layers = [
      { dy: -18, radius: r, col: '#1b4332' },
      { dy: -24, radius: r * 0.85, col: '#2d6a4f' },
      { dy: -30, radius: r * 0.65, col: '#40916c' },
      { dy: -34, radius: r * 0.45, col: '#52b788' }
    ];

    layers.forEach(l => {
      ctx.fillStyle = l.col;
      ctx.beginPath();
      ctx.arc(x, y + l.dy, l.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Draw a Date Palm Tree
   */
  static drawPalmTree(ctx, x, y, time = 0) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Slender ringed trunk
    ctx.strokeStyle = '#4e2f1b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.quadraticCurveTo(x + 4, y - 6, x, y - 22);
    ctx.stroke();

    // Palm fronds
    ctx.fillStyle = '#2d6a4f';
    for (let a = 0; a < 6; a++) {
      const ang = (a * Math.PI) / 3;
      const fx = x + Math.cos(ang) * 16;
      const fy = y - 22 + Math.sin(ang) * 12;
      ctx.beginPath();
      ctx.moveTo(x, y - 22);
      ctx.quadraticCurveTo(x + Math.cos(ang) * 10, y - 28, fx, fy);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#40916c';
      ctx.stroke();
    }

    // Dates cluster
    ctx.fillStyle = '#bc6c25';
    ctx.beginPath();
    ctx.arc(x, y - 20, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
