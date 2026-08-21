/**
 * MuzirisEnvironment.js - Muziris Ancient Malabar Maritime Spice Port
 * 
 * Features:
 * - Malabar tropical coastal lagoon & Periyar estuary on the west
 * - Wooden jetty pier with moored sailing merchant ship
 * - Black pepper drying mats with heaps of drying peppercorns
 * - Malabar Spice Warehouses & Pepper Sheds
 * - Stalls: Black Pepper (Black Gold), Cardamom & Cinnamon, Foreign Imports, Precious Gems
 * - Lush tropical coconut palm groves
 * - NPCs: Spice Master Kalyan, Western Seafarer, Malabar Sailor Unni
 */

import { VegetationRenderer } from '../VegetationRenderer';
import { PropsRenderer } from '../PropsRenderer';

export class MuzirisEnvironment {
  static getCityId() { return 'muziris'; }

  static getSpawnPoint() {
    return { x: 800, y: 700 };
  }

  static getColliders() {
    return [
      // Malabar Lagoon Barrier (West)
      { id: 'mz_lagoon', name: 'Malabar Lagoon', x: 0, y: 0, width: 340, height: 1400 },
      // Spice Grand Warehouse
      { id: 'mz_warehouse', name: 'Spice Warehouse', x: 920, y: 320, width: 240, height: 90 },
      // Pepper Storing Shed
      { id: 'mz_peppershed', name: 'Pepper Shed', x: 1320, y: 480, width: 180, height: 80 },
      // Jetty & Moored Ship
      { id: 'mz_ship', name: 'Foreign Merchant Ship', x: 160, y: 580, width: 220, height: 120 },
      // Pepper Drying Mats
      { id: 'mz_mat', name: 'Drying Mats', x: 440, y: 820, width: 110, height: 80 },
      // Market Stalls
      { id: 'mz_stall_pepper', name: 'Pepper Stall', x: 740, y: 540, width: 100, height: 40 },
      { id: 'mz_stall_cardamom', name: 'Cardamom Stall', x: 1080, y: 540, width: 100, height: 40 },
      { id: 'mz_stall_import', name: 'Import Stall', x: 740, y: 840, width: 100, height: 40 },
      { id: 'mz_stall_gems', name: 'Gems Stall', x: 1080, y: 840, width: 100, height: 40 }
    ];
  }

  static getMerchants() {
    return [
      {
        id: "merchant_kalyan",
        name: "Kalyan (Spice Master)",
        title: "Malabar Spice Guild",
        role: "elder",
        location: "muziris",
        dialogueId: "narrator_muziris",
        speed: 26,
        colors: { robe: "#0077b6", turban: "#ffd166", sash: "#00b4d8" },
        path: [{ x: 800, y: 680 }, { x: 860, y: 700 }, { x: 800, y: 720 }, { x: 740, y: 700 }]
      },
      {
        id: "merchant_marcus",
        name: "Marcus (Yavana Seafarer)",
        title: "Western Seafarer",
        role: "trader",
        location: "muziris",
        dialogueId: "npc_muziris_marcus",
        speed: 22,
        colors: { robe: "#c1121f", turban: "#f8f9fa", sash: "#ffd166" },
        path: [{ x: 500, y: 640 }, { x: 600, y: 640 }]
      },
      {
        id: "merchant_unni",
        name: "Unni",
        title: "Malabar Sailor",
        role: "guard",
        location: "muziris",
        dialogueId: "npc_muziris_sailor",
        speed: 30,
        colors: { robe: "#2a9d8f", turban: "#e76f51", sash: "#ffd166" },
        path: [{ x: 740, y: 570 }, { x: 760, y: 580 }, { x: 720, y: 580 }]
      }
    ];
  }

  static render(ctx, w, h, time) {
    // 1. Tropical Green-Earthen Ground
    ctx.fillStyle = '#26382b';
    ctx.fillRect(0, 0, w, h);

    const tropGrad = ctx.createLinearGradient(0, 0, w, 0);
    tropGrad.addColorStop(0, '#0c2738'); // Lagoon
    tropGrad.addColorStop(0.22, '#16576b'); // Estuary
    tropGrad.addColorStop(0.28, '#b78b5e'); // Sand bar
    tropGrad.addColorStop(0.4, '#384d38'); // Spice grove
    tropGrad.addColorStop(1, '#2c3e2d'); // Inland
    ctx.fillStyle = tropGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Malabar Coastal Lagoon Waters
    ctx.fillStyle = '#0f3142';
    ctx.fillRect(0, 0, 360, h);

    // Subtle water tide
    ctx.strokeStyle = 'rgba(46, 196, 182, 0.35)';
    ctx.lineWidth = 2;
    for (let y = 60; y < h; y += 80) {
      const tide = Math.sin(time * 2 + y * 0.08) * 10;
      ctx.beginPath();
      ctx.moveTo(30, y + tide);
      ctx.bezierCurveTo(130, y - 10 + tide, 230, y + 15 + tide, 330, y + tide);
      ctx.stroke();
    }

    // 3. Wooden Spice Jetty Pier
    const pierY = 640;
    ctx.fillStyle = '#4a2c1d';
    ctx.fillRect(160, pierY - 40, 380, 80);
    ctx.strokeStyle = '#2b190f';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, pierY - 40, 380, 80);

    // 4. Moored Foreign Trading Vessel (Roman / Yavana Dhow)
    const sx = 220;
    const sy = 620;
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.moveTo(sx - 100, sy - 20);
    ctx.quadraticCurveTo(sx, sy - 35, sx + 110, sy - 25);
    ctx.lineTo(sx + 95, sy + 30);
    ctx.quadraticCurveTo(sx, sy + 40, sx - 85, sy + 25);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.strokeStyle = '#3a2012';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx + 10, sy + 10);
    ctx.lineTo(sx + 10, sy - 90);
    ctx.stroke();

    // 5. Pepper Drying Mats on ground
    ctx.fillStyle = '#9c6644';
    ctx.fillRect(440, 820, 110, 80);
    // Dark Peppercorns drying on mat
    ctx.fillStyle = '#1c1917';
    for (let x = 448; x < 540; x += 10) {
      for (let y = 828; y < 890; y += 10) {
        ctx.beginPath();
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 6. Spice Warehouse & Sheds
    this.drawSpiceWarehouse(ctx, 1040, 360, time);
    this.drawPepperShed(ctx, 1410, 520, time);

    // 7. Market Stalls (Black Pepper, Cardamom, Imports, Gems)
    this.drawBlackPepperStall(ctx, 740, 540);
    this.drawCardamomStall(ctx, 1080, 540);
    this.drawRomanImportStall(ctx, 740, 840);
    this.drawGemsStall(ctx, 1080, 840);

    // 8. Coconut Palm Groves (Malabar coast)
    VegetationRenderer.drawPalmTree(ctx, 420, 480, time);
    VegetationRenderer.drawPalmTree(ctx, 600, 440, time);
    VegetationRenderer.drawPalmTree(ctx, 400, 860, time);
    VegetationRenderer.drawPalmTree(ctx, 1260, 460, time);
    VegetationRenderer.drawPalmTree(ctx, 1540, 720, time);
    VegetationRenderer.drawPalmTree(ctx, 1560, 880, time);

    // 9. Jute bags & Crates
    PropsRenderer.drawCrate(ctx, 640, 680, 26, 22, '#7f5539', '🌶️');
    PropsRenderer.drawBarrel(ctx, 680, 685, 10, 16);
    PropsRenderer.drawAmphora(ctx, 710, 690, 8, 14);
  }

  static drawSpiceWarehouse(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#6b4f38';
    ctx.fillRect(bx - 120, by - 46, 240, 86);

    ctx.fillStyle = '#8a331f';
    ctx.beginPath();
    ctx.moveTo(bx - 130, by - 46);
    ctx.lineTo(bx + 130, by - 46);
    ctx.lineTo(bx + 115, by - 72);
    ctx.lineTo(bx - 115, by - 72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#22150d';
    ctx.fillRect(bx - 24, by + 4, 48, 36);

    ctx.fillStyle = '#0077b6';
    ctx.fillRect(bx - 70, by - 58, 140, 14);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 70, by - 58, 140, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('MUCIRI SPICE WAREHOUSE', bx, by - 48);
    ctx.restore();
  }

  static drawPepperShed(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#7a5a40';
    ctx.fillRect(bx - 90, by - 40, 180, 80);
    ctx.fillStyle = '#9e3d24';
    ctx.fillRect(bx - 95, by - 52, 190, 14);
    ctx.restore();
  }

  static drawBlackPepperStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#1c1917';
    [-28, -6, 16].forEach(x => {
      ctx.beginPath();
      ctx.arc(sx + x, sy + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#2b2d42';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLACK PEPPER', sx, sy - 35);
    ctx.restore();
  }

  static drawCardamomStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#2a9d8f';
    [-28, -6, 16].forEach(x => {
      ctx.beginPath();
      ctx.arc(sx + x, sy + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#2a9d8f';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CARDAMOM', sx, sy - 35);
    ctx.restore();
  }

  static drawRomanImportStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#c1121f';
    ctx.beginPath();
    ctx.arc(sx - 15, sy + 6, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(sx + 15, sy + 6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#780000';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FOREIGN IMPORTS', sx, sy - 35);
    ctx.restore();
  }

  static drawGemsStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#06d6a0';
    ctx.fillRect(sx - 20, sy + 2, 16, 8);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx + 10, sy + 2, 16, 8);

    ctx.fillStyle = '#5a189a';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GEMS & AGATES', sx, sy - 35);
    ctx.restore();
  }
}
