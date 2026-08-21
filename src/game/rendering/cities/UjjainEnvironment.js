/**
 * UjjainEnvironment.js - Ujjain Historical Inland Crossroads & Ancient Bazaar
 */

import { GroundRenderer } from '../GroundRenderer';
import { BuildingRenderer } from '../BuildingRenderer';
import { StallRenderer } from '../StallRenderer';
import { WellRenderer } from '../WellRenderer';
import { VegetationRenderer } from '../VegetationRenderer';
import { PropsRenderer } from '../PropsRenderer';

export class UjjainEnvironment {
  static getCityId() { return 'ujjain'; }

  static getSpawnPoint() {
    return { x: 960, y: 720 };
  }

  static getColliders() {
    return [
      { id: 'u_guildhall', name: 'Guild Hall', x: 860, y: 310, width: 280, height: 90 },
      { id: 'u_w_manor', name: 'West Manor', x: 430, y: 450, width: 160, height: 85 },
      { id: 'u_e_manor', name: 'East Manor', x: 1410, y: 450, width: 160, height: 85 },
      { id: 'u_s_lodge', name: 'Caravanserai', x: 870, y: 1000, width: 260, height: 80 },
      { id: 'u_stall_txt', name: 'Textile Stall', x: 770, y: 535, width: 100, height: 40 },
      { id: 'u_stall_spc', name: 'Spice Stall', x: 1130, y: 535, width: 100, height: 40 },
      { id: 'u_stall_grn', name: 'Grain Stall', x: 770, y: 815, width: 100, height: 40 },
      { id: 'u_stall_art', name: 'Artisan Stall', x: 1130, y: 815, width: 100, height: 40 },
      { id: 'u_well', name: 'Stone Stepwell', x: 655, y: 835, width: 50, height: 50 },
      { id: 'u_banyan', name: 'Banyan Tree', x: 570, y: 675, width: 60, height: 50 },
      { id: 'u_depot', name: 'Storage Depot', x: 1290, y: 835, width: 110, height: 50 }
    ];
  }

  static getMerchants() {
    return [
      {
        id: "merchant_dev",
        name: "Sarthavaha Dev",
        title: "Guild Elder",
        role: "trader",
        location: "ujjain",
        dialogueId: "elder_merchant",
        speed: 28,
        colors: { robe: "#c84b31", turban: "#ffd166", sash: "#e9c46a" },
        path: [{ x: 1000, y: 690 }, { x: 1050, y: 710 }, { x: 1000, y: 730 }, { x: 950, y: 710 }]
      },
      {
        id: "merchant_textile",
        name: "Vasanti",
        title: "Master Weaver",
        role: "artisan",
        location: "ujjain",
        dialogueId: "npc_textile",
        speed: 20,
        colors: { robe: "#2a9d8f", turban: "#e76f51", sash: "#ffd166" },
        path: [{ x: 820, y: 590 }, { x: 840, y: 600 }, { x: 800, y: 600 }]
      },
      {
        id: "merchant_spice",
        name: "Chandran",
        title: "Spice Merchant",
        role: "trader",
        location: "ujjain",
        dialogueId: "npc_spice",
        speed: 22,
        colors: { robe: "#e07a5f", turban: "#ffb703", sash: "#d4a373" },
        path: [{ x: 1180, y: 590 }, { x: 1160, y: 600 }, { x: 1200, y: 600 }]
      },
      {
        id: "merchant_grain",
        name: "Haridas",
        title: "Grain Trader",
        role: "trader",
        location: "ujjain",
        dialogueId: "npc_grain",
        speed: 20,
        colors: { robe: "#7f5539", turban: "#f4a261", sash: "#e9c46a" },
        path: [{ x: 820, y: 870 }, { x: 840, y: 860 }, { x: 800, y: 860 }]
      },
      {
        id: "merchant_guard",
        name: "Veer Singh",
        title: "Caravan Guard",
        role: "guard",
        location: "ujjain",
        dialogueId: "npc_guard",
        speed: 35,
        colors: { robe: "#1d3557", turban: "#e63946", sash: "#ffd166" },
        path: [{ x: 940, y: 940 }, { x: 1060, y: 940 }]
      }
    ];
  }

  static render(ctx, w, h, time) {
    // 1. Ground & Cobblestones
    GroundRenderer.renderGround(ctx, w, h, time);

    // 2. Sandstone Havelis & Guild Hall
    BuildingRenderer.drawGuildHall(ctx, 1000, 360, time);
    BuildingRenderer.drawWestManor(ctx, 510, 495, time);
    BuildingRenderer.drawEastManor(ctx, 1490, 495, time);
    BuildingRenderer.drawCaravanserai(ctx, 1000, 1045, time);

    // 3. Stalls
    StallRenderer.drawTextileStall(ctx, 820, 555, time);
    StallRenderer.drawSpiceStall(ctx, 1180, 555, time);
    StallRenderer.drawGrainStall(ctx, 820, 835, time);
    StallRenderer.drawArtisanStall(ctx, 1180, 835, time);

    // 4. Stepwell
    WellRenderer.drawStoneWell(ctx, 680, 860, time);

    // 5. Sacred Banyan Tree & Trees
    VegetationRenderer.drawBanyanTree(ctx, 600, 700, time);
    VegetationRenderer.drawPeepalTree(ctx, 740, 375, 24, time);
    VegetationRenderer.drawPeepalTree(ctx, 1260, 375, 24, time);
    VegetationRenderer.drawPalmTree(ctx, 440, 705, time);
    VegetationRenderer.drawPalmTree(ctx, 1540, 705, time);

    // 6. Depot
    PropsRenderer.drawCaravanDepot(ctx, 1340, 860, time);
  }
}
