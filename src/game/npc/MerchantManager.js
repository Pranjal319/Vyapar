/**
 * MerchantManager.js - Orchestrates multiple moving Merchant NPCs
 * 
 * Manages instantiation, delta-time updates, world boundary safety,
 * and rendering of all active merchant NPCs in the world.
 */

import { Merchant } from '../../components/Game/Merchant';

export class MerchantManager {
  constructor(customData = null) {
    const dataList = customData || [];
    this.merchants = dataList.map(data => new Merchant(data));
  }

  /**
   * Update all merchant NPC movements and states
   * @param {number} dt - delta time in seconds
   */
  update(dt) {
    this.merchants.forEach(m => m.update(dt));
  }

  /**
   * Render all merchant NPCs
   * @param {CanvasRenderingContext2D} ctx 
   * @param {number} time 
   * @param {string | null} activeNearMerchantId 
   */
  draw(ctx, time = 0, activeNearMerchantId = null) {
    this.merchants.forEach(m => {
      const isNear = activeNearMerchantId === m.id;
      m.draw(ctx, time, isNear);
    });
  }

  /**
   * Return array of merchants for interaction/proximity checks
   */
  getMerchants() {
    return this.merchants;
  }

  /**
   * Load and initialize merchants for a new city
   */
  loadMerchants(customData) {
    const dataList = customData || [];
    this.merchants = dataList.map(data => new Merchant(data));
  }
}
