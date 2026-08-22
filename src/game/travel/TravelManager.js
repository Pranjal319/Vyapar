/**
 * TravelManager.js - State & simulation engine for historical caravan journeys
 * 
 * Manages route execution, travel day progression (Day 1..N), delta-time updates,
 * historical travel events, choices, consequences, travel log history, and local persistence.
 */

import travelEventsData from '../../data/travelEvents.json';
import routesData from '../../data/routes.json';
import { globalQuestionManager } from '../../components/Question/QuestionManager';
import { globalTradeManager } from '../trading/TradeManager';
import { globalProgressManager } from '../progression/ProgressManager';
import { globalStoryManager } from '../story/StoryManager';

export class TravelManager {
  constructor() {
    this.state = 'IDLE'; // 'IDLE' | 'PREPARING' | 'TRAVELLING' | 'EVENT' | 'EVENT_RESULT' | 'ARRIVAL'
    
    this.activeRoute = null;
    this.fromLocation = 'ujjain';
    this.toLocation = 'bharuch';

    this.elapsedMs = 0;
    this.durationMs = 6000;
    this.totalDays = 3;
    this.currentDay = 1;
    this.progressRatio = 0;

    this.worldWidth = 2400;
    this.worldHeight = 900;
    this.playerX = 180;
    this.playerY = 650;
    this.playerSpeed = 260;
    this.destinationX = 2200;
    this.coins = [];
    this.collectedCoinIds = [];
    this.floatingMessages = [];
    this.journeyKey = 'ujjain_bharuch';

    this.travelCost = 10;
    this.riskLevel = 'Medium';

    // Active Journey Event State
    this.hasTriggeredEvent = false;
    this.currentEvent = null;
    this.selectedChoice = null;
    this.lastEventResultText = '';
    this.eventKnowledgeGain = 0;

    // Cumulative Statistics & History Log
    this.travelLog = [];
    this.totalJourneys = 0;
    this.eventsEncountered = 0;
    this.totalGoldSpent = 0;
    this.totalKnowledgeGained = 0;

    this.onProgressCallbacks = [];
    this.onCompleteCallbacks = [];
    this.onEventCallbacks = [];

    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('vyapar_travel_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fromLocation) this.fromLocation = parsed.fromLocation;
        if (parsed.toLocation) this.toLocation = parsed.toLocation;
        if (typeof parsed.totalJourneys === 'number') this.totalJourneys = parsed.totalJourneys;
        if (typeof parsed.eventsEncountered === 'number') this.eventsEncountered = parsed.eventsEncountered;
        if (Array.isArray(parsed.travelLog)) this.travelLog = parsed.travelLog;
        if (Array.isArray(parsed.collectedCoinIds)) this.collectedCoinIds = parsed.collectedCoinIds;
        if (parsed.journeyKey) this.journeyKey = parsed.journeyKey;
      }
    } catch (e) {
      console.warn('[TravelManager] Error reading storage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vyapar_travel_state', JSON.stringify({
        fromLocation: this.fromLocation,
        toLocation: this.toLocation,
        totalJourneys: this.totalJourneys,
        eventsEncountered: this.eventsEncountered,
        travelLog: this.travelLog.slice(-15),
        collectedCoinIds: this.collectedCoinIds,
        journeyKey: this.journeyKey
      }));

      if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
        globalThis.globalSaveManager.saveGame();
      }
    } catch (e) {
      console.warn('[TravelManager] Error saving storage:', e);
    }
  }

  reset() {
    this.isTravelling = false;
    this.progress = 0;
    this.travelLog = [];
    this.totalJourneys = 0;
    this.eventsEncountered = 0;
    this.totalGoldSpent = 0;
    this.totalKnowledgeGained = 0;
    this.collectedCoinIds = [];
    this.journeyKey = null;
    this.activeEvent = null;
    this.saveToStorage();
  }

  onProgress(cb) {
    this.onProgressCallbacks.push(cb);
    return () => {
      this.onProgressCallbacks = this.onProgressCallbacks.filter(c => c !== cb);
    };
  }

  onComplete(cb) {
    this.onCompleteCallbacks.push(cb);
    return () => {
      this.onCompleteCallbacks = this.onCompleteCallbacks.filter(c => c !== cb);
    };
  }

  onEvent(cb) {
    this.onEventCallbacks.push(cb);
    return () => {
      this.onEventCallbacks = this.onEventCallbacks.filter(c => c !== cb);
    };
  }

  notifyProgress() {
    const state = this.getState();
    this.onProgressCallbacks.forEach(callback => callback(state));
  }

  notifyComplete() {
    const state = this.getState();
    this.onCompleteCallbacks.forEach(callback => callback(state));
    this.notifyProgress();
  }

  notifyEvent(event) {
    this.onEventCallbacks.forEach(callback => callback(event));
  }

  get isTravelling() {
    return this.state === 'TRAVELLING';
  }

  /**
   * Find matching route from dataset or create a default route
   */
  getRoute(fromLoc, toLoc, preferredType = null) {
    const from = (fromLoc || 'ujjain').toLowerCase();
    const to = (toLoc || 'bharuch').toLowerCase();

    let found = routesData.filter(r => 
      (r.from === from && r.to === to) || (r.from === to && r.to === from)
    );

    if (preferredType) {
      const typeMatch = found.find(r => r.type === preferredType);
      if (typeMatch) return typeMatch;
    }

    if (found.length > 0) return found[0];

    // Fallback generated route
    return {
      id: `${from}_${to}_overland`,
      name: `${from.toUpperCase()} to ${to.toUpperCase()} Caravan Highway`,
      from: from,
      to: to,
      type: 'overland',
      icon: '🐂',
      distance: 'Medium',
      travelDays: 3,
      days: 3,
      risk: 'Medium',
      transport: 'Caravan / Ox Cart',
      expectedConditions: 'Dry plains & trade road',
      travelDuration: 5500,
      description: `Historical trade connection between ${from} and ${to}.`
    };
  }

  /**
   * Open Travel Preparation modal for target location
   */
  prepareTravel(routeOrDest, fromLoc = null, toLoc = null) {
    let route = null;
    let from = fromLoc || globalProgressManager.currentLocation || 'ujjain';
    let to = toLoc;

    if (typeof routeOrDest === 'string') {
      to = routeOrDest;
      route = this.getRoute(from, to);
    } else if (routeOrDest && typeof routeOrDest === 'object') {
      route = routeOrDest;
      from = route.from || from;
      to = route.to || to;
    }

    if (!route) route = this.getRoute(from, to);

    if (!globalProgressManager.isUnlocked(to)) {
      return false;
    }

    this.state = 'PREPARING';
    this.activeRoute = route;
    this.fromLocation = from;
    this.toLocation = to;
    const nextJourneyKey = `${from}_${to}`;
    if (this.journeyKey !== nextJourneyKey) this.collectedCoinIds = [];
    this.journeyKey = nextJourneyKey;
    this.playerX = 180;
    this.playerY = 650;
    this.progressRatio = 0;
    this.currentDay = 1;
    this.floatingMessages = [];
    this.coins = this.createCoins();
    this.durationMs = route.travelDuration || 5500;
    this.totalDays = route.travelDays || route.days || 3;
    this.travelCost = route.type === 'sea' ? 25 : (route.type === 'river' ? 15 : 10);
    this.riskLevel = route.risk || 'Medium';

    this.notifyProgress();
    return true;
  }

  /**
   * Start caravan journey after confirming preparation
   */
  /**
   * Start caravan journey after confirming preparation
   */
  confirmStartTravel() {
    if (!this.activeRoute) {
      const from = this.fromLocation || globalProgressManager.currentLocation || 'ujjain';
      const to = this.toLocation || 'bharuch';
      this.activeRoute = this.getRoute(from, to);
    }

    // Deduct travel cost
    if (globalTradeManager.gold >= this.travelCost) {
      globalTradeManager.gold -= this.travelCost;
      this.totalGoldSpent += this.travelCost;
    }

    this.state = 'TRAVELLING';
    this.playerX = 180;
    this.playerY = 650;
    this.elapsedMs = 0;
    this.currentDay = 1;
    this.progressRatio = 0;
    this.hasTriggeredEvent = false;
    this.currentEvent = null;
    this.selectedChoice = null;
    this.eventKnowledgeGain = 0;
    this.lastEventResultText = '';
    this.coins = this.createCoins();

    this.totalJourneys++;
    this.travelLog.push({
      day: 1,
      text: `Departed from ${this.fromLocation.toUpperCase()} along ${this.activeRoute.name}.`
    });

    this.saveToStorage();
    this.notifyProgress();
  }

  cancelPreparation() {
    this.reset();
  }

  /**
   * Update journey progress with delta-time (pauses simulation during EVENT)
   */
  update(dtSeconds = 0) {
    if (this.state !== 'TRAVELLING') return;

    this.elapsedMs += dtSeconds * 1000;
    this.progressRatio = Math.min(1.0, Math.max(0, (this.playerX - 180) / (this.destinationX - 180)));
    this.currentDay = Math.min(this.totalDays, Math.floor(this.progressRatio * this.totalDays) + 1);
    this.floatingMessages = this.floatingMessages.filter(message => Date.now() - message.createdAt < 1400);

    // Trigger random historical event between 45% and 65% of the route
    if (!this.hasTriggeredEvent && this.progressRatio >= 0.45 && this.progressRatio <= 0.65) {
      this.triggerRandomEvent();
      return;
    }

    if (this.playerX >= this.destinationX) {
      this.playerX = this.destinationX;
      this.progressRatio = 1.0;
      this.currentDay = this.totalDays;
      this.state = 'ARRIVAL';
      this.travelLog.push({
        day: this.totalDays,
        text: `Successfully reached destination ${(this.toLocation || 'bharuch').toUpperCase()}.`
      });
      this.saveToStorage();
      this.notifyComplete();
      return;
    }

    this.notifyProgress();
  }

  createCoins() {
    const coinYPositions = [610, 690, 635, 715, 600, 675, 625, 705, 650, 620, 690, 640];
    return coinYPositions.map((y, index) => ({
      id: `${this.journeyKey}_coin_${index + 1}`,
      x: 330 + index * 150,
      y,
      value: index % 3 === 0 ? 20 : 10
    }));
  }

  movePlayer(directionX, directionY, dtSeconds) {
    if (this.state !== 'TRAVELLING') return;

    this.playerX = Math.max(180, Math.min(this.destinationX, this.playerX + directionX * this.playerSpeed * dtSeconds));
    this.playerY = Math.max(560, Math.min(735, this.playerY + directionY * this.playerSpeed * dtSeconds));

    this.collectNearbyCoins();
    this.update(dtSeconds);
  }

  collectNearbyCoins() {
    let collectedAny = false;
    this.coins.forEach(coin => {
      if (this.collectedCoinIds.includes(coin.id)) return;
      const distance = Math.hypot(this.playerX - coin.x, this.playerY - coin.y);
      if (distance > 65) return;

      this.collectedCoinIds.push(coin.id);
      globalTradeManager.addGold(coin.value);
      this.floatingMessages.push({
        id: `${coin.id}_${Date.now()}`,
        text: `+${coin.value} Mudras`,
        x: coin.x,
        y: coin.y - 30,
        createdAt: Date.now()
      });
      collectedAny = true;
    });

    if (collectedAny) {
      this.saveToStorage();
      this.notifyProgress();
    }
  }

  triggerRandomEvent() {
    this.hasTriggeredEvent = true;
    this.eventsEncountered++;

    const randIdx = Math.floor(Math.random() * travelEventsData.length);
    this.currentEvent = travelEventsData[randIdx] || travelEventsData[0];
    this.state = 'EVENT';

    this.notifyEvent(this.currentEvent);
    this.notifyProgress();
  }

  /**
   * Evaluate choice made by player during event
   */
  makeEventChoice(choice) {
    if (!this.currentEvent || !choice) return;

    this.selectedChoice = choice;
    const effects = choice.effects || {};

    // 1. Travel Delay
    if (effects.travelDelay && effects.travelDelay > 0) {
      this.totalDays += effects.travelDelay;
      this.durationMs += effects.travelDelay * 1500;
    }

    // 2. Gold Cost / Reward
    if (effects.gold && effects.gold !== 0) {
      if (effects.gold < 0) {
        const cost = Math.abs(effects.gold);
        globalTradeManager.gold = Math.max(0, globalTradeManager.gold - cost);
        this.totalGoldSpent += cost;
      } else {
        globalTradeManager.gold += effects.gold;
      }
    }

    // 3. Knowledge Award
    if (effects.knowledge && effects.knowledge > 0) {
      globalQuestionManager.addKnowledge(effects.knowledge);
      this.eventKnowledgeGain += effects.knowledge;
      this.totalKnowledgeGained += effects.knowledge;
    }

    // 4. Reputation Award
    if (effects.reputation && effects.reputation > 0) {
      globalTradeManager.addReputation(effects.reputation);
    }

    // 5. Special Trailside Good Purchase (e.g. Salt)
    if (effects.addGood) {
      if (!globalTradeManager.inventory[effects.addGood]) {
        globalTradeManager.inventory[effects.addGood] = { quantity: 0, totalCost: 0 };
      }
      globalTradeManager.inventory[effects.addGood].quantity += 1;
      globalTradeManager.inventory[effects.addGood].totalCost += Math.abs(effects.gold || 15);
    }

    // Record entry to travel log
    this.travelLog.push({
      day: this.currentDay,
      text: `Day ${this.currentDay}: ${choice.resultText}`
    });

    this.lastEventResultText = choice.resultText || 'You continued along your journey.';
    this.state = 'EVENT_RESULT';
    this.saveToStorage();
    this.notifyProgress();
  }

  resumeJourney() {
    this.state = 'TRAVELLING';
    this.currentEvent = null;
    this.selectedChoice = null;
    this.notifyProgress();
  }

  completeArrival() {
    const dest = (this.toLocation || 'bharuch').toLowerCase();
    const from = (this.fromLocation || 'ujjain').toLowerCase();
    this.reset();
    globalProgressManager.arriveAtState(dest);
    globalStoryManager.completeObjectiveByAction('travel', { destination: dest, fromLocation: from });
  }

  getState() {
    const totalCargo = globalTradeManager.getTotalCargoCount();
    const mudras = globalTradeManager.gold;

    return {
      state: this.state,
      isTravelling: this.state === 'TRAVELLING',
      activeRoute: this.activeRoute,
      fromLocation: this.fromLocation,
      toLocation: this.toLocation,
      elapsedMs: this.elapsedMs,
      durationMs: this.durationMs,
      progressRatio: this.progressRatio,
      percentage: Math.floor(this.progressRatio * 100),
      currentDay: this.currentDay,
      totalDays: this.totalDays,
      travelCost: this.travelCost,
      riskLevel: this.riskLevel,
      totalCargo,
      cargoCapacity: globalTradeManager.inventoryCapacity || 10,
      mudras,
      currentEvent: this.currentEvent,
      selectedChoice: this.selectedChoice,
      lastEventResultText: this.lastEventResultText,
      eventKnowledgeGain: this.eventKnowledgeGain,
      travelLog: [...this.travelLog],
      totalJourneys: this.totalJourneys,
      eventsEncountered: this.eventsEncountered,
      totalGoldSpent: this.totalGoldSpent,
      totalKnowledgeGained: this.totalKnowledgeGained,
      hasArrived: this.state === 'ARRIVAL',
      playerX: this.playerX,
      playerY: this.playerY,
      worldWidth: this.worldWidth,
      worldHeight: this.worldHeight,
      destinationX: this.destinationX,
      coins: this.coins.filter(coin => !this.collectedCoinIds.includes(coin.id)),
      totalCoins: this.coins.length,
      collectedCoins: this.collectedCoinIds.filter(id => id.startsWith(`${this.journeyKey}_coin_`)).length,
      floatingMessages: [...this.floatingMessages]
    };
  }

  reset() {
    this.state = 'IDLE';
    this.activeRoute = null;
    this.elapsedMs = 0;
    this.progressRatio = 0;
    this.hasTriggeredEvent = false;
    this.currentEvent = null;
    this.selectedChoice = null;
    this.lastEventResultText = '';
    this.eventKnowledgeGain = 0;
    this.notifyProgress();
  }
}

export const globalTravelManager = new TravelManager();
if (typeof window !== 'undefined') {
  window.globalTravelManager = globalTravelManager;
}
if (typeof globalThis !== 'undefined') {
  globalThis.globalTravelManager = globalTravelManager;
}
