/**
 * TradeManager.js - State engine for historical trading system
 * 
 * Manages player gold balance (Mudras), average-cost caravan inventory, carrying capacity (10 units),
 * dynamic regional buying & selling prices, profit/loss accounting, reputation gain, and local persistence.
 */

import goodsData from '../../data/goods.json';
import marketsData from '../../data/markets.json';
import { MarketEngine } from './MarketEngine';
import { globalAuthManager } from '../auth/AuthManager';

export class TradeManager {
  constructor() {
    this.isOpen = false;
    this.merchantName = 'Dev';
    this.merchantTitle = 'Ujjain Trader';
    this.activeTab = 'buy'; // 'buy' | 'sell'
    
    // Initial Values (500 Mudras, 0 Reputation, 10 Cargo capacity)
    this.gold = 500;
    this.reputation = 0;
    this.inventoryCapacity = 10;

    this.inventory = {
      textile: { quantity: 0, totalCost: 0 },
      pepper: { quantity: 0, totalCost: 0 },
      salt: { quantity: 0, totalCost: 0 },
      rice: { quantity: 0, totalCost: 0 },
      spices: { quantity: 0, totalCost: 0 },
      cotton: { quantity: 0, totalCost: 0 },
      pottery: { quantity: 0, totalCost: 0 },
      gems: { quantity: 0, totalCost: 0 }
    };

    // Trade History & Results
    this.tradeHistory = [];
    this.lastTradeResult = null;
    
    // UI Interaction Quantities
    this.selectedBuyQuantities = {
      textile: 1, pepper: 1, salt: 1, rice: 1,
      spices: 1, cotton: 1, pottery: 1, gems: 1
    };
    this.selectedSellQuantities = {
      textile: 1, pepper: 1, salt: 1, rice: 1,
      spices: 1, cotton: 1, pottery: 1, gems: 1
    };

    this.toast = null;
    this.toastTimer = null;

    this.listeners = new Set();
    this.goldListeners = new Set();

    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('vyapar_trade_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.gold === 'number') this.gold = parsed.gold;
        if (typeof parsed.reputation === 'number') this.reputation = parsed.reputation;
        if (parsed.inventory && typeof parsed.inventory === 'object') {
          this.inventory = { ...this.inventory, ...parsed.inventory };
        }
        if (Array.isArray(parsed.tradeHistory)) {
          this.tradeHistory = parsed.tradeHistory;
        }
      }
    } catch (e) {
      console.warn('[TradeManager] Error reading storage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vyapar_trade_state', JSON.stringify({
        gold: this.gold,
        reputation: this.reputation,
        inventory: this.inventory,
        tradeHistory: this.tradeHistory
      }));
    } catch (e) {
      console.warn('[TradeManager] Error saving storage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onGoldChange(callback) {
    this.goldListeners.add(callback);
    return () => this.goldListeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.goldListeners.forEach(fn => fn(this.gold));
    this.saveToStorage();

    if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
      globalThis.globalSaveManager.saveGame();
    }

    if (globalAuthManager && typeof globalAuthManager.saveGameProgress === 'function') {
      globalAuthManager.saveGameProgress();
    }
  }

  reset() {
    this.gold = 150;
    this.reputation = 10;
    this.inventory = {
      textile: { quantity: 0, totalCost: 0 },
      pepper: { quantity: 0, totalCost: 0 },
      salt: { quantity: 0, totalCost: 0 },
      rice: { quantity: 0, totalCost: 0 },
      spices: { quantity: 0, totalCost: 0 },
      cotton: { quantity: 0, totalCost: 0 },
      pottery: { quantity: 0, totalCost: 0 },
      gems: { quantity: 0, totalCost: 0 }
    };
    this.tradeHistory = [];
    this.saveToStorage();
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.goldListeners.forEach(fn => fn(this.gold));
  }

  addReputation(amount = 2) {
    this.reputation += amount;
    this.saveToStorage();
    this.notify();
  }

  addGold(amount = 100) {
    this.gold += amount;
    this.saveToStorage();
    this.notify();
  }

  getState(currentLocationId = 'ujjain') {
    const totalCargo = this.getTotalCargoCount();
    const cargoValue = MarketEngine.calculateCargoValue(this.inventory, currentLocationId);
    
    const processedInventory = {};
    const simpleInventory = {};
    for (const [id, data] of Object.entries(this.inventory)) {
      const qty = data ? data.quantity || 0 : 0;
      const cost = data ? data.totalCost || 0 : 0;
      const avgCost = qty > 0 ? cost / qty : 0;
      processedInventory[id] = { quantity: qty, totalCost: cost, averageCost: Math.round(avgCost * 10) / 10 };
      simpleInventory[id] = qty;
    }

    let successfulTrades = 0;
    let lossTrades = 0;
    let totalProfit = 0;
    this.tradeHistory.forEach(record => {
      if (record.profit > 0) successfulTrades++;
      else if (record.profit < 0) lossTrades++;
      totalProfit += record.profit || 0;
    });

    const marketInfo = marketsData[currentLocationId.toLowerCase()] || marketsData['ujjain'];

    return {
      isOpen: this.isOpen,
      merchantName: this.merchantName,
      merchantTitle: this.merchantTitle,
      activeTab: this.activeTab,
      gold: this.gold,
      reputation: this.reputation,
      cargoValue,
      inventory: processedInventory,
      simpleInventory,
      inventoryCapacity: this.inventoryCapacity,
      totalCargo,
      remainingCapacity: Math.max(0, this.inventoryCapacity - totalCargo),
      selectedBuyQuantities: { ...this.selectedBuyQuantities },
      selectedSellQuantities: { ...this.selectedSellQuantities },
      tradeHistory: [...this.tradeHistory],
      successfulTrades,
      lossTrades,
      totalProfit,
      lastTradeResult: this.lastTradeResult,
      marketNews: marketInfo ? marketInfo.news || '' : '',
      marketTip: marketInfo ? marketInfo.tip || '' : '',
      toast: this.toast
    };
  }

  getQuantity(goodId) {
    return this.inventory[goodId] ? this.inventory[goodId].quantity || 0 : 0;
  }

  getTotalCost(goodId) {
    return this.inventory[goodId] ? this.inventory[goodId].totalCost || 0 : 0;
  }

  getAverageCost(goodId) {
    const qty = this.getQuantity(goodId);
    return qty > 0 ? this.getTotalCost(goodId) / qty : 0;
  }

  getTotalCargoCount() {
    return Object.values(this.inventory).reduce((acc, item) => acc + ((item && item.quantity) || 0), 0);
  }

  openMarket(merchantName = 'Dev', merchantTitle = 'Ujjain Trader', defaultTab = null) {
    this.merchantName = merchantName;
    this.merchantTitle = merchantTitle;
    this.isOpen = true;
    this.toast = null;

    if (defaultTab) {
      this.activeTab = defaultTab;
    } else {
      this.activeTab = 'buy';
    }

    this.notify();
  }

  closeMarket() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.toast = null;
    this.lastTradeResult = null;
    this.notify();
  }

  setActiveTab(tab) {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.notify();
    }
  }

  adjustQuantity(goodId, delta, mode = 'buy') {
    if (mode === 'buy') {
      const current = this.selectedBuyQuantities[goodId] || 1;
      const nextVal = Math.max(1, Math.min(10, current + delta));
      this.selectedBuyQuantities[goodId] = nextVal;
    } else {
      const current = this.selectedSellQuantities[goodId] || 1;
      const maxOwned = Math.max(1, this.getQuantity(goodId));
      const nextVal = Math.max(1, Math.min(maxOwned, current + delta));
      this.selectedSellQuantities[goodId] = nextVal;
    }
    this.notify();
  }

  showToast(text, isError = false) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { text, isError };
    this.notify();

    this.toastTimer = setTimeout(() => {
      this.toast = null;
      this.notify();
    }, 2800);
  }

  buyGood(goodId, currentLocation = 'ujjain') {
    if (!this.isOpen) return;

    const good = goodsData.find(g => g.id === goodId);
    if (!good) return;

    const marketInfo = MarketEngine.getMarketInfo(good, currentLocation);
    const buyPrice = marketInfo.buyPrice;

    const qty = this.selectedBuyQuantities[goodId] || 1;
    const totalCost = buyPrice * qty;
    const totalCargo = this.getTotalCargoCount();

    if (totalCost > this.gold) {
      this.showToast('Not enough Mudras.', true);
      return;
    }

    if (totalCargo + qty > this.inventoryCapacity) {
      this.showToast('Cargo capacity reached.', true);
      return;
    }

    this.gold -= totalCost;
    if (!this.inventory[goodId]) {
      this.inventory[goodId] = { quantity: 0, totalCost: 0 };
    }
    this.inventory[goodId].quantity += qty;
    this.inventory[goodId].totalCost += totalCost;

    this.showToast(`+${qty} ${good.name} (-${totalCost} Mudras)`, false);
    
    if (typeof window !== 'undefined') {
      import('../story/StoryManager').then(({ globalStoryManager }) => {
        globalStoryManager.completeObjectiveByAction('buy', {
          goodId: goodId,
          quantity: qty,
          location: currentLocation
        });
      });
    }

    this.notify();
  }

  sellGood(goodId, currentLocation = 'ujjain') {
    if (!this.isOpen) return;

    const good = goodsData.find(g => g.id === goodId);
    if (!good) return;

    const ownedQty = this.getQuantity(goodId);
    if (ownedQty <= 0) {
      this.showToast(`You do not own any ${good.name} to sell.`, true);
      return;
    }

    const marketInfo = MarketEngine.getMarketInfo(good, currentLocation);
    const sellPrice = marketInfo.sellPrice;

    const qty = Math.min(this.selectedSellQuantities[goodId] || 1, ownedQty);
    const saleRevenue = sellPrice * qty;

    const ownedCost = this.getTotalCost(goodId);
    const avgCostPerUnit = ownedQty > 0 ? ownedCost / ownedQty : 0;
    const costOfSoldUnits = Math.round(avgCostPerUnit * qty);
    const profit = saleRevenue - costOfSoldUnits;

    this.gold += saleRevenue;

    this.inventory[goodId].quantity -= qty;
    this.inventory[goodId].totalCost = Math.max(0, this.inventory[goodId].totalCost - costOfSoldUnits);

    if (this.inventory[goodId].quantity <= 0) {
      this.inventory[goodId].quantity = 0;
      this.inventory[goodId].totalCost = 0;
    }

    this.selectedSellQuantities[goodId] = 1;

    // Award reputation on profitable trade
    if (profit > 0) {
      this.reputation += 2;
    }

    const resultRecord = {
      goodId,
      goodName: good.name,
      goodIcon: good.icon,
      quantity: qty,
      unitSellPrice: sellPrice,
      buyCost: costOfSoldUnits,
      saleRevenue: saleRevenue,
      profit: profit,
      location: currentLocation,
      timestamp: Date.now()
    };

    this.tradeHistory.push(resultRecord);
    this.lastTradeResult = resultRecord;

    const profitMsg = profit >= 0 ? `PROFIT +${profit} MUDRAS` : `${profit} MUDRAS LOSS`;
    this.showToast(`Sold ${qty} × ${good.name} (+${saleRevenue} Mudras • ${profitMsg})`, profit < 0);

    if (typeof window !== 'undefined') {
      import('../story/StoryManager').then(({ globalStoryManager }) => {
        globalStoryManager.completeObjectiveByAction('sell', {
          goodId: goodId,
          quantity: qty,
          location: currentLocation
        });
      });
    }

    this.notify();
  }

  clearTradeResult() {
    if (this.lastTradeResult) {
      this.lastTradeResult = null;
      this.notify();
    }
  }
}

export const globalTradeManager = new TradeManager();
globalThis.globalTradeManager = globalTradeManager;
