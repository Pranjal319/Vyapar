/**
 * TravelSceneRenderer.js - 2D Canvas Pixel-Art Renderer for Historical Caravan Journeys
 * 
 * Renders animated overland caravans, river barges, and ocean dhows traversing
 * historical Indian landscapes (plains, hills, rivers, coasts) with parallax scrolling,
 * companion NPCs, and dynamic day progression.
 */

import { PixelSpriteRenderer } from './PixelSpriteRenderer';

export class TravelSceneRenderer {
  constructor() {
    this.scrollOffset = 0;
  }

  /**
   * Render complete travel scene frame
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} width 
  /**
   * Render complete travel scene frame
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} width 
   * @param {number} height 
   * @param {number} dt 
   * @param {Object} travelState 
   * @param {boolean} isMoving 
   */
  render(ctx, width, height, dt, travelState, isMoving = false) {
    if (isMoving) {
      this.walkTimer = (this.walkTimer || 0) + dt * 8;
    }
    const playerX = travelState.playerX || 180;
    this.scrollOffset = (playerX - 180) * 0.75;

    const routeType = travelState.activeRoute?.type || 'overland';
    const worldWidth = travelState.worldWidth || 2400;
    const worldHeight = travelState.worldHeight || 900;
    const cameraX = Math.max(0, Math.min(worldWidth - width, playerX - width * 0.42));

    ctx.save();
    ctx.translate(-cameraX, 0);

    if (routeType === 'sea') {
      this.renderSeaScene(ctx, worldWidth, height, this.scrollOffset, travelState, isMoving);
    } else if (routeType === 'river') {
      this.renderRiverScene(ctx, worldWidth, height, this.scrollOffset, travelState, isMoving);
    } else {
      this.renderOverlandScene(ctx, worldWidth, height, this.scrollOffset, travelState, isMoving);
    }

    this.drawTravelCoins(ctx, travelState.coins || [], this.scrollOffset, height / worldHeight);
    this.drawDestinationMarker(ctx, travelState.destinationX || worldWidth - 200, height * 0.79, travelState.toLocation);
    (travelState.floatingMessages || []).forEach(message => {
      const age = (Date.now() - message.createdAt) / 1400;
      this.drawFloatingMessage(ctx, message, age, height / worldHeight);
    });

    ctx.restore();
  }

  /* --------------------------------------------------------------------------
     1. OVERLAND CARAVAN SCENE (Plains, Road, Ox Cart, Guards, Merchant)
     -------------------------------------------------------------------------- */
  renderOverlandScene(ctx, width, height, scroll, travelState, isMoving = false) {
    const time = this.walkTimer || 0;

    // A. Sky & Distant Sun/Horizon
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
    skyGrad.addColorStop(0, '#f9c784'); // Warm Saffron Dawn
    skyGrad.addColorStop(0.4, '#fbc490');
    skyGrad.addColorStop(0.75, '#e8a568');
    skyGrad.addColorStop(1, '#c57d4a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Warm Sun
    ctx.fillStyle = 'rgba(255, 238, 173, 0.4)';
    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.22, 65, 0, Math.PI * 2);
    ctx.fill();

    // Passing Soft Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 350 + scroll * 8) % (width + 200)) - 100;
      const cy = 40 + i * 25;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 55, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // B. Distant Mountain Silhouettes (Vindhyas / Hills)
    ctx.fillStyle = '#8f533a';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.58);
    for (let x = 0; x <= width; x += 40) {
      const hillH = Math.sin((x + scroll * 5) * 0.004) * 35 + Math.cos((x + scroll * 10) * 0.008) * 20;
      ctx.lineTo(x, height * 0.52 - hillH);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // C. Midground Hills & Vegetation
    ctx.fillStyle = '#a66844';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.65);
    for (let x = 0; x <= width; x += 30) {
      const hillH2 = Math.sin((x + scroll * 15) * 0.006) * 20;
      ctx.lineTo(x, height * 0.62 - hillH2);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    // Midground Banyan & Acacia Trees
    for (let i = 0; i < 6; i++) {
      const tx = ((i * 240 - (scroll * 25)) % (width + 100)) - 40;
      const ty = height * 0.61;
      this.drawPixelTree(ctx, tx, ty);
    }

    // D. Foreground Road & Ground
    const groundGrad = ctx.createLinearGradient(0, height * 0.68, 0, height);
    groundGrad.addColorStop(0, '#c89666'); // Dusty ancient highway
    groundGrad.addColorStop(0.5, '#ad7a4d');
    groundGrad.addColorStop(1, '#8c5a31');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, height * 0.68, width, height * 0.32);

    // Highway Road Stripe & Track Lines
    ctx.strokeStyle = 'rgba(92, 53, 23, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.82);
    ctx.lineTo(width, height * 0.82);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height * 0.85);
    ctx.lineTo(width, height * 0.85);
    ctx.stroke();

    // Roadside Milestone Pillar passing by
    const milestoneX = ((500 - (scroll * 40)) % (width + 300)) - 50;
    this.drawMilestone(ctx, milestoneX, height * 0.76, travelState.toLocation);

    // E. Animated Caravan Team
    const caravanBaseY = height * ((travelState.playerY || 650) / (travelState.worldHeight || 900));
    const caravanCenter = travelState.playerX || 180;

    // 1. Guard with Spear (In Front)
    PixelSpriteRenderer.drawCharacter(ctx, caravanCenter + 140, caravanBaseY, {
      facing: 'right',
      isMoving: isMoving,
      walkTimer: time,
      type: 'guard',
      colors: { robe: '#1d3557', turban: '#e63946', sash: '#ffd166' }
    });

    // 2. Merchant Player Character (Caravan Master)
    PixelSpriteRenderer.drawCharacter(ctx, caravanCenter + 80, caravanBaseY, {
      facing: 'right',
      isMoving: isMoving,
      walkTimer: time,
      type: 'elder_merchant',
      colors: { robe: '#c84b31', turban: '#ffd166', sash: '#e9c46a' }
    });

    // 3. Bullock / Ox & Heavy Wooden Cart
    this.drawOxAndCart(ctx, caravanCenter, caravanBaseY, scroll, travelState);

    // 4. Rear Caravan Guard
    PixelSpriteRenderer.drawCharacter(ctx, caravanCenter - 140, caravanBaseY, {
      facing: 'right',
      isMoving: isMoving,
      walkTimer: time,
      type: 'guard',
      colors: { robe: '#1d3557', turban: '#ffd166', sash: '#e63946' }
    });
  }

  /* --------------------------------------------------------------------------
     2. RIVER BOAT SCENE (Ganga / Narmada River Barges & Banks)
     -------------------------------------------------------------------------- */
  renderRiverScene(ctx, width, height, scroll, travelState, isMoving = false) {
    const time = this.walkTimer || 0;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.55);
    skyGrad.addColorStop(0, '#8ecae6');
    skyGrad.addColorStop(1, '#219ebc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Distant Riverbank with Palms & Temples
    ctx.fillStyle = '#2d6a4f';
    ctx.fillRect(0, height * 0.48, width, height * 0.12);

    for (let i = 0; i < 8; i++) {
      const tx = ((i * 180 - (scroll * 15)) % (width + 100)) - 40;
      this.drawPalmTree(ctx, tx, height * 0.50);
    }

    // River Water
    const riverGrad = ctx.createLinearGradient(0, height * 0.58, 0, height);
    riverGrad.addColorStop(0, '#1d3557');
    riverGrad.addColorStop(0.6, '#457b9d');
    riverGrad.addColorStop(1, '#1d3557');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(0, height * 0.58, width, height * 0.42);

    // Water wave ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    for (let row = 0; row < 5; row++) {
      const ry = height * (0.64 + row * 0.07);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 40) {
        const wave = Math.sin((x + scroll * 50 + row * 80) * 0.03) * 3;
        if (x === 0) ctx.moveTo(x, ry + wave);
        else ctx.lineTo(x, ry + wave);
      }
      ctx.stroke();
    }

    // Wooden River Cargo Barge
    const boatX = travelState.playerX || 180;
    const boatY = height * ((travelState.playerY || 650) / (travelState.worldHeight || 900)) + Math.sin(scroll * 0.08) * 3;
    this.drawRiverBoat(ctx, boatX, boatY, time);
  }

  /* --------------------------------------------------------------------------
     3. SEA MERCHANT DHOW SCENE (Arabian Sea, Ocean Swells, Billowing Sail)
     -------------------------------------------------------------------------- */
  renderSeaScene(ctx, width, height, scroll, travelState, isMoving = false) {
    const time = this.walkTimer || 0;

    // Ocean Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.52);
    skyGrad.addColorStop(0, '#f39a59');
    skyGrad.addColorStop(0.6, '#ffd166');
    skyGrad.addColorStop(1, '#06d6a0');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Deep Ocean Water
    const oceanGrad = ctx.createLinearGradient(0, height * 0.52, 0, height);
    oceanGrad.addColorStop(0, '#005f73');
    oceanGrad.addColorStop(0.5, '#0a9396');
    oceanGrad.addColorStop(1, '#001219');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, height * 0.52, width, height * 0.48);

    // Rolling Ocean Waves
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let row = 0; row < 6; row++) {
      const wy = height * (0.56 + row * 0.07);
      ctx.beginPath();
      for (let x = 0; x <= width; x += 30) {
        const wave = Math.sin((x + scroll * 60 + row * 70) * 0.025) * 5;
        if (x === 0) ctx.moveTo(x, wy + wave);
        else ctx.lineTo(x, wy + wave);
      }
      ctx.stroke();
    }

    // Ancient Merchant Sailing Dhow
    const dhowX = travelState.playerX || 180;
    const dhowY = height * ((travelState.playerY || 650) / (travelState.worldHeight || 900)) + Math.sin(scroll * 0.06) * 6;
    const rollAngle = Math.sin(scroll * 0.06) * 0.04;
    this.drawMerchantDhow(ctx, dhowX, dhowY, rollAngle);
  }

  /* --------------------------------------------------------------------------
     SPRITE HELPERS: Ox Cart, Trees, Dhow, River Boat
     -------------------------------------------------------------------------- */
  drawOxAndCart(ctx, x, y, scroll, travelState) {
    ctx.save();
    ctx.translate(x, y);

    // 1. Bullock / Ox Body (White / Tan Zebu Bull)
    const oxBob = Math.sin(scroll * 0.15) * 1.5;
    ctx.fillStyle = '#e8d8c8'; // Zebu White-Tan
    // Torso
    ctx.fillRect(20, -22 + oxBob, 36, 18);
    // Hump (Iconic Indian Zebu Hump)
    ctx.beginPath();
    ctx.arc(32, -24 + oxBob, 6, Math.PI, 0);
    ctx.fill();
    // Neck & Head
    ctx.fillRect(48, -26 + oxBob, 12, 14);
    // Horns
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(56, -26 + oxBob);
    ctx.lineTo(59, -34 + oxBob);
    ctx.moveTo(53, -26 + oxBob);
    ctx.lineTo(55, -34 + oxBob);
    ctx.stroke();

    // Ox Legs (Animated Walking)
    const legPhase = scroll * 0.15;
    ctx.fillStyle = '#d4c2b0';
    ctx.fillRect(24 + Math.sin(legPhase) * 4, -4, 4, 10);
    ctx.fillRect(46 - Math.sin(legPhase) * 4, -4, 4, 10);
    ctx.fillRect(28 - Math.sin(legPhase) * 4, -4, 4, 10);
    ctx.fillRect(50 + Math.sin(legPhase) * 4, -4, 4, 10);

    // Yoke & Wooden Reins connecting to Cart
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(20, -14);
    ctx.lineTo(-10, -10);
    ctx.stroke();

    // 2. Wooden Cart Body
    ctx.fillStyle = '#6f4e37'; // Hardwood Timber
    ctx.fillRect(-65, -20, 55, 14);
    // Wooden Side Slats
    ctx.strokeStyle = '#4a3324';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-65, -20, 55, 14);

    // 3. Stacked Cargo Sacks & Jute Bags
    ctx.fillStyle = '#c89666'; // Burlap Sacks
    ctx.beginPath();
    ctx.arc(-50, -24, 8, 0, Math.PI * 2);
    ctx.arc(-35, -24, 9, 0, Math.PI * 2);
    ctx.arc(-22, -23, 7, 0, Math.PI * 2);
    ctx.arc(-42, -31, 8, 0, Math.PI * 2);
    ctx.fill();

    // 4. Cart Wheels (Rotating Spoke Wheels)
    const wheelRot = scroll * 0.12;
    this.drawWoodenWheel(ctx, -50, -2, wheelRot);
    this.drawWoodenWheel(ctx, -25, -2, wheelRot);

    // 5. Cart Driver Sitting on Front
    ctx.fillStyle = '#e76f51'; // Saffron Robe
    ctx.fillRect(-12, -26, 8, 12);
    ctx.fillStyle = '#ffd166'; // Turban
    ctx.fillRect(-13, -32, 10, 6);

    ctx.restore();
  }

  drawWoodenWheel(ctx, wx, wy, angle) {
    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(angle);

    // Rim
    ctx.strokeStyle = '#3d2b1f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Hub
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Spokes
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 1.5;
    for (let s = 0; s < 4; s++) {
      ctx.beginPath();
      ctx.moveTo(-9, 0);
      ctx.lineTo(9, 0);
      ctx.stroke();
      ctx.rotate(Math.PI / 4);
    }

    ctx.restore();
  }

  drawRiverBoat(ctx, bx, by, time) {
    ctx.save();
    ctx.translate(bx, by);

    // Wooden Hull
    ctx.fillStyle = '#5c3a21';
    ctx.beginPath();
    ctx.moveTo(-60, 0);
    ctx.lineTo(60, 0);
    ctx.lineTo(45, 20);
    ctx.lineTo(-45, 20);
    ctx.closePath();
    ctx.fill();

    // Cargo Crates & Bags on Deck
    ctx.fillStyle = '#d4a373';
    ctx.fillRect(-25, -14, 20, 14);
    ctx.fillRect(0, -16, 24, 16);
    ctx.fillStyle = '#c84b31';
    ctx.fillRect(-10, -22, 16, 8); // Silk roll

    // Oarsman / Sailor
    ctx.fillStyle = '#ffd166'; // Turban
    ctx.fillRect(35, -22, 8, 6);
    ctx.fillStyle = '#2a9d8f'; // Robe
    ctx.fillRect(34, -16, 10, 16);

    // Wooden Oar dipping into water
    const oarAngle = Math.sin(time * 6) * 0.3;
    ctx.save();
    ctx.translate(38, -5);
    ctx.rotate(oarAngle);
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 30);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  drawMerchantDhow(ctx, dx, dy, roll) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.rotate(roll);

    // Dhow Wooden Hull
    ctx.fillStyle = '#4a2c11';
    ctx.beginPath();
    ctx.moveTo(-75, 5);
    ctx.lineTo(85, -5); // High pointed prow
    ctx.lineTo(65, 30);
    ctx.lineTo(-60, 30);
    ctx.closePath();
    ctx.fill();

    // Mast
    ctx.strokeStyle = '#38220f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, 5);
    ctx.lineTo(0, -70);
    ctx.stroke();

    // Billowing Triangular Lateen Sail
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.moveTo(0, -68);
    ctx.lineTo(-55, 0);
    ctx.quadraticCurveTo(-15, -25, 45, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawPixelTree(ctx, tx, ty) {
    ctx.save();
    ctx.translate(tx, ty);
    // Trunk
    ctx.fillStyle = '#4a3525';
    ctx.fillRect(-3, -24, 6, 24);
    // Foliage
    ctx.fillStyle = '#2d6a4f';
    ctx.beginPath();
    ctx.arc(0, -32, 16, 0, Math.PI * 2);
    ctx.arc(-10, -26, 12, 0, Math.PI * 2);
    ctx.arc(10, -26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawTravelCoins(ctx, coins, scroll, verticalScale = 1) {
    coins.forEach((coin, index) => {
      const bob = Math.sin(scroll * 0.08 + index) * 3;
      ctx.save();
      ctx.translate(coin.x, coin.y * verticalScale + bob);
      ctx.fillStyle = '#9c641e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffe08a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#fff0a8';
      ctx.font = 'bold 9px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('M', 0, 0);
      ctx.restore();
    });
  }

  drawDestinationMarker(ctx, x, y, destination) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#f3e2bd';
    ctx.strokeStyle = '#6b4623';
    ctx.lineWidth = 2;
    ctx.fillRect(-32, -72, 64, 34);
    ctx.strokeRect(-32, -72, 64, 34);
    ctx.fillStyle = '#b04a28';
    ctx.font = 'bold 11px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText(destination ? destination.toUpperCase() : 'DESTINATION', 0, -50);
    ctx.strokeStyle = '#6b4623';
    ctx.beginPath();
    ctx.moveTo(0, -38);
    ctx.lineTo(0, 0);
    ctx.stroke();
    ctx.restore();
  }

  drawFloatingMessage(ctx, message, age, verticalScale = 1) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - age);
    ctx.fillStyle = '#fff0a8';
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(message.text, message.x, message.y * verticalScale - age * 35);
    ctx.restore();
  }

  drawPalmTree(ctx, px, py) {
    ctx.save();
    ctx.translate(px, py);
    // Trunk
    ctx.strokeStyle = '#6f4e37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(6, -20, 2, -35);
    ctx.stroke();
    // Fronds
    ctx.fillStyle = '#1b4332';
    ctx.beginPath();
    ctx.ellipse(2, -36, 16, 6, -0.4, 0, Math.PI * 2);
    ctx.ellipse(2, -36, 16, 6, 0.4, 0, Math.PI * 2);
    ctx.ellipse(2, -38, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawMilestone(ctx, mx, my, destName) {
    ctx.save();
    ctx.translate(mx, my);
    ctx.fillStyle = '#e9ecef';
    ctx.strokeStyle = '#adb5bd';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-10, -22, 20, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#c84b31';
    ctx.fillRect(-10, -22, 20, 7);

    ctx.font = 'bold 6.5px monospace';
    ctx.fillStyle = '#212529';
    ctx.textAlign = 'center';
    ctx.fillText(destName ? destName.slice(0, 4).toUpperCase() : 'DEST', 0, -5);
    ctx.restore();
  }
}
