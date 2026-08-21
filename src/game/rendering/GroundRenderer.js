/**
 * GroundRenderer.js - Detailed 2D Pixel-Art Historical Ground System
 * 
 * Renders multi-layered terrain:
 * - Natural clay & earthen soil base with gravel and sand texture
 * - Detailed cobblestone roads with irregular flagstones, wear gradients & mortar
 * - Central crossroads plaza with mandala paving stones
 * - Worn walking paths & dirt trails
 * - Subtle grass tufts, scattered pebbles & road kerb stones
 */

export class GroundRenderer {
  /**
   * Render the complete ground terrain for the world
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} worldWidth 
   * @param {number} worldHeight 
   * @param {number} time 
   */
  static renderGround(ctx, worldWidth, worldHeight, time = 0) {
    ctx.save();

    // 1. Base Earthen / Sandstone Soil Layer
    ctx.fillStyle = '#241a12';
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    // Warm radial lighting gradient
    const groundGrad = ctx.createRadialGradient(1000, 710, 180, 1000, 710, 850);
    groundGrad.addColorStop(0, '#3d2e20');
    groundGrad.addColorStop(0.4, '#32251a');
    groundGrad.addColorStop(0.8, '#261b13');
    groundGrad.addColorStop(1, '#1b120c');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    // Subtle pixel earth speckles
    ctx.fillStyle = 'rgba(212, 163, 115, 0.04)';
    for (let i = 0; i < 220; i++) {
      const sx = ((i * 157) % worldWidth);
      const sy = ((i * 263) % worldHeight);
      ctx.fillRect(sx, sy, (i % 3) + 2, (i % 2) + 1);
    }

    // 2. Worn Dirt Paths & Walking Trails (around stalls & natural borders)
    this.drawDirtPaths(ctx);

    // 3. Main Cobblestone Road Network & Crossroads Plaza
    this.drawStonePaving(ctx);

    // 4. Road Kerbs & Transition Edges
    this.drawRoadKerbs(ctx);

    // 5. Environmental Vegetation (Grass tufts, wild marigolds, moss)
    this.drawVegetationPatches(ctx, time);

    ctx.restore();
  }

  static drawDirtPaths(ctx) {
    ctx.fillStyle = '#423326';
    
    // Trail to North Guild Hall
    ctx.beginPath();
    ctx.roundRect(920, 380, 160, 240, 8);
    ctx.fill();

    // Trail to South Caravanserai
    ctx.beginPath();
    ctx.roundRect(920, 800, 160, 250, 8);
    ctx.fill();

    // Path around Stepwell
    ctx.beginPath();
    ctx.arc(680, 860, 52, 0, Math.PI * 2);
    ctx.fill();

    // Path around Banyan Tree
    ctx.beginPath();
    ctx.arc(600, 700, 56, 0, Math.PI * 2);
    ctx.fill();

    // Path to Storage Depot
    ctx.beginPath();
    ctx.roundRect(1270, 810, 160, 100, 6);
    ctx.fill();
  }

  static drawStonePaving(ctx) {
    ctx.save();

    // Main East-West Market Highway (x: 280 to 1720, y: 620 to 800)
    ctx.fillStyle = '#483d33';
    ctx.fillRect(280, 620, 1440, 180);

    // North-South Arterial Street
    ctx.fillRect(920, 420, 160, 580);

    // Stone Stall Terraces (Sub-paving under market booths)
    ctx.fillStyle = '#52453a';
    ctx.fillRect(740, 520, 180, 110);
    ctx.fillRect(1080, 520, 180, 110);
    ctx.fillRect(740, 780, 180, 110);
    ctx.fillRect(1080, 780, 180, 110);

    // Detailed Flagstone & Cobblestone Paver Grid
    ctx.lineWidth = 1;

    // East-West Paving Stones
    for (let x = 280; x < 1720; x += 32) {
      for (let y = 620; y < 800; y += 20) {
        const offset = ((y / 20) % 2 === 0) ? 16 : 0;
        const px = x + offset;
        if (px < 1720) {
          const shade = ((px * 3 + y * 7) % 5);
          ctx.fillStyle = shade === 0 ? '#5a4c40' : (shade === 1 ? '#443930' : (shade === 2 ? '#504337' : '#4a3e33'));
          ctx.fillRect(px + 1, y + 1, 30, 18);
          
          // Subtle stone highlight on top-left edge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          ctx.fillRect(px + 1, y + 1, 30, 2);
          ctx.fillRect(px + 1, y + 1, 2, 18);

          // Subtle stone shadow on bottom-right edge
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.fillRect(px + 1, y + 17, 30, 2);
          ctx.fillRect(px + 29, y + 1, 2, 18);
        }
      }
    }

    // North-South Paving Stones
    for (let x = 920; x < 1080; x += 32) {
      for (let y = 420; y < 1000; y += 20) {
        if (y < 620 || y >= 800) {
          const offset = ((y / 20) % 2 === 0) ? 16 : 0;
          const px = x + offset;
          if (px < 1080) {
            ctx.fillStyle = ((px + y) % 4 === 0) ? '#53463a' : '#493d32';
            ctx.fillRect(px + 1, y + 1, 30, 18);

            ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
            ctx.fillRect(px + 1, y + 17, 30, 2);
          }
        }
      }
    }

    // Central Crossroads Mandala Plaza (Radial Sandstone Feature)
    const cx = 1000;
    const cy = 710;
    const plazaR = 86;

    // Outer Plaza Border Ring
    ctx.fillStyle = '#5c4b3d';
    ctx.beginPath();
    ctx.arc(cx, cy, plazaR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Radial Stone Slices
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < 12; a++) {
      const ang = (a * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * plazaR, cy + Math.sin(ang) * plazaR);
      ctx.stroke();
    }

    // Inner Medallion
    ctx.fillStyle = '#261c14';
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#e76f51';
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚡', cx, cy);

    ctx.restore();
  }

  static drawRoadKerbs(ctx) {
    // Sandstone Curb Edge Bevels
    ctx.fillStyle = '#6e5d4e';
    ctx.fillRect(280, 616, 1440, 5);
    ctx.fillRect(280, 799, 1440, 5);

    // Weathered curb shadows
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(280, 621, 1440, 2);
    ctx.fillRect(280, 804, 1440, 2);
  }

  static drawVegetationPatches(ctx, time = 0) {
    ctx.save();
    
    // Scattered grass tufts along dirt road borders
    const grassPoints = [
      { x: 480, y: 605 }, { x: 550, y: 610 }, { x: 670, y: 608 },
      { x: 1330, y: 608 }, { x: 1460, y: 610 }, { x: 1600, y: 605 },
      { x: 480, y: 812 }, { x: 560, y: 815 }, { x: 1320, y: 812 },
      { x: 1470, y: 815 }, { x: 1620, y: 812 }, { x: 880, y: 480 },
      { x: 1110, y: 480 }, { x: 880, y: 920 }, { x: 1110, y: 920 }
    ];

    grassPoints.forEach((gp, idx) => {
      ctx.fillStyle = (idx % 2 === 0) ? '#2d6a4f' : '#40916c';
      ctx.fillRect(gp.x, gp.y, 2, 4);
      ctx.fillRect(gp.x + 3, gp.y - 2, 2, 6);
      ctx.fillRect(gp.x + 6, gp.y, 2, 4);

      // Occasional tiny wild marigold blossom
      if (idx % 3 === 0) {
        ctx.fillStyle = '#ffb703';
        ctx.fillRect(gp.x + 3, gp.y - 4, 3, 3);
      }
    });

    ctx.restore();
  }
}
