/**
 * WellRenderer.js - Dedicated 2D Pixel-Art Ancient Stone Stepwell & Well Renderer
 * 
 * Renders:
 * - Circular ashlar masonry stone well structure with coping stones
 * - Deep clear water reservoir with animated ripple reflections
 * - Wooden timber A-frame hoist & iron pulley
 * - Coiled hemp rope & suspended bronze water bucket
 * - Adjacent stone water basin & surrounding paving stones
 */

export class WellRenderer {
  /**
   * Draw the Ancient Stone Stepwell of Ujjain
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} wx - Center X (680)
   * @param {number} wy - Base Y (860)
   * @param {number} time 
   */
  static drawStoneWell(ctx, wx = 680, wy = 860, time = 0) {
    ctx.save();

    // 1. Ground Shadow & Outer Apron Stones
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(wx, wy + 10, 30, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Surrounding Flagstone Lip
    ctx.fillStyle = '#54463b';
    ctx.beginPath();
    ctx.ellipse(wx, wy + 2, 28, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7c6d5e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 2. Ashlar Masonry Stone Rim
    ctx.fillStyle = '#6e5e50';
    ctx.beginPath();
    ctx.ellipse(wx, wy - 2, 24, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#917f6f';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Stone block seams
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.4)';
    ctx.lineWidth = 1;
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(ang) * 16, wy - 2 + Math.sin(ang) * 10);
      ctx.lineTo(wx + Math.cos(ang) * 24, wy - 2 + Math.sin(ang) * 15);
      ctx.stroke();
    }

    // 3. Deep Clear Water Reservoir with Gradient
    const waterGrad = ctx.createRadialGradient(wx, wy - 2, 2, wx, wy - 2, 16);
    waterGrad.addColorStop(0, '#2a8fa8');
    waterGrad.addColorStop(0.5, '#16576b');
    waterGrad.addColorStop(1, '#0b2b36');
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.ellipse(wx, wy - 2, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Animated Water Ripples
    const rippleR = 4 + (Math.sin(time * 3.5) + 1) * 3;
    ctx.strokeStyle = 'rgba(168, 218, 220, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(wx, wy - 2, rippleR, rippleR * 0.6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 4. Wooden A-Frame Hoist & Pulley Crossbeam
    ctx.strokeStyle = '#4a2c1d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(wx - 20, wy + 8);
    ctx.lineTo(wx, wy - 28);
    ctx.lineTo(wx + 20, wy + 8);
    ctx.stroke();

    // Top Timber Crossbeam
    ctx.fillStyle = '#6b3e22';
    ctx.fillRect(wx - 8, wy - 30, 16, 4);

    // Iron Pulley Wheel
    ctx.fillStyle = '#22150d';
    ctx.beginPath();
    ctx.arc(wx, wy - 24, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hemp Rope from Pulley down to bucket
    ctx.strokeStyle = '#ddb892';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx, wy - 24);
    ctx.lineTo(wx, wy - 8);
    ctx.stroke();

    // 5. Suspended Bronze Water Bucket
    ctx.fillStyle = '#b07d58';
    ctx.fillRect(wx - 4, wy - 8, 8, 7);
    ctx.strokeStyle = '#7c4d28';
    ctx.lineWidth = 1;
    ctx.strokeRect(wx - 4, wy - 8, 8, 7);
    // Bucket wire handle
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(wx, wy - 8, 4, Math.PI, 0);
    ctx.stroke();

    // 6. Stone Wash Trough
    ctx.fillStyle = '#5c4e43';
    ctx.fillRect(wx + 28, wy - 10, 18, 26);
    ctx.strokeStyle = '#7c6d5e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(wx + 28, wy - 10, 18, 26);

    ctx.fillStyle = '#1d6f8a';
    ctx.fillRect(wx + 30, wy - 8, 14, 22);

    ctx.restore();
  }
}
