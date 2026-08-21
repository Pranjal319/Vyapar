/**
 * PataliputraEnvironment.js - Pataliputra Imperial Capital & Gangetic Trade Hub
 * 
 * Features:
 * - Sacred Ganga Riverbank & stone ghats on the northern border
 * - Monumental Fortified Imperial Stone Gateway with Ashoka Pillar
 * - Royal Silk Guild Hall & Imperial Granary
 * - Paved Royal Avenue with flagstone paving
 * - Market Stalls: Fine Silk & Muslin, Gangetic Grains, Northern Black Polished Pottery, Gems & Coins
 * - NPCs: Acharya Sutradhar (Scholar), Royal Guard Captain, Silk Guild Master
 */

import { VegetationRenderer } from '../VegetationRenderer';
import { PropsRenderer } from '../PropsRenderer';

export class PataliputraEnvironment {
  static getCityId() { return 'pataliputra'; }

  static getSpawnPoint() {
    return { x: 960, y: 720 };
  }

  static getColliders() {
    return [
      // Sacred Ganga River Barrier (North)
      { id: 'p_ganga', name: 'Ganga River Edge', x: 0, y: 0, width: 2000, height: 260 },
      // Imperial Palace Gate (North)
      { id: 'p_palacegate', name: 'Imperial Gate', x: 840, y: 310, width: 320, height: 95 },
      // Silk Guild Hall
      { id: 'p_silkhall', name: 'Silk Guild Hall', x: 440, y: 480, width: 170, height: 85 },
      // Imperial Granary
      { id: 'p_granary', name: 'Imperial Granary', x: 1390, y: 480, width: 170, height: 85 },
      // Ashoka Pillar Monument
      { id: 'p_pillar', name: 'Ashoka Pillar', x: 980, y: 690, width: 40, height: 40 },
      // Market Stalls
      { id: 'p_stall_silk', name: 'Silk Stall', x: 740, y: 540, width: 100, height: 40 },
      { id: 'p_stall_grain', name: 'Grains Stall', x: 1180, y: 540, width: 100, height: 40 },
      { id: 'p_stall_pottery', name: 'Pottery Stall', x: 740, y: 840, width: 100, height: 40 },
      { id: 'p_stall_gems', name: 'Gems Stall', x: 1180, y: 840, width: 100, height: 40 }
    ];
  }

  static getMerchants() {
    return [
      {
        id: "merchant_sutradhar",
        name: "Acharya Sutradhar",
        title: "Imperial Scholar",
        role: "elder",
        location: "pataliputra",
        dialogueId: "narrator_pataliputra",
        speed: 24,
        colors: { robe: "#f8f9fa", turban: "#f4a261", sash: "#ffd166" },
        path: [{ x: 1000, y: 680 }, { x: 1050, y: 700 }, { x: 1000, y: 720 }, { x: 950, y: 700 }]
      },
      {
        id: "merchant_patali_guard",
        name: "Senapati Aryaman",
        title: "Imperial Guard",
        role: "guard",
        location: "pataliputra",
        dialogueId: "npc_patali_guard",
        speed: 32,
        colors: { robe: "#780000", turban: "#c1121f", sash: "#ffd166" },
        path: [{ x: 900, y: 440 }, { x: 1100, y: 440 }]
      },
      {
        id: "merchant_patali_silk",
        name: "Devapala",
        title: "Silk Guild Master",
        role: "trader",
        location: "pataliputra",
        dialogueId: "npc_patali_silk",
        speed: 20,
        colors: { robe: "#5a189a", turban: "#ffb703", sash: "#e0aaff" },
        path: [{ x: 740, y: 570 }, { x: 760, y: 580 }, { x: 720, y: 580 }]
      }
    ];
  }

  static render(ctx, w, h, time) {
    // 1. Imperial Sandstone Ground
    ctx.fillStyle = '#3a2d20';
    ctx.fillRect(0, 0, w, h);

    // 2. Ganga Riverfront (North)
    ctx.fillStyle = '#1d5a73';
    ctx.fillRect(0, 0, w, 240);

    // Flowing River Waves
    ctx.strokeStyle = 'rgba(168, 218, 220, 0.4)';
    ctx.lineWidth = 2;
    for (let y = 40; y < 220; y += 45) {
      const riverOffset = Math.sin(time * 2.5 + y * 0.1) * 16;
      ctx.beginPath();
      ctx.moveTo(0, y + riverOffset);
      ctx.lineTo(w, y + riverOffset);
      ctx.stroke();
    }

    // River Stone Ghat Steps
    ctx.fillStyle = '#6b5c4c';
    ctx.fillRect(0, 240, w, 30);
    ctx.fillStyle = '#857361';
    ctx.fillRect(0, 270, w, 20);

    // Riverboats Moored at Ghat
    [400, 1200, 1600].forEach(rx => {
      ctx.fillStyle = '#5c3a21';
      ctx.beginPath();
      ctx.ellipse(rx, 225, 45, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Royal Avenue Flagstone Paving
    ctx.fillStyle = '#54463a';
    ctx.fillRect(300, 600, 1400, 200);
    ctx.fillRect(860, 290, 280, 710);

    // 4. Fortified Imperial Palace Gate (North)
    this.drawPalaceGate(ctx, 1000, 360, time);

    // 5. Ashoka Pillar Monument (Center)
    this.drawAshokaPillar(ctx, 1000, 710);

    // 6. Silk Guild Hall & Imperial Granary
    this.drawSilkGuild(ctx, 520, 520, time);
    this.drawGranary(ctx, 1480, 520, time);

    // 7. Imperial Market Stalls
    this.drawImperialSilkStall(ctx, 740, 540);
    this.drawImperialGrainStall(ctx, 1180, 540);
    this.drawPotteryStall(ctx, 740, 840);
    this.drawGemsStall(ctx, 1180, 840);

    // 8. Lush Peepal Trees & Palms
    VegetationRenderer.drawPeepalTree(ctx, 420, 700, 28, time);
    VegetationRenderer.drawPeepalTree(ctx, 1580, 700, 28, time);
    VegetationRenderer.drawPalmTree(ctx, 720, 380, time);
    VegetationRenderer.drawPalmTree(ctx, 1280, 380, time);

    // 9. Storage Crates
    PropsRenderer.drawCrate(ctx, 1340, 840, 28, 22, '#7f5539', '🏛️');
    PropsRenderer.drawBarrel(ctx, 1380, 845, 10, 16);
  }

  static drawPalaceGate(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#a66a44';
    ctx.fillRect(bx - 160, by - 55, 320, 100);

    // Fortified Merlon Battlements
    ctx.fillStyle = '#7d4a27';
    for (let x = bx - 160; x < bx + 160; x += 24) {
      ctx.fillRect(x, by - 70, 16, 18);
    }

    // Grand Arched Gate
    ctx.fillStyle = '#1c110a';
    ctx.beginPath();
    ctx.arc(bx, by + 15, 32, Math.PI, 0);
    ctx.lineTo(bx + 32, by + 45);
    ctx.lineTo(bx - 32, by + 45);
    ctx.closePath();
    ctx.fill();

    // Royal Banner
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(bx - 80, by - 50, 160, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 9px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('PATALIPUTRA IMPERIAL GATE', bx, by - 40);
    ctx.restore();
  }

  static drawAshokaPillar(ctx, x, y) {
    ctx.save();
    // Circular Base
    ctx.fillStyle = '#6b5c4c';
    ctx.beginPath();
    ctx.arc(x, y + 10, 18, 0, Math.PI * 2);
    ctx.fill();

    // Polished Sandstone Column
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(x - 5, y - 45, 10, 52);

    // Lion Capital & Chakra
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 8, y - 55, 16, 12);
    ctx.beginPath();
    ctx.arc(x, y - 60, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  static drawSilkGuild(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#b08968';
    ctx.fillRect(bx - 80, by - 45, 160, 85);
    ctx.fillStyle = '#5a189a';
    ctx.fillRect(bx - 90, by - 60, 180, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('MAGADHA SILK GUILD', bx, by - 50);
    ctx.restore();
  }

  static drawGranary(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#b88968';
    ctx.fillRect(bx - 80, by - 45, 160, 85);
    ctx.fillStyle = '#bc6c25';
    ctx.fillRect(bx - 90, by - 60, 180, 16);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('IMPERIAL GRANARY', bx, by - 50);
    ctx.restore();
  }

  static drawImperialSilkStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#ffb703';
    ctx.fillRect(sx - 34, sy + 2, 20, 8);
    ctx.fillStyle = '#7209b7';
    ctx.fillRect(sx - 8, sy + 2, 20, 8);
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(sx + 16, sy + 2, 20, 8);

    ctx.fillStyle = '#5a189a';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROYAL SILK', sx, sy - 35);
    ctx.restore();
  }

  static drawImperialGrainStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#e9c46a';
    [-28, -6, 16].forEach(x => {
      ctx.beginPath();
      ctx.arc(sx + x, sy + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#bc6c25';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GANGETIC GRAINS', sx, sy - 35);
    ctx.restore();
  }

  static drawPotteryStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // Black Polished Ware
    ctx.fillStyle = '#1c1917';
    [-28, -6, 16].forEach(x => {
      ctx.beginPath();
      ctx.arc(sx + x, sy + 6, 7, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#292524';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLACK POTTERY', sx, sy - 35);
    ctx.restore();
  }

  static drawGemsStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx - 24, sy + 2, 14, 8);
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(sx, sy + 2, 14, 8);
    ctx.fillStyle = '#e63946';
    ctx.fillRect(sx + 20, sy + 2, 14, 8);

    ctx.fillStyle = '#d90429';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GEMS & COINS', sx, sy - 35);
    ctx.restore();
  }
}
