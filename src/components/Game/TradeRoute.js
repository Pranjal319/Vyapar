/**
 * TradeRoute.js - Renders overland caravan highways and maritime coastal sea lanes
 */

export class TradeRoute {
  constructor(startLoc, endLoc, type = 'land') {
    this.start = startLoc;
    this.end = endLoc;
    this.type = type; // 'land' or 'maritime'
  }

  draw(ctx, time = 0) {
    ctx.save();

    if (this.type === 'land') {
      // Historical Overland Highway (Pataliputra <-> Ujjain <-> Bharuch)
      // Path base track (wide earth road)
      ctx.beginPath();
      ctx.moveTo(this.start.x, this.start.y);
      // Gentle natural curve between cities
      const midX = (this.start.x + this.end.x) / 2 + 15;
      const midY = (this.start.y + this.end.y) / 2 - 10;
      ctx.quadraticCurveTo(midX, midY, this.end.x, this.end.y);

      ctx.strokeStyle = 'rgba(74, 55, 40, 0.4)';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Outer trade track borders
      ctx.strokeStyle = 'rgba(233, 196, 106, 0.2)';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      ctx.stroke();

      // Dashed caravan path
      ctx.strokeStyle = '#f4a261';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      // Highway route name marker near midpoint
      ctx.fillStyle = 'rgba(233, 196, 106, 0.7)';
      ctx.font = 'italic 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.setLineDash([]);
      ctx.fillText('Overland Caravan Highway', midX, midY - 8);

    } else if (this.type === 'maritime') {
      // Ancient Maritime Spice Route (Bharuch <-> Muziris) along the Arabian Sea coast
      ctx.beginPath();
      ctx.moveTo(this.start.x, this.start.y);
      // Arc out slightly into the coastal waters
      const ctrlX = Math.min(this.start.x, this.end.x) - 45;
      const ctrlY = (this.start.y + this.end.y) / 2;
      ctx.quadraticCurveTo(ctrlX, ctrlY, this.end.x, this.end.y);

      // Sea lane water wake
      ctx.strokeStyle = 'rgba(42, 157, 143, 0.25)';
      ctx.lineWidth = 12;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Dynamic rippling dashed sea navigation line
      ctx.strokeStyle = '#2ec4b6';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -time * 12;
      ctx.stroke();

      // Nautical path label
      ctx.fillStyle = 'rgba(46, 196, 182, 0.85)';
      ctx.font = 'italic 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.setLineDash([]);
      ctx.fillText('🌊 Coastal Spice Sea Route', ctrlX - 10, ctrlY);
    }

    ctx.restore();
  }
}
