/**
 * Camera.js - 2D Viewport Camera Follow System
 * 
 * Tracks the player character within a larger virtual game world (e.g., 2000x1400)
 * and clamps to world boundaries so empty space outside the map is never shown.
 */

export class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.x = 0;
    this.y = 0;
  }

  resize(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    if (worldWidth) this.worldWidth = worldWidth;
    if (worldHeight) this.worldHeight = worldHeight;
  }

  /**
   * Update camera position smoothly centered on player target with lerp and boundary clamping
   * @param {{ x: number, y: number }} target 
   * @param {number} lerpFactor 
   */
  update(target, lerpFactor = 0.1) {
    if (!target) return;

    // Desired target centered on player
    let desiredX = target.x - this.viewportWidth / 2;
    let desiredY = target.y - this.viewportHeight / 2;

    // Clamp desired position to world boundaries
    const maxX = Math.max(0, this.worldWidth - this.viewportWidth);
    const maxY = Math.max(0, this.worldHeight - this.viewportHeight);

    desiredX = Math.max(0, Math.min(desiredX, maxX));
    desiredY = Math.max(0, Math.min(desiredY, maxY));

    // Smooth linear interpolation (lerp)
    this.x += (desiredX - this.x) * lerpFactor;
    this.y += (desiredY - this.y) * lerpFactor;
  }

  /**
   * Convert screen coordinates to world coordinates
   */
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }
}
