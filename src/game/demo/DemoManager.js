/**
 * DemoManager.js - Isolated In-Memory State Engine for SIH Presentation Demo Mode
 * 
 * Manages 5-7 minute guided presentation flow starting at Ujjain with 500 Mudras.
 * Operates purely in-memory—does NOT overwrite or corrupt normal player Supabase save state.
 */

import demoData from '../../data/demoData.json';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { globalTradeManager } from '../../game/trading/TradeManager';
import { globalQuestionManager } from '../../components/Question/QuestionManager';

export class DemoManager {
  constructor() {
    this.isDemoActive = false;
    this.currentStepIndex = 0;
    this.objectives = JSON.parse(JSON.stringify(demoData.demoObjectives));
    this.demoStats = {
      route: 'Ujjain → Bharuch',
      goodsTraded: [],
      initialGold: 500,
      finalGold: 500,
      knowledgeGained: 0,
      eventsEncountered: 0,
      netProfit: 0
    };
    this.isComplete = false;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  getState() {
    return {
      isDemoActive: this.isDemoActive,
      currentStepIndex: this.currentStepIndex,
      objectives: [...this.objectives],
      activeObjective: this.objectives[this.currentStepIndex] || null,
      demoStats: { ...this.demoStats },
      isComplete: this.isComplete
    };
  }

  /**
   * Start SIH Presentation Demo Mode
   */
  startDemo() {
    this.isDemoActive = true;
    this.currentStepIndex = 0;
    this.isComplete = false;
    this.objectives = JSON.parse(JSON.stringify(demoData.demoObjectives));
    
    this.demoStats = {
      route: 'Ujjain → Bharuch',
      goodsTraded: [],
      initialGold: 500,
      finalGold: 500,
      knowledgeGained: 0,
      eventsEncountered: 0,
      netProfit: 0
    };

    // Hydrate local engine Singletons for Demo environment
    globalProgressManager.currentLocation = 'ujjain';
    globalProgressManager.unlockedStates = ['pataliputra', 'ujjain', 'bharuch'];
    globalProgressManager.visitedLocations = ['pataliputra', 'ujjain'];
    globalProgressManager.notify();

    globalTradeManager.gold = 500;
    globalTradeManager.inventory = {
      textile: { quantity: 0, totalCost: 0 },
      pepper: { quantity: 0, totalCost: 0 },
      salt: { quantity: 0, totalCost: 0 },
      gems: { quantity: 0, totalCost: 0 }
    };
    globalTradeManager.tradeHistory = [];
    globalTradeManager.notify();

    globalQuestionManager.knowledgeScore = 10;
    globalQuestionManager.notifyKnowledge();

    this.notify();
  }

  /**
   * Advance or mark objective complete by id
   * @param {string} objectiveId 
   */
  completeObjective(objectiveId) {
    if (!this.isDemoActive) return;

    const obj = this.objectives.find(o => o.id === objectiveId);
    if (obj && !obj.done) {
      obj.done = true;
      
      // Calculate real stats
      const currentGold = globalTradeManager.gold;
      this.demoStats.finalGold = currentGold;
      this.demoStats.netProfit = currentGold - this.demoStats.initialGold;
      
      if (objectiveId === 'sell_textiles') {
        this.isComplete = true;
      }

      this.notify();
    }
  }

  /**
   * Restart Demo Mode to initial state
   */
  restartDemo() {
    this.startDemo();
  }

  /**
   * Exit Demo Mode and return to normal game
   */
  exitDemo() {
    this.isDemoActive = false;
    this.isComplete = false;
    this.notify();
  }
}

export const globalDemoManager = new DemoManager();
