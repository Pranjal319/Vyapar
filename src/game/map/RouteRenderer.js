/**
 * RouteRenderer.js - Draws historical trade routes on the strategic map
 * 
 * Supports Overland (warm dashed), River (blue path), and Maritime (curved blue sea lines)
 * with animated glowing particles moving along active trade corridors.
 */

export class RouteRenderer {
  /**
   * Draw trade route line and animated flow particles
   * @param {CanvasRenderingContext2D} ctx 
   * @param {Object} route - Route definition with waypoints and type
   * @param {number} time - Elapsed animation time
   * @param {boolean} isUnlocked - Whether route is unlocked
   * @param {boolean} isSelected - Whether route is currently active/selected
   */
  static draw(ctx, route, time = 0, isUnlocked = false, isSelected = false) {
    if (!route.waypoints || route.waypoints.length < 2) return;

    ctx.save();

    const isMaritime = route.type === 'maritime';
    const isRiver = route.type === 'river';

    // Set line style base
    if (isSelected) {
      ctx.strokeStyle = '#ffd166'; // Glowing gold for active travel route
      ctx.lineWidth = 4.5;
      ctx.shadowColor = '#ffd166';
      ctx.shadowBlur = 12;
    } else if (isUnlocked) {
      if (isMaritime) {
        ctx.strokeStyle = 'rgba(46, 196, 182, 0.85)';
        ctx.lineWidth = 3;
      } else if (isRiver) {
        ctx.strokeStyle = 'rgba(72, 149, 239, 0.85)';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(244, 162, 97, 0.85)'; // Overland warm gold
        ctx.lineWidth = 3;
      }
    } else {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; // Locked route dimmed
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
    }

    if (route.type === 'overland' && isUnlocked && !isSelected) {
      ctx.setLineDash([8, 6]);
    } else if (isMaritime && isUnlocked && !isSelected) {
      ctx.setLineDash([12, 6]);
    }

    // Begin path along waypoints
    ctx.beginPath();
    ctx.moveTo(route.waypoints[0].x, route.waypoints[0].y);

    for (let i = 1; i < route.waypoints.length; i++) {
      const prev = route.waypoints[i - 1];
      const curr = route.waypoints[i];

      if (isMaritime) {
        // Curve maritime paths slightly across sea
        const midX = (prev.x + curr.x) / 2 - 40;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(midX, midY, curr.x, curr.y);
      } else {
        ctx.lineTo(curr.x, curr.y);
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Draw animated moving trade particles along unlocked routes
    if (isUnlocked) {
      const numParticles = isSelected ? 6 : 3;
      const speedScale = isMaritime ? 0.3 : 0.45;

      for (let p = 0; p < numParticles; p++) {
        const offset = (time * speedScale + p / numParticles) % 1.0;
        const pos = RouteRenderer.getPointAtProgress(route, offset);

        ctx.fillStyle = isSelected ? '#ffffff' : (isMaritime ? '#80ed99' : '#ffd166');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, isSelected ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }

  /**
   * Interpolate exact (x, y) coordinates along multi-waypoint route for progress (0.0 -> 1.0)
   * @param {Object} route 
   * @param {number} progress - 0.0 to 1.0
   * @returns {{x: number, y: number}}
   */
  static getPointAtProgress(route, progress) {
    const pts = route.waypoints;
    if (!pts || pts.length === 0) return { x: 0, y: 0 };
    if (pts.length === 1 || progress <= 0) return { x: pts[0].x, y: pts[0].y };
    if (progress >= 1) return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };

    const totalSegments = pts.length - 1;
    const scaledProgress = progress * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
    const segmentT = scaledProgress - segmentIndex;

    const p1 = pts[segmentIndex];
    const p2 = pts[segmentIndex + 1];

    if (route.type === 'maritime') {
      const midX = (p1.x + p2.x) / 2 - 40;
      const midY = (p1.y + p2.y) / 2;
      // Bezier quadratic curve interpolation
      const invT = 1 - segmentT;
      const x = invT * invT * p1.x + 2 * invT * segmentT * midX + segmentT * segmentT * p2.x;
      const y = invT * invT * p1.y + 2 * invT * segmentT * midY + segmentT * segmentT * p2.y;
      return { x, y };
    }

    return {
      x: p1.x + (p2.x - p1.x) * segmentT,
      y: p1.y + (p2.y - p1.y) * segmentT
    };
  }
}
