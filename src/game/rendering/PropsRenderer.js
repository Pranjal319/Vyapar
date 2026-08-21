/**
 * PropsRenderer.js - Dedicated 2D Pixel-Art Environmental Props & Caravan Renderer
 * 
 * Renders:
 * - Wooden cargo crates with metal brackets & merchant stencils
 * - Oak barrels with iron bands
 * - Terracotta amphorae & oil jars with hemp rope netting
 * - Two-wheeled wooden caravan bullock cart with goods bundles
 * - Pack Ox / Bullock resting beside caravan with ceremonial blanket
 * - Market benches, coiled ropes, and road signposts
 */

export class PropsRenderer {
  /**
   * Draw the complete Caravan Storage Depot & Pack Animal Camp
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} dx - Center X (1340)
   * @param {number} dy - Base Y (860)
   * @param {number} time 
   */
  static drawCaravanDepot(ctx, dx = 1340, dy = 860, time = 0) {
    ctx.save();

    // Ground Dirt / Mat Footprint
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.roundRect(dx - 60, dy - 28, 125, 58, 6);
    ctx.fill();

    // 1. Stacked Wooden Cargo Crates (With metal brackets and merchant stamps)
    const crates = [
      { x: dx - 50, y: dy - 20, w: 26, h: 22, col: '#7f5539', stamp: '⚡' },
      { x: dx - 20, y: dy - 20, w: 28, h: 22, col: '#6c4a30', stamp: '☸' },
      { x: dx - 35, y: dy - 40, w: 24, h: 20, col: '#8b5e3c', stamp: '★' }
    ];

    crates.forEach(c => {
      this.drawCrate(ctx, c.x, c.y, c.w, c.h, c.col, c.stamp);
    });

    // 2. Terracotta Oil Amphorae & Jars
    const amphorae = [
      { x: dx + 12, y: dy - 8, r: 8, h: 14 },
      { x: dx + 28, y: dy - 8, r: 9, h: 16 },
      { x: dx + 20, y: dy - 24, r: 7, h: 12 }
    ];

    amphorae.forEach(a => {
      this.drawAmphora(ctx, a.x, a.y, a.r, a.h);
    });

    // 3. Wooden Oak Barrels
    this.drawBarrel(ctx, dx + 44, dy - 18, 10, 16);
    this.drawBarrel(ctx, dx + 58, dy - 16, 9, 14);

    // 4. Coiled Hemp Ropes
    this.drawCoiledRope(ctx, dx - 10, dy + 6, 8);

    // 5. Two-Wheeled Wooden Cargo Bullock Cart
    this.drawCargoCart(ctx, dx - 10, dy + 18, time);

    // 6. Resting Pack Bullock / Ox with Ceremonial Blanket
    this.drawPackBullock(ctx, dx + 38, dy + 16, time);

    ctx.restore();
  }

  /**
   * Draw a detailed wooden cargo crate
   */
  static drawCrate(ctx, x, y, w, h, col = '#7f5539', stamp = '') {
    ctx.save();
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#3a2315';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, w, h);

    // Inner cross brace
    ctx.strokeStyle = 'rgba(40, 20, 10, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
    ctx.moveTo(x + w, y);
    ctx.lineTo(x, y + h);
    ctx.stroke();

    // Metal corner reinforcement brackets
    ctx.fillStyle = '#1e1a17';
    ctx.fillRect(x, y, 4, 4);
    ctx.fillRect(x + w - 4, y, 4, 4);
    ctx.fillRect(x, y + h - 4, 4, 4);
    ctx.fillRect(x + w - 4, y + h - 4, 4, 4);

    // Guild Stencil Stamp
    if (stamp) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stamp, x + w / 2, y + h / 2);
    }
    ctx.restore();
  }

  /**
   * Draw a detailed oak barrel
   */
  static drawBarrel(ctx, x, y, r, h) {
    ctx.save();
    // Barrel Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, r + 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wood body
    ctx.fillStyle = '#6b4226';
    ctx.beginPath();
    ctx.ellipse(x, y, r, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2012';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Iron Hoops
    ctx.strokeStyle = '#22150d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - r + 1, y - h / 4);
    ctx.lineTo(x + r - 1, y - h / 4);
    ctx.moveTo(x - r, y + h / 4);
    ctx.lineTo(x + r, y + h / 4);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw a clay amphora jar
   */
  static drawAmphora(ctx, x, y, r, h) {
    ctx.save();
    ctx.fillStyle = '#b05d3b';
    ctx.beginPath();
    ctx.ellipse(x, y, r, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c351b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Clay neck & lip
    ctx.fillStyle = '#c4714e';
    ctx.fillRect(x - 3, y - h / 2 - 3, 6, 4);

    // Hemp netting handles
    ctx.strokeStyle = '#e9c46a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x - r + 1, y - 2, 3, 0, Math.PI * 2);
    ctx.arc(x + r - 1, y - 2, 3, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw coiled hemp rope
   */
  static drawCoiledRope(ctx, x, y, r) {
    ctx.save();
    ctx.strokeStyle = '#ddb892';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, r - 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /**
   * Draw two-wheeled wooden cargo cart
   */
  static drawCargoCart(ctx, x, y, time) {
    ctx.save();

    // Cart Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + 4, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cart Wooden Bed Frame
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(x - 18, y - 8, 36, 16);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 18, y - 8, 36, 16);

    // Cargo Burlap Parcels on Cart
    ctx.fillStyle = '#9c6644';
    ctx.fillRect(x - 14, y - 14, 14, 10);
    ctx.fillStyle = '#bc6c25';
    ctx.fillRect(x + 2, y - 16, 14, 12);
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(x - 6, y - 20, 12, 10);

    // Wooden Spoked Wheels
    [-18, 18].forEach(wx => {
      ctx.fillStyle = '#3a2012';
      ctx.beginPath();
      ctx.arc(x + wx, y + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Wheel Spokes
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + wx - 8, y + 2);
      ctx.lineTo(x + wx + 8, y + 2);
      ctx.moveTo(x + wx, y - 6);
      ctx.lineTo(x + wx, y + 10);
      ctx.stroke();
    });

    // Cart Shaft (Tongue)
    ctx.strokeStyle = '#5c3a21';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 18, y);
    ctx.lineTo(x + 36, y + 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draw resting pack bullock / ox with traditional ceremonial blanket
   */
  static drawPackBullock(ctx, x, y, time) {
    ctx.save();
    const breathBob = Math.sin(time * 2) * 0.8;

    // Animal Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 8, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bullock Body (White/Cream Zebu Ox with Hump)
    ctx.fillStyle = '#e9ecef';
    ctx.beginPath();
    ctx.ellipse(x, y + 2 + breathBob, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Characteristic Zebu Shoulder Hump
    ctx.fillStyle = '#dee2e6';
    ctx.beginPath();
    ctx.arc(x - 5, y - 6 + breathBob, 6, 0, Math.PI * 2);
    ctx.fill();

    // Head & Muzzle
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.ellipse(x + 12, y - 2 + breathBob, 7, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Curved Horns
    ctx.strokeStyle = '#495057';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 10, y - 6 + breathBob);
    ctx.quadraticCurveTo(x + 12, y - 14 + breathBob, x + 16, y - 12 + breathBob);
    ctx.stroke();

    // Ceremonial Red & Gold Saddle Cloth / Jhool
    ctx.fillStyle = '#d90429';
    ctx.fillRect(x - 8, y - 2 + breathBob, 16, 8);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 8, y + 5 + breathBob, 16, 2);

    // Brass Bell on Neck Collar
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(x + 8, y + 4 + breathBob, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
