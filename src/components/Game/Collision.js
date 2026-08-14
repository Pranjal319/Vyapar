/**
 * Collision.js - AABB rectangular collision detection and resolution
 * 
 * Provides separate X and Y collision checking to allow smooth sliding along
 * obstacles and clamps movement within the world boundaries.
 */

export class CollisionSystem {
  /**
   * Check if two rectangles overlap
   * @param {{x: number, y: number, width: number, height: number}} r1 
   * @param {{x: number, y: number, width: number, height: number}} r2 
   * @returns {boolean}
   */
  static checkOverlap(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  /**
   * Check if a player box at a specific position collides with any obstacle
   * @param {number} posX - player center X
   * @param {number} posY - player center Y
   * @param {{offsetX: number, offsetY: number, width: number, height: number}} boxDef 
   * @param {Array<{x: number, y: number, width: number, height: number}>} obstacles 
   * @returns {boolean}
   */
  static isColliding(posX, posY, boxDef, obstacles) {
    const playerRect = {
      x: posX + boxDef.offsetX,
      y: posY + boxDef.offsetY,
      width: boxDef.width,
      height: boxDef.height
    };

    for (let i = 0; i < obstacles.length; i++) {
      if (this.checkOverlap(playerRect, obstacles[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if a player box is within world boundaries
   * @param {number} posX 
   * @param {number} posY 
   * @param {{offsetX: number, offsetY: number, width: number, height: number}} boxDef 
   * @param {number} worldWidth 
   * @param {number} worldHeight 
   * @returns {boolean}
   */
  static isInsideWorld(posX, posY, boxDef, worldWidth, worldHeight) {
    const rect = {
      x: posX + boxDef.offsetX,
      y: posY + boxDef.offsetY,
      width: boxDef.width,
      height: boxDef.height
    };

    return (
      rect.x >= 0 &&
      rect.x + rect.width <= worldWidth &&
      rect.y >= 0 &&
      rect.y + rect.height <= worldHeight
    );
  }

  /**
   * Resolve separate X and Y movement with collision and world boundaries
   * @param {number} currentX 
   * @param {number} currentY 
   * @param {number} deltaX 
   * @param {number} deltaY 
   * @param {{offsetX: number, offsetY: number, width: number, height: number}} boxDef 
   * @param {Array<{x: number, y: number, width: number, height: number}>} obstacles 
   * @param {number} worldWidth 
   * @param {number} worldHeight 
   * @returns {{x: number, y: number}}
   */
  static resolveMovement(currentX, currentY, deltaX, deltaY, boxDef, obstacles, worldWidth, worldHeight) {
    let newX = currentX;
    let newY = currentY;

    // 1. Try X movement independently
    if (deltaX !== 0) {
      const candidateX = currentX + deltaX;
      const validWorldX = this.isInsideWorld(candidateX, currentY, boxDef, worldWidth, worldHeight);
      const collidingX = this.isColliding(candidateX, currentY, boxDef, obstacles);

      if (validWorldX && !collidingX) {
        newX = candidateX;
      }
    }

    // 2. Try Y movement independently (allows sliding along walls)
    if (deltaY !== 0) {
      const candidateY = currentY + deltaY;
      const validWorldY = this.isInsideWorld(newX, candidateY, boxDef, worldWidth, worldHeight);
      const collidingY = this.isColliding(newX, candidateY, boxDef, obstacles);

      if (validWorldY && !collidingY) {
        newY = candidateY;
      }
    }

    return { x: newX, y: newY };
  }
}
