/**
 * LocationMarker.js - Renders historical trade hubs with architectural icons and badges
 */

export class LocationMarker {
  constructor(data) {
    this.id = data.id;
    this.name = data.name.toUpperCase();
    this.displayName = data.name;
    this.region = data.region;
    this.role = data.role;
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.isPort = data.isPort || false;
    this.isCapital = data.type === 'capital';
  }

  draw(ctx, time = 0, isUnlocked = true, isCurrentLocation = false, isVisited = false) {
    const x = this.x;
    const y = this.y;

    ctx.save();

    // Dim locked location markers
    if (!isUnlocked) {
      ctx.globalAlpha = 0.55;
    }

    // Ground platform base shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 16, 36, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beacon glow pulse (active for unlocked locations)
    if (isUnlocked) {
      const pulseRadius = (isCurrentLocation ? 44 : 38) + Math.sin(time * 2.5 + (this.x % 5)) * 4;
      const glowGradient = ctx.createRadialGradient(x, y, 6, x, y, pulseRadius);
      if (isCurrentLocation) {
        glowGradient.addColorStop(0, 'rgba(46, 196, 182, 0.5)');
        glowGradient.addColorStop(1, 'rgba(46, 196, 182, 0)');
      } else if (this.isCapital) {
        glowGradient.addColorStop(0, 'rgba(255, 209, 102, 0.35)');
        glowGradient.addColorStop(1, 'rgba(255, 209, 102, 0)');
      } else if (this.isPort) {
        glowGradient.addColorStop(0, 'rgba(42, 157, 143, 0.35)');
        glowGradient.addColorStop(1, 'rgba(42, 157, 143, 0)');
      } else {
        glowGradient.addColorStop(0, 'rgba(244, 162, 97, 0.35)');
        glowGradient.addColorStop(1, 'rgba(244, 162, 97, 0)');
      }
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Architectural Icon / Structure
    if (this.isCapital) {
      // Pataliputra Royal Palace/Fort Pavilion
      ctx.fillStyle = '#8d5b4c';
      ctx.fillRect(x - 22, y - 10, 44, 24);
      ctx.fillStyle = '#e9c46a';
      ctx.fillRect(x - 18, y - 8, 5, 22);
      ctx.fillRect(x - 6, y - 8, 5, 22);
      ctx.fillRect(x + 6, y - 8, 5, 22);
      ctx.fillRect(x + 14, y - 8, 5, 22);
      ctx.fillStyle = '#2b1b17';
      ctx.beginPath();
      ctx.arc(x, y + 6, 8, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(x - 24, y - 10);
      ctx.quadraticCurveTo(x, y - 26, x + 24, y - 10);
      ctx.fill();
      ctx.strokeStyle = '#e76f51';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x, y - 36);
      ctx.stroke();
      ctx.fillStyle = '#e76f51';
      ctx.beginPath();
      ctx.moveTo(x, y - 36);
      ctx.lineTo(x + 10, y - 31);
      ctx.lineTo(x, y - 26);
      ctx.fill();
    } else if (this.isPort) {
      // Bharuch / Muziris Port Lighthouse & Dock Watchtower
      ctx.fillStyle = '#3a506b';
      ctx.fillRect(x - 14, y - 18, 28, 32);
      ctx.fillStyle = '#e0fbfc';
      ctx.fillRect(x - 14, y - 8, 28, 5);
      ctx.fillRect(x - 14, y + 4, 28, 5);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x - 10, y - 26, 20, 8);
      ctx.fillStyle = '#e07a5f';
      ctx.beginPath();
      ctx.moveTo(x - 15, y - 26);
      ctx.lineTo(x, y - 36);
      ctx.lineTo(x + 15, y - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚓', x + 24, y + 10);
    } else {
      // Ujjain Trade Crossroads Gateway / Stupa
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(x - 18, y - 6, 36, 20);
      ctx.fillStyle = '#ddb892';
      ctx.beginPath();
      ctx.arc(x, y - 6, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(x - 3, y - 28, 6, 6);
      ctx.fillStyle = '#1c1512';
      ctx.beginPath();
      ctx.arc(x, y + 6, 7, Math.PI, 0);
      ctx.fill();
    }

    // Hub Status Prefix: 📍 for current, 🟢 for visited, 🔵 for unlocked, 🔒 for locked
    const statusPrefix = isCurrentLocation 
      ? '📍 ' 
      : (isVisited ? '🟢 ' : (isUnlocked ? '🔵 ' : '🔒 '));
    const labelText = statusPrefix + this.name;
    const regionText = this.region;
    
    ctx.font = 'bold 12px "Cinzel", serif';
    const textWidth = Math.max(ctx.measureText(labelText).width, 85);
    
    const badgeY = y + 26;
    const badgeHeight = 28;
    const badgeWidth = textWidth + 24;

    ctx.fillStyle = 'rgba(14, 19, 29, 0.85)';
    ctx.strokeStyle = isCurrentLocation 
      ? '#2ec4b6' 
      : (isUnlocked ? (this.isCapital ? 'rgba(255, 209, 102, 0.6)' : 'rgba(233, 196, 106, 0.4)') : 'rgba(148, 163, 184, 0.3)');
    ctx.lineWidth = isCurrentLocation ? 2 : 1.5;
    
    // Rounded rect badge
    ctx.beginPath();
    ctx.roundRect(x - badgeWidth / 2, badgeY, badgeWidth, badgeHeight, 6);
    ctx.fill();
    ctx.stroke();

    // City Name (e.g. 🟢 PATALIPUTRA)
    ctx.fillStyle = isCurrentLocation ? '#2ec4b6' : (isUnlocked ? (this.isCapital ? '#ffd166' : '#f8fafc') : '#94a3b8');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 11.5px "Cinzel", serif';
    ctx.fillText(labelText, x, badgeY + 9);

    // Region Name (e.g. Bihar)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 9px "Outfit", sans-serif';
    ctx.fillText(regionText, x, badgeY + 20);

    ctx.restore();
  }
}
