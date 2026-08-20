/**
 * BharuchEnvironment.js - Bharuch Western Maritime Port & Ancient Gateway
 * 
 * Features:
 * - Arabian Sea shoreline with animated ocean waves on the west
 * - Heavy timber harbor docks, mooring bollards, and gangplanks
 * - Moored ancient merchant trading ship with wood mast, rigging, and sails
 * - Port Customs Warehouse & Salt Depot
 * - Western Port Market Stalls: Salt, Metals & Tools, Maritime Textiles, Imported Goods
 * - Coastal date palms, stacked amphorae, anchors, and cargo barrels
 * - Dock NPCs: Captain Meera, Sailor Vikram, Salt Merchant Nayan
 */

import { VegetationRenderer } from '../VegetationRenderer';
import { PropsRenderer } from '../PropsRenderer';

export class BharuchEnvironment {
  static getCityId() { return 'bharuch'; }

  static getSpawnPoint() {
    return { x: 800, y: 700 };
  }

  static getColliders() {
    return [
      // Deep Ocean Barrier on West
      { id: 'b_ocean', name: 'Arabian Sea Shore', x: 0, y: 0, width: 340, height: 1400 },
      // Customs Warehouse
      { id: 'b_warehouse', name: 'Customs Warehouse', x: 920, y: 320, width: 240, height: 90 },
      // Salt Depot
      { id: 'b_saltdepot', name: 'Salt Shed', x: 1320, y: 480, width: 180, height: 80 },
      // Harbor Dock Watchtower
      { id: 'b_watchtower', name: 'Port Watchtower', x: 420, y: 440, width: 60, height: 60 },
      // Moored Ship on Pier
      { id: 'b_ship_pier', name: 'Moored Trading Ship', x: 160, y: 580, width: 220, height: 120 },
      // Port Market Stalls
      { id: 'b_stall_salt', name: 'Salt Stall', x: 740, y: 540, width: 100, height: 40 },
      { id: 'b_stall_metal', name: 'Metals Stall', x: 1080, y: 540, width: 100, height: 40 },
      { id: 'b_stall_import', name: 'Import Goods Stall', x: 740, y: 840, width: 100, height: 40 },
      { id: 'b_stall_textile', name: 'Textile Stall', x: 1080, y: 840, width: 100, height: 40 }
    ];
  }

  static getMerchants() {
    return [
      {
        id: "merchant_meera",
        name: "Meera (Port Trader)",
        title: "Western Port Guild",
        role: "elder",
        location: "bharuch",
        dialogueId: "narrator_bharuch",
        speed: 26,
        colors: { robe: "#9d0208", turban: "#ffb703", sash: "#faa307" },
        path: [{ x: 800, y: 680 }, { x: 860, y: 700 }, { x: 800, y: 720 }, { x: 740, y: 700 }]
      },
      {
        id: "merchant_sailor",
        name: "Captain Vikram",
        title: "Sea Navigator",
        role: "guard",
        location: "bharuch",
        dialogueId: "npc_bharuch_sailor",
        speed: 30,
        colors: { robe: "#0077b6", turban: "#ffd166", sash: "#90e0ef" },
        path: [{ x: 500, y: 640 }, { x: 600, y: 640 }]
      },
      {
        id: "merchant_salt",
        name: "Nayan",
        title: "Salt Master",
        role: "trader",
        location: "bharuch",
        dialogueId: "npc_bharuch_salt",
        speed: 20,
        colors: { robe: "#f8f9fa", turban: "#f4a261", sash: "#adb5bd" },
        path: [{ x: 740, y: 570 }, { x: 760, y: 580 }, { x: 720, y: 580 }]
      }
    ];
  }

  static render(ctx, w, h, time) {
    // 1. Sandy Coastal Ground Layer
    ctx.fillStyle = '#7a654f';
    ctx.fillRect(0, 0, w, h);

    const sandGrad = ctx.createLinearGradient(0, 0, w, 0);
    sandGrad.addColorStop(0, '#16425b'); // Ocean
    sandGrad.addColorStop(0.22, '#2f7490'); // Surf
    sandGrad.addColorStop(0.28, '#d4a373'); // Beach sand
    sandGrad.addColorStop(0.4, '#8c7355'); // Port stone
    sandGrad.addColorStop(1, '#5c4836'); // Inland
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Arabian Sea Animated Waters (West side)
    ctx.fillStyle = '#103548';
    ctx.fillRect(0, 0, 360, h);

    // Ocean Waves
    ctx.strokeStyle = 'rgba(168, 218, 220, 0.4)';
    ctx.lineWidth = 2;
    for (let y = 60; y < h; y += 90) {
      const waveOffset = Math.sin(time * 2 + y * 0.05) * 12;
      ctx.beginPath();
      ctx.moveTo(40, y + waveOffset);
      ctx.bezierCurveTo(140, y - 15 + waveOffset, 240, y + 20 + waveOffset, 340, y + waveOffset);
      ctx.stroke();
    }

    // 3. Heavy Timber Docks & Pier (Extending into sea)
    const pierY = 640;
    // Main Pier Planking
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(160, pierY - 40, 380, 80);
    ctx.strokeStyle = '#3d2514';
    ctx.lineWidth = 2;
    ctx.strokeRect(160, pierY - 40, 380, 80);

    // Dock Wood Planks
    for (let px = 160; px < 540; px += 18) {
      ctx.beginPath();
      ctx.moveTo(px, pierY - 40);
      ctx.lineTo(px, pierY + 40);
      ctx.stroke();
    }

    // Mooring Bollards & Coiled Ropes
    [220, 340, 460].forEach(bx => {
      ctx.fillStyle = '#22150d';
      ctx.beginPath();
      ctx.arc(bx, pierY - 38, 5, 0, Math.PI * 2);
      ctx.arc(bx, pierY + 38, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 4. Moored Historical Trading Dhow / Ship
    const sx = 220;
    const sy = 620;
    // Wooden Hull
    ctx.fillStyle = '#6b4226';
    ctx.beginPath();
    ctx.moveTo(sx - 100, sy - 20);
    ctx.quadraticCurveTo(sx, sy - 35, sx + 110, sy - 25);
    ctx.lineTo(sx + 95, sy + 30);
    ctx.quadraticCurveTo(sx, sy + 40, sx - 85, sy + 25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3a2012';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wooden Mast & Crossbeam
    ctx.strokeStyle = '#4a2c1d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(sx + 10, sy + 10);
    ctx.lineTo(sx + 10, sy - 90);
    ctx.stroke();

    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sx - 45, sy - 70);
    ctx.lineTo(sx + 65, sy - 75);
    ctx.stroke();

    // Furled Canvas Sail
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(sx - 40, sy - 73, 100, 8);

    // 5. Paved Port Market Street & Intersections
    ctx.fillStyle = '#5c4e42';
    ctx.fillRect(540, 600, 1100, 180);
    ctx.fillRect(840, 400, 180, 580);

    // 6. Port Customs Warehouse & Buildings
    this.drawCustomsWarehouse(ctx, 1040, 360, time);
    this.drawSaltShed(ctx, 1410, 520, time);

    // 7. Port Market Stalls (Salt, Metals, Imports, Maritime Textiles)
    this.drawSaltStall(ctx, 740, 540);
    this.drawMetalStall(ctx, 1080, 540);
    this.drawImportStall(ctx, 740, 840);
    this.drawMaritimeTextileStall(ctx, 1080, 840);

    // 8. Coastal Date Palms & Baskets
    VegetationRenderer.drawPalmTree(ctx, 580, 480, time);
    VegetationRenderer.drawPalmTree(ctx, 620, 880, time);
    VegetationRenderer.drawPalmTree(ctx, 1260, 460, time);
    VegetationRenderer.drawPalmTree(ctx, 1540, 720, time);

    // 9. Cargo depot with anchors & crates
    PropsRenderer.drawCrate(ctx, 640, 680, 26, 22, '#7f5539', '⚓');
    PropsRenderer.drawCrate(ctx, 670, 680, 24, 20, '#6c4a30', '☸');
    PropsRenderer.drawBarrel(ctx, 700, 690, 10, 16);
    PropsRenderer.drawAmphora(ctx, 720, 695, 8, 14);

    // Iron Anchor on Dock
    this.drawAnchor(ctx, 500, 680);
  }

  static drawCustomsWarehouse(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(bx - 125, by - 42, 250, 90);

    // Sandstone Block Body
    ctx.fillStyle = '#b08968';
    ctx.fillRect(bx - 120, by - 46, 240, 86);

    // Tiled Roof
    ctx.fillStyle = '#9e3d24';
    ctx.beginPath();
    ctx.moveTo(bx - 130, by - 46);
    ctx.lineTo(bx + 130, by - 46);
    ctx.lineTo(bx + 115, by - 72);
    ctx.lineTo(bx - 115, by - 72);
    ctx.closePath();
    ctx.fill();

    // Large Double Cargo Doors
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(bx - 24, by + 4, 48, 36);
    ctx.fillStyle = '#6b3e22';
    ctx.fillRect(bx - 21, by + 7, 20, 33);
    ctx.fillRect(bx + 1, by + 7, 20, 33);

    // Port Warehouse Sign
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(bx - 70, by - 58, 140, 14);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx - 70, by - 58, 140, 14);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8.5px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('BHARUCH PORT CUSTOMS', bx, by - 51);

    ctx.restore();
  }

  static drawSaltShed(ctx, bx, by, time) {
    ctx.save();
    ctx.fillStyle = '#c49774';
    ctx.fillRect(bx - 90, by - 40, 180, 80);
    ctx.fillStyle = '#a8422b';
    ctx.fillRect(bx - 95, by - 52, 190, 14);

    // Open Shed with stacked salt bags
    ctx.fillStyle = '#22150d';
    ctx.fillRect(bx - 70, by - 10, 140, 48);

    ctx.fillStyle = '#f8f9fa';
    for (let x = bx - 60; x < bx + 60; x += 18) {
      ctx.beginPath();
      ctx.arc(x, by + 18, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  static drawSaltStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // White Salt Mounds & Bags
    ctx.fillStyle = '#f8f9fa';
    [-28, -6, 16].forEach(x => {
      ctx.beginPath();
      ctx.arc(sx + x, sy + 6, 8, 0, Math.PI * 2);
      ctx.fill();
    });
    // Teal-White Awning
    ctx.fillStyle = '#0077b6';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#f8f9fa';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('COASTAL SALT', sx, sy - 35);
    ctx.restore();
  }

  static drawMetalStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // Bronze & Iron Ingots, Anchors, Tools
    ctx.fillStyle = '#adb5bd';
    ctx.fillRect(sx - 34, sy + 2, 16, 8);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(sx - 12, sy + 2, 16, 8);
    ctx.fillStyle = '#b07d58';
    ctx.fillRect(sx + 10, sy + 2, 16, 8);

    ctx.fillStyle = '#495057';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('METALS & TOOLS', sx, sy - 35);
    ctx.restore();
  }

  static drawImportStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    // Exotic Glassware & Amphorae
    ctx.fillStyle = '#52b788';
    ctx.beginPath();
    ctx.arc(sx - 20, sy + 6, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d90429';
    ctx.beginPath();
    ctx.arc(sx + 10, sy + 6, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#7209b7';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IMPORTED GOODS', sx, sy - 35);
    ctx.restore();
  }

  static drawMaritimeTextileStall(ctx, sx, sy) {
    ctx.save();
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(sx - 48, sy - 6, 96, 26);
    ctx.fillStyle = '#d90429';
    ctx.fillRect(sx - 30, sy + 2, 24, 10);
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(sx + 2, sy + 2, 24, 10);

    ctx.fillStyle = '#e63946';
    ctx.fillRect(sx - 50, sy - 30, 100, 22);
    ctx.fillStyle = '#ffd166';
    for (let i = 0; i < 5; i++) ctx.fillRect(sx - 50 + i * 20, sy - 30, 10, 22);

    ctx.fillStyle = 'rgba(18, 24, 38, 0.9)';
    ctx.fillRect(sx - 35, sy - 42, 70, 11);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 8px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EXPORT TEXTILES', sx, sy - 35);
    ctx.restore();
  }

  static drawAnchor(ctx, x, y) {
    ctx.save();
    ctx.strokeStyle = '#2b2d42';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 14);
    ctx.lineTo(x, y + 10);
    ctx.moveTo(x - 8, y - 6);
    ctx.lineTo(x + 8, y - 6);
    ctx.arc(x, y + 6, 10, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }
}
