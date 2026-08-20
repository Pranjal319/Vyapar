/**
 * MaduraiEnvironment.js - Madurai Southern Cultural, Pearl & Textile Centre
 * 
 * Features:
 * - Dravidian-inspired stone temple gateways and carved pillared mandapas
 * - Sacred Lotus Stepwell Tank with blooming pink lotuses
 * - Vibrant Southern Market Street
 * - Stalls: Fine Cotton Textiles, Gulf of Mannar Pearls, Jasmine Garlands, Cardamom Spices
 * - NPCs: Master Weaver Sundaram, Pearl Trader Valli, Artisan Kannan
 */

import { VegetationRenderer } from '../VegetationRenderer';
import { PropsRenderer } from '../PropsRenderer';

export class MaduraiEnvironment {
  static getCityId() { return 'madurai'; }

  static getSpawnPoint() {
    return { x: 960, y: 720 };
  }

  static getColliders() {
    return [
      // Northern Temple Gate (Gopuram)
      { id: 'm_gopuram', name: 'Temple Gateway', x: 860, y: 310, width: 280, height: 95 },
      // Textile Weaving Guild
      { id: 'm_weaversee', name: 'Weaver Hall', x: 440, y: 480, width: 170, height: 85 },
      // Pearl Guild House
      { id: 'm_pearlhouse', name: 'Pearl Guild', x: 1390, y: 480, width: 170, height: 85 },
      // Sacred Lotus Tank
      { id: 'm_tank', name: 'Lotus Tank', x: 640, y: 820, width: 90, height: 90 },
      // Market Stalls
      { id: 'm_stall_cotton', name: 'Cotton Stall', x: 740, y: 540, width: 100, height: 40 },
      { id: 'm_stall_pearl', name: 'Pearl Stall', x: 1180, y: 540, width: 100, height: 40 },
      { id: 'm_stall_flower', name: 'Flower Stall', x: 740, y: 840, width: 100, height: 40 },
      { id: 'm_stall_spice', name: 'Spice Stall', x: 1180, y: 840, width: 100, height: 40 }
    ];
  }

  static getMerchants() {
    return [
      {
        id: "merchant_sundaram",
        name: "Sundaram",
        title: "Master Weaver",
        role: "elder",
        location: "madurai",
        dialogueId: "narrator_madurai",
        speed: 24,
        colors: { robe: "#d90429", turban: "#ffd166", sash: "#ffb703" },
        path: [{ x: 1000, y: 680 }, { x: 1050, y: 700 }, { x: 1000, y: 720 }, { x: 950, y: 700 }]
      },
      {
        id: "merchant_valli",
        name: "Valli (Pearl Merchant)",
        title: "Pearl Guild",
        role: "trader",
        location: "madurai",
        dialogueId: "npc_madurai_pearl",
        speed: 20,
        colors: { robe: "#0077b6", turban: "#f4a261", sash: "#90e0ef" },
        path: [{ x: 1180, y: 570 }, { x: 1200, y: 580 }, { x: 1160, y: 580 }]
      },
      {
        id: "merchant_kannan",
        name: "Kannan (Artisan)",
        title: "Temple Sculptor",
        role: "artisan",
        location: "madurai",
        dialogueId: "npc_madurai_artisan",
        speed: 22,
        colors: { robe: "#5a189a", turban: "#ffd166", sash: "#e0aaff" },
        path: [{ x: 740, y: 570 }, { x: 760, y: 580 }, { x: 720, y: 580 }]
      }
    ];
  }

  static render(ctx, w, h, time) {
    // 1. Granite & Earth Ground
    ctx.fillStyle = '#38281b';
    ctx.fillRect(0, 0, w, h);

    // 2. Paved Temple Market Street (Granite flagstones)
    ctx.fillStyle = '#5c4a3b';
    ctx.fillRect(300, 600, 1400, 200);
    ctx.fillRect(880, 320, 240, 680);

    // 3. Southern Dravidian Temple Gateway (North)
    this.drawGopuramGate(ctx, 1000, 360, time);

    // 4. Textile Guild & Pearl Guild Houses
    this.drawWeaverGuild(ctx, 520, 520, time);
    this.drawPearlGuild(ctx, 1480, 520, time);

    // 5. Sacred Lotus Tank (Stepwell)
    this.drawLotusTank(ctx, 680, 860, time);

    // 6. Market Stalls (Cotton, Pearls, Jasmine Flowers, Hill Spices)
    this.drawCottonStall(ctx, 740, 540);
    this.drawPearlStall(ctx, 1180, 540);
    this.drawFlowerStall(ctx, 740, 840);
    this.drawHillSpiceStall(ctx, 1180, 840);

    // 7. Palm Trees & Tropical Foliage
    VegetationRenderer.drawPalmTree(ctx, 420, 700, time);
    VegetationRenderer.drawPalmTree(ctx, 440, 850, time);
    VegetationRenderer.drawPalmTree(ctx, 1540, 700, time);
    VegetationRenderer.drawPalmTree(ctx, 1560, 850, time);

    // 8. Baskets & Crates
    PropsRenderer.drawCrate(ctx, 1340, 840, 26, 22, '#7f5539', '🦚');
    PropsRenderer.drawBarrel(ctx, 1380, 845, 10, 16);
  }

  static drawGopuramGate(ctx, bx, by, time) {
    ctx.save();
    // Tiered Granite Gopuram Gateway
    ctx.fillStyle = '#8d5b3d';
    ctx.fillRect(bx - 140, by - 45, 280, 90);

    // Tier 2
    ctx.fillStyle = '#a26a48';
    ctx.fillRect(bx - 110, by - 80, 220, 35);

    // Tier 3 & Kalashas
    ctx.fillStyle = '#b57954';
    ctx.fillRect(bx - 80, by - 105, 160, 25);

    ctx.fillStyle = '#ffd166';
    [-40, 0, 40].forEach(kx => {
      ctx.fillRect(bx + kx - 3, by - 115, 6, 10);
    });

    // Grand Entrance Arch
    ctx.fillStyle = '#1c110a';
    ctx.beginPath();
    ctx.arc(bx, by + 10, 26, Math.PI, 0);
    ctx.lineTo(bx + 26, by + 45);
    ctx.lineTo(bx - 26, by + 45);
    ctx.closePath();
    ctx.fill();

    // Banner
    ctx.fillStyle = '#d90429';
    ctx.fillRect(bx - 70, by - 55, 140, 15);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('MADURAI TEMPLE GATEWAY', bx, by - 45);
    ctx.restore();
  }

  static drawWeaverGuild(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#b08968';
    ctx.fillRect(bx - 80, by - 45, 160, 85);
    ctx.fillStyle = '#d90429';
    ctx.fillRect(bx - 90, by - 60, 180, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PANDYA WEAVER GUILD', bx, by - 50);
    ctx.restore();
  }

  static drawPearlGuild(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#b88968';
    ctx.fillRect(bx - 80, by - 45, 160, 85);
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(bx - 90, by - 60, 180, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PEARL MERCHANTS GUILD', bx, by - 50);
    ctx.restore();
  }

  static drawLotusTank(ctx, x, y, time) {
    ctx.save();
    // Granite Steps Lip
    ctx.fillStyle = '#6b5c4c';
    ctx.fillRect(x - 45, y - 45, 90, 90);
    ctx.fillStyle = '#857361';
    ctx.fillRect(x - 38, y - 38, 76, 76);

    // Clear Turquoise Water
    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(x - 30, y - 30, 60, 60);

    // Pink Blooming Lotuses
    const lotuses = [
      { dx: -12, dy: -8 }, { dx: 14, dy: -10 },
      { dx: -8, dy: 14 }, { dx: 12, dy: 10 }
    ];
    lotuses.forEach(l => {
      // Green Leaf Pad
      ctx.fillStyle = '#1b4332';
      ctx.beginPath();
      ctx.arc(x + l.dx, y + l.dy, 7, 0, Math.PI * 2);
      ctx.fill();

      // Pink Petals
      ctx.fillStyle = '#ff70a6';
      ctx.beginPath();
      ctx.arc(x + l.dx, y + l.dy, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  static drawCottonStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(sx - 34, sy + 2, 20, 8);
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(sx - 8, sy + 2, 20, 8);
    ctx.fillStyle = '#e63946';
    ctx.fillRect(sx + 16, sy + 2, 20, 8);

    ctx.fillStyle = '#d90429';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MADURAI COTTON', sx, sy - 35);
    ctx.restore();
  }

  static drawPearlStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // Gleaming White & Cream Pearls in Velvet Trays
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(sx - 36, sy, 72, 14);
    ctx.fillStyle = '#f8f9fa';
    [-24, -12, 0, 12, 24].forEach(px => {
      ctx.beginPath();
      ctx.arc(sx + px, sy + 7, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#0077b6';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MANNR PEARLS', sx, sy - 35);
    ctx.restore();
  }

  static drawFlowerStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // Baskets of White Jasmine & Orange Marigold
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(sx - 20, sy + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(sx + 10, sy + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e76f51';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('JASMINE & FLOWERS', sx, sy - 35);
    ctx.restore();
  }

  static drawHillSpiceStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#2a9d8f';
    ctx.beginPath();
    ctx.arc(sx - 15, sy + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f4a261';
    ctx.beginPath();
    ctx.arc(sx + 15, sy + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#264653';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HILL SPICES', sx, sy - 35);
    ctx.restore();
  }
}
