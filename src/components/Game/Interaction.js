/**
 * Interaction.js - Proximity detection manager for interactable game objects
 * 
 * Computes distances between the player, narrator, and moving merchant NPCs.
 * Identifies the nearest active interaction target.
 */

import { INTERACTION_DISTANCE } from '../../game/constants';

export class InteractionManager {
  constructor(threshold = INTERACTION_DISTANCE) {
    this.threshold = threshold;
    this.activeTarget = null;
  }

  /**
   * Calculate distance between two coordinate objects
   */
  static getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Evaluate proximity to interactable targets (Narrator + Merchant NPCs)
   * @param {{x: number, y: number}} player 
   * @param {Array<{id: string, name: string, x: number, y: number, type?: string}>} targets 
   * @returns {{target: Object, distance: number} | null}
   */
  update(player, targets = []) {
    let closestTarget = null;
    let minDistance = Infinity;

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i];
      if (!target) continue;

      const dist = InteractionManager.getDistance(player, target);
      if (dist < this.threshold && dist < minDistance) {
        minDistance = dist;
        closestTarget = target;
      }
    }

    this.activeTarget = closestTarget;
    return closestTarget ? { target: closestTarget, distance: minDistance } : null;
  }
}
