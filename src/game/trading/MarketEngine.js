/**
 * MarketEngine.js - Dynamic regional market price calculation engine
 * 
 * Formula: marketPrice = Math.round(basePrice * demandMult * supplyMult * variation)
 * Bounded strictly between 50% (0.5 * basePrice) and 200% (2.0 * basePrice).
 */

import goodsData from '../../data/goods.json';
import marketsData from '../../data/markets.json';

export class MarketEngine {
  /**
   * Calculate dynamic market buy and sell prices for a good in a specific location
   * @param {Object|string} good - Good object or good ID
   * @param {string} locationId 
   * @returns {{ buyPrice: number, sellPrice: number, demandLevel: string, supplyLevel: string, demandFormatted: string, opportunity: string }}
   */
  static getMarketInfo(good, locationId = 'pataliputra') {
    const item = typeof good === 'string' ? goodsData.find(g => g.id === good) : good;
    if (!item) {
      return { buyPrice: 50, sellPrice: 50, demandLevel: 'MEDIUM', demandFormatted: '███ MEDIUM', supplyLevel: 'MEDIUM', opportunity: 'moderate' };
    }

    const locKey = locationId.toLowerCase();
    const market = marketsData[locKey] || marketsData['pataliputra'];
    const goodMarketData = (market.goods && market.goods[item.id]) || { demand: 'medium', demandMult: 1.0, supply: 'medium', supplyMult: 1.0 };

    const base = item.basePrice || 50;
    const demandMult = goodMarketData.demandMult || 1.0;
    const supplyMult = goodMarketData.supplyMult || 1.0;

    // Small deterministic variation based on good and location ID
    const seed = (item.id.length * 7 + locKey.length * 13) % 10;
    const variation = 0.95 + (seed / 100); // 0.95 to 1.04

    // Calculate raw price
    let rawPrice = base * demandMult * supplyMult * variation;

    // Clamp strictly between 50% and 200% of base price
    const minPrice = Math.round(base * 0.5);
    const maxPrice = Math.round(base * 2.0);
    const buyPrice = Math.max(minPrice, Math.min(maxPrice, Math.round(rawPrice)));

    // Selling price: 10% markup over buy price in high-demand markets
    const sellPrice = Math.max(minPrice, Math.min(maxPrice, Math.round(buyPrice * 1.15)));

    const demandFormatted = MarketEngine.formatDemand(goodMarketData.demand);

    return {
      buyPrice,
      sellPrice,
      demandLevel: (goodMarketData.demand || 'medium').toUpperCase(),
      supplyLevel: (goodMarketData.supply || 'medium').toUpperCase(),
      demandFormatted,
      opportunity: MarketEngine.rateOpportunity(item.id, locKey)
    };
  }

  /**
   * Formats demand level into text + visual bar blocks
   * @param {string} demandStr 
   */
  static formatDemand(demandStr = 'medium') {
    switch (demandStr.toLowerCase()) {
      case 'very_high': return '█████ VERY HIGH';
      case 'high':      return '████  HIGH';
      case 'medium':    return '███   MEDIUM';
      case 'low':       return '██    LOW';
      case 'very_low':  return '█     VERY LOW';
      default:          return '███   MEDIUM';
    }
  }

  /**
   * Calculate current cargo value of player inventory based on active location market prices
   * @param {Object} inventory 
   * @param {string} currentLocationId 
   */
  static calculateCargoValue(inventory, currentLocationId = 'pataliputra') {
    if (!inventory) return 0;
    let totalValue = 0;

    for (const [goodId, data] of Object.entries(inventory)) {
      const qty = data ? (data.quantity || 0) : 0;
      if (qty > 0) {
        const info = MarketEngine.getMarketInfo(goodId, currentLocationId);
        totalValue += info.sellPrice * qty;
      }
    }
    return totalValue;
  }

  /**
   * Rate trade opportunity between locations for destination cards
   * @param {string} goodId 
   * @param {string} locationId 
   */
  static rateOpportunity(goodId, locationId) {
    const locKey = locationId.toLowerCase();
    const market = marketsData[locKey];
    if (!market || !market.goods || !market.goods[goodId]) return 'moderate';

    const demand = market.goods[goodId].demand;
    if (demand === 'very_high' || demand === 'high') return 'good';
    if (demand === 'low' || demand === 'very_low') return 'poor';
    return 'moderate';
  }
}
