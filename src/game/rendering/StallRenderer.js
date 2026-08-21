/**
 * StallRenderer.js - Dedicated 2D Pixel-Art Historical Market Stalls Renderer
 * 
 * Renders 4 distinct, richly themed bazaar stalls:
 * 1. Textile & Silk Stall: folded silks, hanging patterned sarees, fabric bolts, dye tubs
 * 2. Malabar Spice Stall: terracotta spice bowls with turmeric/chili/cardamom, jute sacks, jars
 * 3. Grain & Provisions Stall: woven burlap grain bags (wheat/rice/barley), scales, scoops
 * 4. Brass & Pottery Artisan Stall: gleaming brass diyas with animated flame, copper lotas, surahis
 */

export class StallRenderer {
  /**
   * Draw the Textile & Silk Market Stall
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} sx - Center X (820)
   * @param {number} sy - Base Y (555)
   * @param {number} time 
   */
  static drawTextileStall(ctx, sx = 820, sy = 555, time = 0) {
    ctx.save();

    // 1. Shadow beneath stall
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.roundRect(sx - 52, sy - 18, 104, 46, 4);
    ctx.fill();

    // 2. Timber Counter Frame
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 48, sy - 6, 96, 26);

    // 3. Stacks of Folded Fine Silks & Dyed Fabrics on Counter
    const fabricStacks = [
      { x: sx - 44, colors: ['#e63946', '#ffd166', '#d90429'], w: 18 },
      { x: sx - 22, colors: ['#1d3557', '#457b9d', '#a8dadc'], w: 20 },
      { x: sx + 2,  colors: ['#2a9d8f', '#e76f51', '#f4a261'], w: 18 },
      { x: sx + 24, colors: ['#5a189a', '#7b2cbf', '#ffd166'], w: 18 }
    ];

    fabricStacks.forEach(st => {
      st.colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(st.x, sy - 2 + idx * 5, st.w, 4.5);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.strokeRect(st.x, sy - 2 + idx * 5, st.w, 4.5);
      });
    });

    // 4. Scalloped Striped Awning Canopy (Indigo & Gold Stripes)
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);

    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);
    }

    // Scalloped Awning Hem
    ctx.fillStyle = '#e76f51';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(sx - 45 + i * 10, sy - 8, 5, 0, Math.PI);
      ctx.fill();
    }

    // Timber Support Posts
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(sx - 49, sy - 30, 4, 50);
    ctx.fillRect(sx + 45, sy - 30, 4, 50);

    // 5. Hanging Patterned Fabric / Saree Display
    ctx.fillStyle = '#d90429';
    ctx.fillRect(sx - 12, sy + 18, 24, 22);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx - 12, sy + 18, 24, 22);
    // Gold zari border on hanging saree
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx - 12, sy + 36, 24, 4);

    // Stall Title Plaque
    ctx.fillStyle = 'rgba(18, 24, 38, 0.92)';
    ctx.fillRect(sx - 38, sy - 42, 76, 12);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(sx - 38, sy - 42, 76, 12);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEXTILES & SILK', sx, sy - 35);

    ctx.restore();
  }

  /**
   * Draw the Malabar Spice Market Stall
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} sx - Center X (1180)
   * @param {number} sy - Base Y (555)
   * @param {number} time 
   */
  static drawSpiceStall(ctx, sx = 1180, sy = 555, time = 0) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.roundRect(sx - 52, sy - 18, 104, 46, 4);
    ctx.fill();

    ctx.fillStyle = '#653e22';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 48, sy - 6, 96, 26);

    // Tiered Spice Bowls with vibrant mounded spices
    const spiceBowls = [
      { x: sx - 36, color: '#f4a261', label: 'Turmeric' },
      { x: sx - 16, color: '#d90429', label: 'Red Chili' },
      { x: sx + 6,  color: '#2a9d8f', label: 'Cardamom' },
      { x: sx + 26, color: '#2b2d42', label: 'Black Pepper' }
    ];

    spiceBowls.forEach(sp => {
      // Terracotta Bowl Rim
      ctx.fillStyle = '#b05d3b';
      ctx.beginPath();
      ctx.arc(sp.x + 6, sy + 8, 9, 0, Math.PI * 2);
      ctx.fill();

      // Heaped spice powder pyramid
      ctx.fillStyle = sp.color;
      ctx.beginPath();
      ctx.arc(sp.x + 6, sy + 6, 6.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Saffron & Terracotta Striped Awning
    ctx.fillStyle = '#e76f51';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);

    ctx.fillStyle = '#f4a261';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);
    }

    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(sx - 45 + i * 10, sy - 8, 5, 0, Math.PI);
      ctx.fill();
    }

    // Support Posts
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(sx - 49, sy - 30, 4, 50);
    ctx.fillRect(sx + 45, sy - 30, 4, 50);

    // Burlap Tied Spice Bags on flanks
    [-54, 54].forEach(bx => {
      ctx.fillStyle = '#9c6644';
      ctx.beginPath();
      ctx.arc(sx + bx, sy + 12, 10, 0, Math.PI * 2);
      ctx.fill();
      // Hemp string tie
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(sx + bx - 3, sy + 3, 6, 2);
    });

    // Stall Title Plaque
    ctx.fillStyle = 'rgba(18, 24, 38, 0.92)';
    ctx.fillRect(sx - 38, sy - 42, 76, 12);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(sx - 38, sy - 42, 76, 12);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MALABAR SPICES', sx, sy - 35);

    ctx.restore();
  }

  /**
   * Draw the Grain & Provisions Market Stall
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} sx - Center X (820)
   * @param {number} sy - Base Y (835)
   * @param {number} time 
   */
  static drawGrainStall(ctx, sx = 820, sy = 835, time = 0) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.roundRect(sx - 52, sy - 18, 104, 46, 4);
    ctx.fill();

    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 48, sy - 6, 96, 26);

    // Burlap Grain Sacks (Wheat, Polished Rice, Barley, Lentils)
    const grains = [
      { color: '#e9c46a', x: sx - 38, label: 'Wheat' },
      { color: '#f8f9fa', x: sx - 16, label: 'Rice' },
      { color: '#d4a373', x: sx + 6,  label: 'Barley' },
      { color: '#bc6c25', x: sx + 28, label: 'Chickpeas' }
    ];

    grains.forEach(g => {
      ctx.fillStyle = '#9c6644';
      ctx.beginPath();
      ctx.ellipse(g.x + 5, sy + 8, 9, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Top grain opening showing contents
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.ellipse(g.x + 5, sy + 3, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Balance Scale on Counter
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 6, sy - 2);
    ctx.lineTo(sx - 6, sy + 10);
    ctx.moveTo(sx - 12, sy - 2);
    ctx.lineTo(sx, sy - 2);
    ctx.stroke();

    // Flax & Sand Canopy Awning
    ctx.fillStyle = '#7f5539';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);

    ctx.fillStyle = '#ddb892';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);
    }

    ctx.fillStyle = '#b08968';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(sx - 45 + i * 10, sy - 8, 5, 0, Math.PI);
      ctx.fill();
    }

    // Support Posts
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(sx - 49, sy - 30, 4, 50);
    ctx.fillRect(sx + 45, sy - 30, 4, 50);

    // Stall Title Plaque
    ctx.fillStyle = 'rgba(18, 24, 38, 0.92)';
    ctx.fillRect(sx - 38, sy - 42, 76, 12);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(sx - 38, sy - 42, 76, 12);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRAIN & PROVISIONS', sx, sy - 35);

    ctx.restore();
  }

  /**
   * Draw the Artisan Brass & Pottery Market Stall
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} sx - Center X (1180)
   * @param {number} sy - Base Y (835)
   * @param {number} time 
   */
  static drawArtisanStall(ctx, sx = 1180, sy = 835, time = 0) {
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.roundRect(sx - 52, sy - 18, 104, 46, 4);
    ctx.fill();

    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(sx - 48, sy - 6, 96, 26);

    // 1. Brass Pitcher / Lota
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(sx - 32, sy + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx - 34, sy, 4, 6);

    // 2. Copper Oil Diya Lamp with animated flame
    ctx.fillStyle = '#e07a5f';
    ctx.beginPath();
    ctx.ellipse(sx - 10, sy + 10, 8, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Flickering Diya Flame
    const flameH = 3 + Math.sin(time * 8) * 1;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(sx - 4, sy + 6 - flameH * 0.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Terracotta Surahi (Long-neck water jug)
    ctx.fillStyle = '#a8422b';
    ctx.beginPath();
    ctx.arc(sx + 14, sy + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(sx + 12, sy - 1, 4, 9);

    // 4. Carved Bronze Platter
    ctx.fillStyle = '#d4a373';
    ctx.beginPath();
    ctx.ellipse(sx + 34, sy + 8, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Imperial Purple & Gold Awning
    ctx.fillStyle = '#5a189a';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);

    ctx.fillStyle = '#ffb703';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);
    }

    ctx.fillStyle = '#9d0208';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(sx - 45 + i * 10, sy - 8, 5, 0, Math.PI);
      ctx.fill();
    }

    // Support Posts
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(sx - 49, sy - 30, 4, 50);
    ctx.fillRect(sx + 45, sy - 30, 4, 50);

    // Stall Title Plaque
    ctx.fillStyle = 'rgba(18, 24, 38, 0.92)';
    ctx.fillRect(sx - 38, sy - 42, 76, 12);
    ctx.strokeStyle = '#ffd166';
    ctx.strokeRect(sx - 38, sy - 42, 76, 12);

    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BRASS & POTTERY', sx, sy - 35);

    ctx.restore();
  }
}
