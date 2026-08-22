/**
 * StoryManager.js - Authoritative state engine for historical story progression, quests, and rewards
 * 
 * Guarantees strict 1-to-1 synchronization between player location and active chapter.
 * Implements sequential objective execution and specific event-driven task completion.
 */

import storyData from '../../data/story.json';
import insightsData from '../../data/historicalInsights.json';

const LOCATION_CHAPTER_MAP = {
  ujjain: 1,
  bharuch: 2,
  muziris: 3,
  madurai: 4,
  pataliputra: 5
};

export class StoryManager {
  constructor() {
    this.currentChapterNumber = 1;
    this.completedObjectives = new Set();
    this.discoveredInsightIds = new Set();

    // Active Chapter Modals
    this.showChapterIntro = false;
    this.showChapterComplete = false;
    this.showFinalSummary = false;
    this.lastDiscoveredInsight = null;

    this.listeners = new Set();

    this.loadFromStorage();
    this.reconcileDestinationUnlocks();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('vyapar_story_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.currentChapterNumber === 'number') this.currentChapterNumber = parsed.currentChapterNumber;
        if (Array.isArray(parsed.completedObjectives)) this.completedObjectives = new Set(parsed.completedObjectives);
        if (Array.isArray(parsed.discoveredInsightIds)) this.discoveredInsightIds = new Set(parsed.discoveredInsightIds);
      }
    } catch (e) {
      console.warn('[StoryManager] Error loading storage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vyapar_story_state', JSON.stringify({
        currentChapterNumber: this.currentChapterNumber,
        completedObjectives: Array.from(this.completedObjectives),
        discoveredInsightIds: Array.from(this.discoveredInsightIds)
      }));
    } catch (e) {
      console.warn('[StoryManager] Error saving storage:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.saveToStorage();

    if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
      globalThis.globalSaveManager.saveGame();
    }

    const authManager = globalThis.globalAuthManager;
    if (authManager && typeof authManager.saveGameProgress === 'function') {
      authManager.saveGameProgress();
    }
  }

  reset() {
    this.currentChapterNumber = 1;
    this.completedObjectives = new Set();
    this.discoveredInsightIds = new Set();
    this.showChapterIntro = false;
    this.showChapterComplete = false;
    this.showFinalSummary = false;
    this.lastDiscoveredInsight = null;
    this.saveToStorage();
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  /**
   * Get active chapter configuration strictly anchored to currentLocation
   */
  getCurrentChapter() {
    let loc = 'ujjain';
    if (typeof window !== 'undefined' && globalThis.globalProgressManager) {
      loc = globalThis.globalProgressManager.currentLocation || 'ujjain';
    }
    const chapterNum = LOCATION_CHAPTER_MAP[loc.toLowerCase()] || this.currentChapterNumber || 1;
    this.currentChapterNumber = chapterNum;
    return storyData.chapters.find(c => c.number === chapterNum) || storyData.chapters[0];
  }

  /**
   * Check if a specific objective is active (unlocked sequentially)
   */
  isObjectiveActive(objectiveId, chapter = null) {
    const chap = chapter || this.getCurrentChapter();
    const idx = chap.objectives.findIndex(o => o.id === objectiveId);
    if (idx === -1) return false;
    if (idx === 0) return true;
    for (let i = 0; i < idx; i++) {
      if (!this.completedObjectives.has(chap.objectives[i].id)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Complete an objective by ID
   * @param {string} objectiveId 
   */
  completeObjective(objectiveId) {
    if (this.completedObjectives.has(objectiveId)) return;

    this.completedObjectives.add(objectiveId);
    this.checkDestinationUnlock();
    this.checkChapterCompletion();
    this.notify();
  }

  /**
   * Unlock the next destination once this chapter's local prerequisites are done.
   */
  checkDestinationUnlock() {
    const chapter = this.getCurrentChapter();
    if (!chapter.destination || !Array.isArray(chapter.unlockObjectiveIds)) return;

    const isReady = chapter.unlockObjectiveIds.every(id => this.completedObjectives.has(id));
    if (!isReady || typeof window === 'undefined') return;

    import('../progression/ProgressManager').then(({ globalProgressManager }) => {
      if (!globalProgressManager.isUnlocked(chapter.destination)) {
        globalProgressManager.unlockState(chapter.destination);
      }
    }).catch(() => {});
  }

  reconcileDestinationUnlocks() {
    if (typeof window === 'undefined') return;

    const pendingUnlocks = storyData.chapters
      .filter(chapter => chapter.destination && Array.isArray(chapter.unlockObjectiveIds))
      .filter(chapter => chapter.unlockObjectiveIds.every(id => this.completedObjectives.has(id)));

    pendingUnlocks.forEach(chapter => {
      import('../progression/ProgressManager').then(({ globalProgressManager }) => {
        if (!globalProgressManager.isUnlocked(chapter.destination)) {
          globalProgressManager.unlockState(chapter.destination);
        }
      }).catch(() => {});
    });
  }

  /**
   * Event-driven objective completion: only matching action in the CURRENT active chapter is completed.
   * Enforces strict sequential progression (all prior chapter objectives must be completed first).
   * @param {string} actionType 'talk' | 'question' | 'buy' | 'sell' | 'travel'
   * @param {object} payload Contextual parameters for precise matching
   */
  completeObjectiveByAction(actionType, payload = {}) {
    // For travel arrival, check both current and previous chapters
    let targetChapter = this.getCurrentChapter();

    if (actionType === 'travel' && payload.destination) {
      const dest = payload.destination.toLowerCase();
      // Find chapter that has this destination as travel objective
      const travelChap = storyData.chapters.find(c => 
        c.destination === dest || c.objectives.some(o => o.type === 'travel' && (o.target === dest || o.destination === dest))
      );
      if (travelChap) {
        targetChapter = travelChap;
      }
    }

    const matched = targetChapter.objectives.find((o, idx) => {
      if (this.completedObjectives.has(o.id)) return false;

      // Sequential requirement: all prior tasks in this chapter must be completed
      for (let i = 0; i < idx; i++) {
        if (!this.completedObjectives.has(targetChapter.objectives[i].id)) {
          return false;
        }
      }

      if (o.type !== actionType) return false;

      // Location match check if specified on objective
      if (o.location && payload.location && o.location !== payload.location.toLowerCase()) {
        return false;
      }

      switch (actionType) {
        case 'talk': {
          const npcId = payload.npcId ? payload.npcId.toLowerCase() : '';
          const dialogueId = payload.dialogueId ? payload.dialogueId.toLowerCase() : '';
          const target = o.target ? o.target.toLowerCase() : '';
          const objDiagId = o.dialogueId ? o.dialogueId.toLowerCase() : '';

          if (objDiagId && dialogueId && (objDiagId === dialogueId || dialogueId.includes(objDiagId) || objDiagId.includes(dialogueId))) return true;
          if (target && (npcId.includes(target) || target.includes(npcId) || dialogueId.includes(target) || target.includes(dialogueId))) return true;
          return false;
        }

        case 'question': {
          if (o.location && payload.location) {
            return o.location === payload.location.toLowerCase();
          }
          return true;
        }

        case 'buy': {
          const goodId = payload.goodId ? payload.goodId.toLowerCase() : '';
          if (!o.target || o.target === 'goods' || o.target === 'trade') return true;
          if (o.target && o.target.toLowerCase() === goodId) return true;
          if (o.altTarget && o.altTarget.toLowerCase() === goodId) return true;
          return false;
        }

        case 'sell': {
          const goodId = payload.goodId ? payload.goodId.toLowerCase() : '';
          if (!o.target || o.target === 'cargo' || o.target === 'goods' || o.target === 'trade') return true;
          if (o.target && o.target.toLowerCase() === goodId) return true;
          if (o.altTarget && o.altTarget.toLowerCase() === goodId) return true;
          return false;
        }

        case 'travel': {
          const dest = payload.destination ? payload.destination.toLowerCase() : '';
          const target = o.target ? o.target.toLowerCase() : '';
          const destination = o.destination ? o.destination.toLowerCase() : '';
          return target === dest || destination === dest;
        }

        default:
          return false;
      }
    });

    if (matched) {
      this.completeObjective(matched.id);
      return true;
    }
    return false;
  }

  completeObjectiveType(type, extraParam = null) {
    // Legacy compatibility forwarder to completeObjectiveByAction
    if (type === 'talk_elder' || type === 'talk_narrator' || type === 'talk_npc') {
      return this.completeObjectiveByAction('talk', { dialogueId: extraParam });
    }
    if (type === 'answer_question') {
      return this.completeObjectiveByAction('question', { location: extraParam });
    }
    if (type === 'buy_good') {
      return this.completeObjectiveByAction('buy', { goodId: extraParam });
    }
    if (type === 'sell_good' || type === 'complete_trade') {
      return this.completeObjectiveByAction('sell', { goodId: extraParam });
    }
    if (type === 'travel_destination') {
      return this.completeObjectiveByAction('travel', { destination: extraParam });
    }
  }

  /**
   * Sync active chapter with player's actual physical location
   */
  syncWithLocation(locationId) {
    if (!locationId) return;
    const targetChapterNum = LOCATION_CHAPTER_MAP[locationId.toLowerCase()];
    if (targetChapterNum) {
      const prevChap = this.currentChapterNumber;
      this.currentChapterNumber = targetChapterNum;
      if (prevChap !== targetChapterNum) {
        this.showChapterIntro = true;
      }
      this.reconcileDestinationUnlocks();
      this.notify();
    }
  }

  /**
   * Check if all objectives for current chapter are satisfied
   */
  checkChapterCompletion() {
    const chapter = this.getCurrentChapter();
    const allCompleted = chapter.objectives.every(o => this.completedObjectives.has(o.id));

    if (allCompleted && !this.showChapterComplete && !this.showFinalSummary) {
      if (chapter.number >= 5) {
        this.showFinalSummary = true;
      } else {
        this.showChapterComplete = true;
      }
    }
  }

  /**
   * Complete chapter reward sequence
   */
  advanceChapter() {
    const chapter = this.getCurrentChapter();
    const rewards = chapter.rewards || { knowledge: 25, reputation: 10, mudras: 100 };

    if (typeof window !== 'undefined') {
      // Award Knowledge
      import('../../components/Question/QuestionManager').then(({ globalQuestionManager }) => {
        globalQuestionManager.addKnowledge(rewards.knowledge || 25);
      }).catch(() => {});

      // Award Mudras & Reputation
      import('../trading/TradeManager').then(({ globalTradeManager }) => {
        globalTradeManager.addGold(rewards.mudras || 100);
        globalTradeManager.addReputation(rewards.reputation || 10);
      }).catch(() => {});

      // Unlock destination state
      if (chapter.destination) {
        import('../progression/ProgressManager').then(({ globalProgressManager }) => {
          globalProgressManager.unlockState(chapter.destination);
        }).catch(() => {});
      }
    }

    this.showChapterComplete = false;
    this.notify();
  }

  closeIntroModal() {
    this.showChapterIntro = false;
    this.notify();
  }

  closeCompleteModal() {
    this.advanceChapter();
  }

  closeFinalSummaryModal() {
    this.showFinalSummary = false;
    this.notify();
  }

  /**
   * Discover a historical insight and award Knowledge
   * @param {string} insightId 
   */
  discoverInsight(insightId) {
    if (this.discoveredInsightIds.has(insightId)) return;

    const insight = insightsData.find(i => i.id === insightId);
    if (!insight) return;

    this.discoveredInsightIds.add(insightId);
    this.lastDiscoveredInsight = insight;

    // Award +5 Knowledge
    const questionManager = globalThis.globalQuestionManager;
    if (questionManager && typeof questionManager.addKnowledge === 'function') {
      questionManager.addKnowledge(insight.knowledgeReward || 5);
    } else if (questionManager && typeof questionManager.notifyKnowledgeGain === 'function') {
      questionManager.notifyKnowledgeGain(insight.knowledgeReward || 5);
    }

    this.notify();
  }

  /**
   * Trigger discovery of uncollected insight for current location
   * @param {string} locationId 
   */
  discoverLocationInsight(locationId) {
    const available = insightsData.filter(i => i.location === locationId.toLowerCase() && !this.discoveredInsightIds.has(i.id));
    if (available.length > 0) {
      const randIdx = Math.floor(Math.random() * available.length);
      this.discoverInsight(available[randIdx].id);
    }
  }

  getState() {
    const chapter = this.getCurrentChapter();
    const objectivesWithState = chapter.objectives.map((o, idx) => {
      const isCompleted = this.completedObjectives.has(o.id);
      let isUnlocked = true;
      for (let i = 0; i < idx; i++) {
        if (!this.completedObjectives.has(chapter.objectives[i].id)) {
          isUnlocked = false;
          break;
        }
      }
      return {
        ...o,
        isCompleted,
        isActive: !isCompleted && isUnlocked,
        isLocked: !isCompleted && !isUnlocked
      };
    });

    const completedCount = objectivesWithState.filter(o => o.isCompleted).length;
    const isChapterDone = completedCount === chapter.objectives.length;

    // Build discovered insights list
    const discoveredInsights = insightsData.filter(i => this.discoveredInsightIds.has(i.id));

    return {
      currentChapterNumber: this.currentChapterNumber,
      chapter,
      objectives: objectivesWithState,
      completedCount,
      totalObjectives: chapter.objectives.length,
      isChapterDone,
      completedObjectives: Array.from(this.completedObjectives),
      discoveredInsightIds: Array.from(this.discoveredInsightIds),
      discoveredInsights,
      showChapterIntro: this.showChapterIntro,
      showChapterComplete: this.showChapterComplete,
      showFinalSummary: this.showFinalSummary,
      lastDiscoveredInsight: this.lastDiscoveredInsight
    };
  }

  hydrate(data) {
    if (!data) return;

    if (typeof data.current_chapter === 'number') {
      this.currentChapterNumber = Math.max(1, Math.min(5, data.current_chapter));
    }
    if (Array.isArray(data.completed_objectives)) {
      this.completedObjectives = new Set(data.completed_objectives);
    }
    if (Array.isArray(data.discovered_insights)) {
      this.discoveredInsightIds = new Set(data.discovered_insights);
    }

    this.reconcileDestinationUnlocks();
    this.notify();
  }
}

export const globalStoryManager = new StoryManager();
globalThis.globalStoryManager = globalStoryManager;
