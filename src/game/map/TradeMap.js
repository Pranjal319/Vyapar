/**
 * TradeMap.js - Dedicated 2D Historical India Trade Map Renderer
 * 
 * Renders an authentic, stylized RPG parchment map of the Indian Subcontinent:
 * - Warm antique parchment texture with aged paper edges & vignette
 * - Hand-drawn geographical silhouette of Bharat / Indian subcontinent & coastlines
 * - Major ancient rivers: Ganga, Yamuna, Narmada, Godavari, Kaveri, Periyar
 * - Mountain ranges: Himalayas (North), Vindhya Range (Central), Western Ghats (Southwest)
 * - Oceans: Sindhu Sagar (Arabian Sea), Purva Sagar (Bay of Bengal), Mahasagar (Indian Ocean)
 * - 5 Distinct Trade Hub Markers with pulsating current player location badge
 * - Overland caravan trails & maritime coastal routes with animated direction markers
 * - Decorative nautical compass rose and Sanskrit/Latin cartographic labels
 */

import statesData from '../../data/states.json';
import routesData from '../../data/routes.json';
import { Caravan } from './Caravan';
import { MapCamera } from './MapCamera';
import { globalProgressManager } from '../progression/ProgressManager';
import { globalTravelManager } from '../travel/TravelManager';

export class TradeMap {
  constructor(viewportWidth, viewportHeight) {
    this.mapWidth = 3000;
    this.mapHeight = 2400;

    this.camera = new MapCamera(viewportWidth, viewportHeight, this.mapWidth, this.mapHeight);

    this.locations = statesData;
    this.routes = routesData;

    this.hoveredLocation = null;
    this.selectedLocation = null;

    this.time = 0;
    this.dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;

    // Background caravans traveling along routes
    this.bgCaravans = [
      { route: this.routes[0], speed: 0.05, offset: 0.2 },
      { route: this.routes[1], speed: 0.04, offset: 0.6 },
      { route: this.routes[2], speed: 0.03, offset: 0.1 },
      { route: this.routes[3], speed: 0.045, offset: 0.7 }
    ];

    // Center camera initially on current location
    const curLocId = globalProgressManager.currentLocation || 'ujjain';
    const curLoc = this.locations.find(l => l.id === curLocId) || this.locations[0];
    if (curLoc) {
      this.camera.centerOn(curLoc.mapX, curLoc.mapY);
    }
  }

  resize(w, h, dpr = (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1) {
    this.dpr = dpr;
    this.camera.resize(w, h);
  }

  update(dt) {
    this.time += dt;

    if (globalTravelManager.isTravelling) {
      globalTravelManager.update(dt);
    }
  }

  render(ctx) {
    const time = this.time;
    const dpr = this.dpr || (typeof window !== 'undefined' ? window.devicePixelRatio : 1) || 1;

    ctx.save();

    // Reset transform with High-DPI screen scaling & clear
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);

    // Apply Camera transform (Pan & Zoom) in CSS pixel space
    ctx.translate(-this.camera.x, -this.camera.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // 1. Ancient Parchment Base & Ocean Waters
    this.drawParchmentBase(ctx);
    this.drawOceanWaters(ctx, time);

    // 2. Indian Subcontinent Landmass Silhouette
    this.drawIndianSubcontinent(ctx);

    // 3. Ancient Mountain Ranges (Himalayas, Vindhyas, Western Ghats)
    this.drawMountainRanges(ctx);

    // 4. Major Ancient Rivers (Ganga, Yamuna, Narmada, Godavari, Kaveri, Periyar)
    this.drawAncientRivers(ctx, time);

    // 5. Regional Geographic & Ocean Labels
    this.drawGeographicLabels(ctx);

    // 6. Historical Trade Routes Layer
    const travelState = globalTravelManager.getState();

    this.routes.forEach(route => {
      const isUnlocked = (
        globalProgressManager.isUnlocked(route.from) ||
        globalProgressManager.isUnlocked(route.to)
      );
      const isSelected = (
        travelState.isTravelling &&
        travelState.activeRoute &&
        travelState.activeRoute.id === route.id
      );

      this.drawTradeRoute(ctx, route, time, isUnlocked, isSelected);
    });

    // 7. Background Caravans
    Caravan.drawBackgroundCaravans(ctx, this.bgCaravans, time);

    // 8. Player Caravan / Ship (when traveling)
    if (travelState.isTravelling && travelState.activeRoute) {
      Caravan.drawPlayerCaravan(
        ctx,
        travelState.activeRoute,
        travelState.progressRatio,
        time
      );
    }

    // 9. 5 Historical Location Hub Markers
    this.locations.forEach(loc => {
      this.drawLocationMarker(ctx, loc, time);
    });

    // 10. Decorative Cartographic Compass Rose
    this.drawCompassRose(ctx, 650, 600, time);

    // 11. Map Title Cartouche
    this.drawMapTitleCartouche(ctx, 600, 320);

    ctx.restore();
  }

  drawParchmentBase(ctx) {
    // Warm Antique Parchment Gradient
    const grad = ctx.createRadialGradient(
      this.mapWidth / 2, this.mapHeight / 2, 300,
      this.mapWidth / 2, this.mapHeight / 2, this.mapWidth * 0.75
    );
    grad.addColorStop(0, '#ebe0cc');
    grad.addColorStop(0.5, '#e0d1b6');
    grad.addColorStop(0.85, '#cca977');
    grad.addColorStop(1, '#9e7b4a');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);

    // Ancient Cartographic Coordinate Grid Lines
    ctx.strokeStyle = 'rgba(120, 85, 45, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.mapWidth; x += 160) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.mapHeight);
      ctx.stroke();
    }
    for (let y = 0; y < this.mapHeight; y += 160) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.mapWidth, y);
      ctx.stroke();
    }
  }

  drawOceanWaters(ctx, time) {
    // Arabian Sea (West), Bay of Bengal (East), Indian Ocean (South)
    // Painted in gentle antique watercolor blue-green
    ctx.save();
    
    // West Ocean (Sindhu Sagar)
    ctx.fillStyle = 'rgba(92, 138, 153, 0.45)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(820, 0);
    ctx.lineTo(840, 650);
    ctx.lineTo(760, 950); // Indus delta
    ctx.lineTo(950, 1150); // Gujarat Gulf
    ctx.lineTo(900, 1450); // Konkan coast
    ctx.lineTo(1080, 1920); // Malabar coast
    ctx.lineTo(1350, 2350); // Kanyakumari tip
    ctx.lineTo(0, 2400);
    ctx.closePath();
    ctx.fill();

    // East Ocean (Purva Sagar / Bay of Bengal)
    ctx.beginPath();
    ctx.moveTo(3000, 0);
    ctx.lineTo(2550, 0);
    ctx.lineTo(2450, 850); // Bengal delta
    ctx.lineTo(2050, 1200); // Odisha coast
    ctx.lineTo(1780, 1600); // Coromandel coast
    ctx.lineTo(1520, 2050); // Tamil coast
    ctx.lineTo(1350, 2350); // Kanyakumari tip
    ctx.lineTo(3000, 2400);
    ctx.closePath();
    ctx.fill();

    // Subtle Wave Linework
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.5;
    const wavePoints = [
      { x: 450, y: 1300 }, { x: 550, y: 1550 }, { x: 680, y: 1800 },
      { x: 2300, y: 1400 }, { x: 2200, y: 1700 }, { x: 2000, y: 1950 }
    ];
    wavePoints.forEach(wp => {
      const woff = Math.sin(time * 2 + wp.x * 0.01) * 6;
      ctx.beginPath();
      ctx.arc(wp.x + woff, wp.y, 18, Math.PI * 0.8, Math.PI * 1.8);
      ctx.arc(wp.x + 30 + woff, wp.y, 18, Math.PI * 0.8, Math.PI * 1.8);
      ctx.stroke();
    });

    ctx.restore();
  }

  drawIndianSubcontinent(ctx) {
    ctx.save();
    // Indian Landmass Silhouette (Warm antique terra-cotta sandstone)
    ctx.fillStyle = '#f0e5d0';
    ctx.strokeStyle = '#855d31';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    // Northern Frontier / Himalayas
    ctx.moveTo(820, 350);
    ctx.lineTo(1150, 280);
    ctx.lineTo(1550, 260); // Kashmir / North
    ctx.lineTo(2050, 300); // Nepal / Himalayas
    ctx.lineTo(2550, 380); // Assam

    // Eastern Coastline (Bay of Bengal)
    ctx.lineTo(2480, 750); // Gangetic delta / Bengal
    ctx.lineTo(2150, 1050); // Odisha
    ctx.lineTo(1850, 1450); // Andhra
    ctx.lineTo(1650, 1750); // Coromandel
    ctx.lineTo(1480, 2050); // Tamil Nadu / Madurai coast
    ctx.lineTo(1350, 2320); // Kanyakumari (Southernmost cape)

    // Western Coastline (Arabian Sea)
    ctx.lineTo(1220, 2080); // Kerala / Muziris coast
    ctx.lineTo(1080, 1750); // Malabar coast
    ctx.lineTo(980, 1420); // Goa / Konkan
    ctx.lineTo(1050, 1220); // Bharuch / Gulf of Khambhat
    ctx.lineTo(880, 1120); // Kathiawar / Gujarat peninsula
    ctx.lineTo(760, 950); // Rann of Kutch
    ctx.lineTo(820, 680); // Sindh / Thar desert
    ctx.lineTo(820, 350); // Return North
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Coastal Shading Ribbon (Aged map boundary glow)
    ctx.strokeStyle = 'rgba(168, 124, 69, 0.45)';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.restore();
  }

  drawMountainRanges(ctx) {
    ctx.save();
    ctx.fillStyle = '#8f683a';
    ctx.strokeStyle = '#5a3d1c';
    ctx.lineWidth = 1.5;

    // 1. Himalayan Mountain Arc (North)
    const himalayas = [
      { x: 1200, y: 360 }, { x: 1350, y: 340 }, { x: 1500, y: 320 },
      { x: 1680, y: 330 }, { x: 1850, y: 350 }, { x: 2020, y: 370 },
      { x: 2200, y: 400 }, { x: 2380, y: 430 }
    ];
    himalayas.forEach(m => this.drawMountainPeak(ctx, m.x, m.y, 34, 42));

    // 2. Vindhya & Satpura Ranges (Central India - near Ujjain & Narmada)
    const vindhyas = [
      { x: 1250, y: 920 }, { x: 1380, y: 940 }, { x: 1520, y: 930 },
      { x: 1660, y: 950 }, { x: 1780, y: 970 }
    ];
    vindhyas.forEach(m => this.drawMountainPeak(ctx, m.x, m.y, 24, 28));

    // 3. Western Ghats (Sahyadri Range - Western flank toward Muziris)
    const ghats = [
      { x: 1040, y: 1320 }, { x: 1080, y: 1480 }, { x: 1140, y: 1640 },
      { x: 1220, y: 1800 }, { x: 1290, y: 1940 }, { x: 1320, y: 2100 }
    ];
    ghats.forEach(m => this.drawMountainPeak(ctx, m.x, m.y, 22, 26));

    ctx.restore();
  }

  drawMountainPeak(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y + h / 2);
    ctx.lineTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Shaded side
    ctx.fillStyle = '#6b4920';
    ctx.beginPath();
    ctx.moveTo(x, y - h / 2);
    ctx.lineTo(x + w / 2, y + h / 2);
    ctx.lineTo(x, y + h / 2);
    ctx.closePath();
    ctx.fill();
  }

  drawAncientRivers(ctx, time) {
    ctx.save();
    ctx.strokeStyle = '#3d7a8a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Ganga River (Pataliputra to Bengal Bay)
    ctx.beginPath();
    ctx.moveTo(1450, 420); // Gangotri
    ctx.quadraticCurveTo(1650, 600, 1850, 680);
    ctx.quadraticCurveTo(2000, 720, 2100, 750); // Pataliputra
    ctx.quadraticCurveTo(2300, 800, 2460, 920); // Delta
    ctx.stroke();

    // 2. Yamuna River
    ctx.beginPath();
    ctx.moveTo(1360, 440);
    ctx.quadraticCurveTo(1520, 620, 1850, 680); // Confluence at Prayag
    ctx.stroke();

    // 3. Narmada River (Through Vindhyas down to Bharuch Port)
    ctx.beginPath();
    ctx.moveTo(1720, 1020);
    ctx.quadraticCurveTo(1450, 1060, 1280, 1120);
    ctx.lineTo(1050, 1180); // Bharuch
    ctx.stroke();

    // 4. Godavari River
    ctx.beginPath();
    ctx.moveTo(1120, 1340);
    ctx.quadraticCurveTo(1480, 1380, 1920, 1420);
    ctx.stroke();

    // 5. Kaveri River (South toward Madurai)
    ctx.beginPath();
    ctx.moveTo(1220, 1820);
    ctx.quadraticCurveTo(1400, 1820, 1600, 1840);
    ctx.stroke();

    // 6. Periyar River (At Muziris)
    ctx.beginPath();
    ctx.moveTo(1320, 1960);
    ctx.lineTo(1220, 1980);
    ctx.stroke();

    ctx.restore();
  }

  drawGeographicLabels(ctx) {
    ctx.save();
    ctx.font = 'italic bold 15px "Cinzel", serif';
    ctx.fillStyle = 'rgba(74, 52, 28, 0.75)';
    ctx.textAlign = 'center';

    // Oceans
    ctx.fillText('SINDHU  SAGAR', 520, 1380);
    ctx.font = '10.5px "Cinzel", serif';
    ctx.fillText('( Arabian Sea )', 520, 1402);

    ctx.font = 'italic bold 15px "Cinzel", serif';
    ctx.fillText('PURVA  SAGAR', 2340, 1480);
    ctx.font = '10.5px "Cinzel", serif';
    ctx.fillText('( Bay of Bengal )', 2340, 1502);

    ctx.font = 'italic bold 16px "Cinzel", serif';
    ctx.fillText('HIND  MAHASAGAR', 1350, 2375);

    // Mountain Labels
    ctx.font = 'bold 12px "Cinzel", serif';
    ctx.fillStyle = 'rgba(94, 60, 30, 0.75)';
    ctx.fillText('H I M A L A Y A S', 1780, 310);
    ctx.fillText('V I N D H Y A   R A N G E', 1520, 915);
    ctx.fillText('W E S T E R N   G H A T S', 1060, 1620);

    // River Labels
    ctx.font = 'italic 10.5px "Outfit", sans-serif';
    ctx.fillStyle = '#265463';
    ctx.fillText('~ Ganga River ~', 1950, 710);
    ctx.fillText('~ Narmada River ~', 1320, 1085);

    ctx.restore();
  }

  drawTradeRoute(ctx, route, time, isUnlocked, isSelected) {
    if (!route.waypoints || route.waypoints.length < 2) return;

    ctx.save();

    const isMaritime = route.type === 'maritime';
    const baseColor = isMaritime ? '#1d6f8a' : (isUnlocked ? '#b04a28' : '#735942');

    // Route Path Line
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = isSelected ? 4.5 : (isUnlocked ? 3 : 2);
    if (!isMaritime) {
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -time * 12;
    } else {
      ctx.setLineDash([12, 6]);
      ctx.lineDashOffset = -time * 16;
    }

    ctx.beginPath();
    route.waypoints.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // Midpoint Route Icon Badge
    const midIdx = Math.floor(route.waypoints.length / 2);
    const midPt = route.waypoints[midIdx];

    ctx.fillStyle = isUnlocked ? '#26170d' : '#4d3928';
    ctx.strokeStyle = isUnlocked ? '#ffd166' : '#8c735d';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(midPt.x, midPt.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(route.icon || (isMaritime ? '⛵' : '🐪'), midPt.x, midPt.y);

    ctx.restore();
  }

  drawLocationMarker(ctx, loc, time) {
    const x = loc.mapX;
    const y = loc.mapY;

    const isCurrent = globalProgressManager.currentLocation === loc.id;
    const isUnlocked = globalProgressManager.isUnlocked(loc.id);
    const isHovered = this.hoveredLocation && this.hoveredLocation.id === loc.id;
    const isSelected = this.selectedLocation && this.selectedLocation.id === loc.id;

    ctx.save();

    // 1. Current Location Pulsing Gold Halo
    if (isCurrent) {
      const haloR = 24 + Math.sin(time * 4) * 4;
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, haloR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 209, 102, 0.25)';
      ctx.fill();
    }

    // 2. City Marker Medallion
    ctx.fillStyle = isCurrent ? '#d90429' : (isUnlocked ? '#1d3557' : '#544639');
    ctx.strokeStyle = isCurrent ? '#ffd166' : (isUnlocked ? '#ffd166' : '#857361');
    ctx.lineWidth = isSelected ? 4 : (isHovered ? 3.5 : 2);

    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Location Type Icon
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(loc.isPort ? '⚓' : '🏛️', x, y);

    // 3. City Name Banner Ribbon
    const bannerY = y + 28;
    ctx.font = 'bold 13px "Cinzel", serif';
    const textWidth = ctx.measureText(loc.name.toUpperCase()).width;
    const boxW = textWidth + 24;

    ctx.fillStyle = isCurrent ? '#1c120c' : (isUnlocked ? '#241a12' : '#3d3126');
    ctx.strokeStyle = isCurrent ? '#ffd166' : (isUnlocked ? '#e9c46a' : '#6b5744');
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, bannerY - 11, boxW, 22, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isCurrent ? '#ffd166' : (isUnlocked ? '#ffffff' : '#a89887');
    ctx.fillText(loc.name.toUpperCase(), x, bannerY);

    // Lock Indicator if locked
    if (!isUnlocked) {
      ctx.fillStyle = '#ff6b6b';
      ctx.font = '10px sans-serif';
      ctx.fillText('🔒', x + boxW / 2 + 10, bannerY);
    }

    ctx.restore();
  }

  drawCompassRose(ctx, cx, cy, time) {
    ctx.save();
    const r = 58;

    // Outer Brass Rings
    ctx.strokeStyle = '#6b4623';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#c9933b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
    ctx.stroke();

    // 4 Cardinal Compass Points
    const points = [
      { ang: -Math.PI / 2, label: 'N', color: '#b02a2a' },
      { ang: 0, label: 'E', color: '#c9933b' },
      { ang: Math.PI / 2, label: 'S', color: '#c9933b' },
      { ang: Math.PI, label: 'W', color: '#c9933b' }
    ];

    points.forEach(pt => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(pt.ang) * (r - 8),
        cy + Math.sin(pt.ang) * (r - 8)
      );
      ctx.lineTo(
        cx + Math.cos(pt.ang + 0.3) * 16,
        cy + Math.sin(pt.ang + 0.3) * 16
      );
      ctx.closePath();
      ctx.fill();

      // Cardinal Letter
      ctx.fillStyle = pt.color === '#b02a2a' ? '#b02a2a' : '#452c15';
      ctx.font = 'bold 12px "Cinzel", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        pt.label,
        cx + Math.cos(pt.ang) * (r + 14),
        cy + Math.sin(pt.ang) * (r + 14)
      );
    });

    ctx.restore();
  }

  drawMapTitleCartouche(ctx, x, y) {
    ctx.save();
    // Ancient Decorative Title Scroll
    ctx.fillStyle = 'rgba(235, 218, 188, 0.95)';
    ctx.strokeStyle = '#6b4623';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(x - 170, y - 40, 340, 80, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#c9933b';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 165, y - 35, 330, 70);

    ctx.fillStyle = '#4a2c11';
    ctx.font = 'bold 16px "Cinzel", serif';
    ctx.textAlign = 'center';
    ctx.fillText('ANCIENT INDIA TRADE ROUTES', x, y - 10);

    ctx.fillStyle = '#b04a28';
    ctx.font = 'bold 10px "Cinzel", serif';
    ctx.fillText('HIGHWAYS & MARITIME SEAWAYS • c. 250 BCE', x, y + 12);

    ctx.fillStyle = '#6b4623';
    ctx.font = 'italic 9.5px "Outfit", sans-serif';
    ctx.fillText('Click any unlocked trade center to plan your journey', x, y + 26);

    ctx.restore();
  }

  handleMouseMove(clientX, clientY) {
    const worldPos = this.camera.screenToWorld(clientX, clientY);
    let found = null;

    for (const loc of this.locations) {
      const dx = loc.mapX - worldPos.x;
      const dy = loc.mapY - worldPos.y;
      // Generous marker hit bounds (covers medallion and name ribbon)
      if (Math.abs(dx) <= 110 && dy >= -45 && dy <= 65) {
        found = loc;
        break;
      }
    }

    this.hoveredLocation = found;
    return found;
  }

  handleMouseClick(clientX, clientY) {
    const worldPos = this.camera.screenToWorld(clientX, clientY);

    for (const loc of this.locations) {
      const dx = loc.mapX - worldPos.x;
      const dy = loc.mapY - worldPos.y;
      if (Math.abs(dx) <= 110 && dy >= -45 && dy <= 65) {
        const isUnlocked = globalProgressManager.isUnlocked(loc.id);
        console.log(`[MAP] Click detected on: ${loc.name} (${loc.id}), Unlocked: ${isUnlocked}`);
        this.selectedLocation = loc;
        return loc;
      }
    }

    this.selectedLocation = null;
    return null;
  }
}
