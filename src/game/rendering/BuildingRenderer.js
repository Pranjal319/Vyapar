/**
 * BuildingRenderer.js - Dedicated 2D Pixel-Art Historical Indian Architecture Renderer
 * 
 * Renders:
 * - Grand North Guild Hall: multi-tiered sandstone palace facade, carved teak pillars,
 *   arched entry with brass-studded double doors, terracotta tiled roof, jharokha balcony,
 *   jaali lattice screens, and warm flickering brass lanterns.
 * - West & East Merchant Manors (Havelis): sandstone & adobe houses, tiled verandas,
 *   wooden doors, overhanging eaves, and decorative hanging torans.
 * - South Caravanserai: grand arched courtyard rest house with stone arcades.
 */

export class BuildingRenderer {
  /**
   * Draw the Northern Merchant Guild Hall (Avantika Guild Headquarters)
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} bx - Center X (1000)
   * @param {number} by - Base Y (360)
   * @param {number} time 
   */
  static drawGuildHall(ctx, bx = 1000, by = 360, time = 0) {
    ctx.save();

    // 1. Cast Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(bx - 145, by - 45, 290, 105);

    // 2. Main Sandstone Facade Body
    ctx.fillStyle = '#b07d58';
    ctx.fillRect(bx - 140, by - 55, 280, 95);

    // Ashlar stone masonry brick lines
    ctx.strokeStyle = 'rgba(74, 40, 22, 0.35)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 6; r++) {
      const ly = by - 55 + r * 16;
      ctx.beginPath();
      ctx.moveTo(bx - 140, ly);
      ctx.lineTo(bx + 140, ly);
      ctx.stroke();

      // Staggered vertical mortar seams
      const offset = (r % 2 === 0) ? 0 : 16;
      for (let vx = bx - 140 + offset; vx < bx + 140; vx += 32) {
        ctx.beginPath();
        ctx.moveTo(vx, ly);
        ctx.lineTo(vx, ly + 16);
        ctx.stroke();
      }
    }

    // 3. Terracotta Tile Gable Roof with Overhanging Eaves
    ctx.fillStyle = '#9e3d24';
    ctx.beginPath();
    ctx.moveTo(bx - 155, by - 55);
    ctx.lineTo(bx + 155, by - 55);
    ctx.lineTo(bx + 135, by - 85);
    ctx.lineTo(bx - 135, by - 85);
    ctx.closePath();
    ctx.fill();

    // Clay roof barrel tile ridges
    ctx.strokeStyle = '#682210';
    ctx.lineWidth = 2;
    for (let tx = bx - 142; tx <= bx + 142; tx += 14) {
      ctx.beginPath();
      ctx.moveTo(tx, by - 55);
      ctx.lineTo(tx * 0.88 + bx * 0.12, by - 85);
      ctx.stroke();
    }

    // Roof ornamental brass finials (Kalasha)
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx - 3, by - 92, 6, 8);
    ctx.fillRect(bx - 1, by - 96, 2, 4);

    // 4. Carved Teak Wooden Pillars framing entrance
    const pillarX = [bx - 90, bx - 38, bx + 28, bx + 80];
    pillarX.forEach(px => {
      ctx.fillStyle = '#452614';
      ctx.fillRect(px, by - 45, 10, 85);
      // Carved lotus pillar capitals
      ctx.fillStyle = '#6b3e22';
      ctx.fillRect(px - 2, by - 45, 14, 5);
      ctx.fillRect(px - 2, by + 35, 14, 5);
    });

    // 5. Arched Grand Entrance with Double Wooden Doors
    ctx.fillStyle = '#1c110a';
    ctx.beginPath();
    ctx.arc(bx, by + 10, 24, Math.PI, 0);
    ctx.lineTo(bx + 24, by + 40);
    ctx.lineTo(bx - 24, by + 40);
    ctx.closePath();
    ctx.fill();

    // Wooden door leaves with brass studs
    ctx.fillStyle = '#6b3e22';
    ctx.fillRect(bx - 22, by + 5, 21, 35);
    ctx.fillRect(bx + 1, by + 5, 21, 35);

    // Brass handles and studs
    ctx.fillStyle = '#ffd166';
    for (let dy = by + 12; dy <= by + 34; dy += 8) {
      ctx.fillRect(bx - 8, dy, 2, 2);
      ctx.fillRect(bx + 6, dy, 2, 2);
    }

    // 6. Jharokha Balcony Window with Jaali Screen
    ctx.fillStyle = '#452614';
    ctx.fillRect(bx - 28, by - 48, 56, 32);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx - 22, by - 42, 44, 20);
    
    // Jaali crosshatch screen
    ctx.strokeStyle = '#452614';
    ctx.lineWidth = 1;
    for (let jx = bx - 22; jx <= bx + 22; jx += 6) {
      ctx.beginPath();
      ctx.moveTo(jx, by - 42);
      ctx.lineTo(jx, by - 22);
      ctx.stroke();
    }

    // 7. Hanging Brass Lanterns with warm animated light glow
    const flicker = Math.sin(time * 6) * 0.12 + 0.88;
    [bx - 85, bx + 85].forEach(lx => {
      // Iron bracket
      ctx.strokeStyle = '#1e1611';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx, by - 18);
      ctx.lineTo(lx + 6, by - 12);
      ctx.lineTo(lx + 6, by - 6);
      ctx.stroke();

      // Brass lantern body
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(lx + 4, by - 6, 5, 6);

      // Light radial halo
      const glow = ctx.createRadialGradient(lx + 6.5, by - 3, 2, lx + 6.5, by - 3, 20);
      glow.addColorStop(0, `rgba(255, 209, 102, ${0.45 * flicker})`);
      glow.addColorStop(1, 'rgba(255, 209, 102, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx + 6.5, by - 3, 20, 0, Math.PI * 2);
      ctx.fill();
    });

    // 8. Guild Seal Signboard
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(bx - 70, by - 68, 140, 16);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx - 70, by - 68, 140, 16);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AVANTIKA GUILD HALL', bx, by - 60);

    ctx.restore();
  }

  /**
   * Draw the West Merchant Manor (Sandstone & Adobe Haveli)
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} bx - Center X (510)
   * @param {number} by - Base Y (495)
   * @param {number} time 
   */
  static drawWestManor(ctx, bx = 510, by = 495, time = 0) {
    ctx.save();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(bx - 84, by - 44, 168, 92);

    // Adobe & Sandstone Walls
    ctx.fillStyle = '#c49774';
    ctx.fillRect(bx - 80, by - 48, 160, 88);

    // Mortar lines
    ctx.strokeStyle = 'rgba(107, 66, 38, 0.25)';
    ctx.lineWidth = 1;
    for (let y = by - 48; y < by + 40; y += 18) {
      ctx.beginPath();
      ctx.moveTo(bx - 80, y);
      ctx.lineTo(bx + 80, y);
      ctx.stroke();
    }

    // Tiled Gable Roof
    ctx.fillStyle = '#a8422b';
    ctx.beginPath();
    ctx.moveTo(bx - 92, by - 48);
    ctx.lineTo(bx + 92, by - 48);
    ctx.lineTo(bx + 76, by - 74);
    ctx.lineTo(bx - 76, by - 74);
    ctx.closePath();
    ctx.fill();

    // Roof tile lines
    ctx.strokeStyle = '#702414';
    ctx.lineWidth = 1.5;
    for (let tx = bx - 80; tx <= bx + 80; tx += 12) {
      ctx.beginPath();
      ctx.moveTo(tx, by - 48);
      ctx.lineTo(tx * 0.9 + bx * 0.1, by - 74);
      ctx.stroke();
    }

    // Carved Wooden Doorway
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(bx - 16, by + 6, 32, 34);
    ctx.fillStyle = '#7a4e33';
    ctx.fillRect(bx - 13, by + 9, 26, 31);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(bx + 6, by + 22, 2, 4); // Handle

    // Lattice Windows with Wooden Frames
    const windows = [bx - 60, bx + 36];
    windows.forEach(wx => {
      ctx.fillStyle = '#261c14';
      ctx.fillRect(wx, by - 18, 24, 24);
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, by - 18, 24, 24);

      // Window cross
      ctx.beginPath();
      ctx.moveTo(wx + 12, by - 18);
      ctx.lineTo(wx + 12, by + 6);
      ctx.moveTo(wx, by - 6);
      ctx.lineTo(wx + 24, by - 6);
      ctx.stroke();
    });

    ctx.restore();
  }

  /**
   * Draw the East Merchant Manor & Warehouse
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} bx - Center X (1490)
   * @param {number} by - Base Y (495)
   * @param {number} time 
   */
  static drawEastManor(ctx, bx = 1490, by = 495, time = 0) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(bx - 84, by - 44, 168, 92);

    ctx.fillStyle = '#b88968';
    ctx.fillRect(bx - 80, by - 48, 160, 88);

    ctx.fillStyle = '#943823';
    ctx.beginPath();
    ctx.moveTo(bx - 92, by - 48);
    ctx.lineTo(bx + 92, by - 48);
    ctx.lineTo(bx + 76, by - 74);
    ctx.lineTo(bx - 76, by - 74);
    ctx.closePath();
    ctx.fill();

    // Heavy Double Cargo Warehouse Doors
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(bx - 20, by + 4, 40, 36);
    ctx.fillStyle = '#6c442d';
    ctx.fillRect(bx - 17, by + 7, 16, 33);
    ctx.fillRect(bx + 1, by + 7, 16, 33);

    // Iron cross braces on warehouse doors
    ctx.strokeStyle = '#22150d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx - 17, by + 7);
    ctx.lineTo(bx - 1, by + 40);
    ctx.moveTo(bx + 1, by + 7);
    ctx.lineTo(bx + 17, by + 40);
    ctx.stroke();

    // Upper Lattice Windows
    const windows = [bx - 60, bx + 36];
    windows.forEach(wx => {
      ctx.fillStyle = '#261c14';
      ctx.fillRect(wx, by - 18, 24, 24);
      ctx.strokeStyle = '#d4a373';
      ctx.lineWidth = 2;
      ctx.strokeRect(wx, by - 18, 24, 24);
    });

    ctx.restore();
  }

  /**
   * Draw the South Caravanserai (Traveler Rest Lodge)
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} bx - Center X (1000)
   * @param {number} by - Base Y (1045)
   * @param {number} time 
   */
  static drawCaravanserai(ctx, bx = 1000, by = 1045, time = 0) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(bx - 135, by - 42, 270, 85);

    ctx.fillStyle = '#9e7354';
    ctx.fillRect(bx - 130, by - 48, 260, 84);

    // Multi-arch stone courtyard loggia
    ctx.fillStyle = '#22150d';
    for (let i = -2; i <= 2; i++) {
      const ax = bx + i * 48;
      ctx.beginPath();
      ctx.arc(ax, by + 8, 16, Math.PI, 0);
      ctx.lineTo(ax + 16, by + 36);
      ctx.lineTo(ax - 16, by + 36);
      ctx.closePath();
      ctx.fill();
    }

    // Tiled Roof
    ctx.fillStyle = '#8a331f';
    ctx.beginPath();
    ctx.moveTo(bx - 140, by - 48);
    ctx.lineTo(bx + 140, by - 48);
    ctx.lineTo(bx + 125, by - 72);
    ctx.lineTo(bx - 125, by - 72);
    ctx.closePath();
    ctx.fill();

    // Resting Lodge Signboard
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(bx - 60, by - 60, 120, 14);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 60, by - 60, 120, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CARAVAN SERAI LODGE', bx, by - 53);

    ctx.restore();
  }
}
