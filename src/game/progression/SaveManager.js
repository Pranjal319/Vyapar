/**
 * SaveManager.js - Centralized save, resume, and completion lifecycle manager for Vyapar
 * 
 * Manages player-specific save snapshots (vyapar_player_<playerId>), multi-browser/player isolation,
 * continuous auto-saving, resume restoration, and clean deletion upon game completion.
 */

import { globalProgressManager } from './ProgressManager';
import { globalTradeManager } from '../trading/TradeManager';
import { globalStoryManager } from '../story/StoryManager';
import { globalQuestionManager } from '../../components/Question/QuestionManager';
import { globalTravelManager } from '../travel/TravelManager';
import { getPlayerNickname, setPlayerNickname, clearPlayerNickname, getPlayerCharacter, setPlayerCharacter, clearPlayerCharacter } from '../player/PlayerIdentity';

export const SAVE_KEY = 'vyapar_game_save';
export const ACTIVE_PLAYER_KEY = 'vyapar_active_player_id';

export class SaveManager {
  constructor() {
    this.listeners = new Set();
    this.hasCompletedSession = false;
    this.currentPlayerId = this.readActivePlayerId();

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.loadGame();
      }, 0);
    }
  }

  readActivePlayerId() {
    if (typeof window === 'undefined') return 'p_default';
    let id = localStorage.getItem(ACTIVE_PLAYER_KEY);
    if (!id) {
      id = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem(ACTIVE_PLAYER_KEY, id);
    }
    return id;
  }

  getPlayerSaveKey(playerId = null) {
    const id = playerId || this.currentPlayerId || 'p_default';
    return `vyapar_player_${id}`;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this.getSaveStatus()));
  }

  getSaveStatus() {
    return {
      hasUnfinishedSave: this.hasUnfinishedSave(),
      saveData: this.getRawSave()
    };
  }

  getRawSave() {
    if (typeof window === 'undefined') return null;
    try {
      // 1. Try active player specific save key
      const playerKey = this.getPlayerSaveKey();
      const playerRaw = localStorage.getItem(playerKey);
      if (playerRaw) return JSON.parse(playerRaw);

      // 2. Try global primary save key
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);

      // 3. Graceful legacy storage migration fallback
      const pRaw = localStorage.getItem('vyapar_progress_state');
      const tRaw = localStorage.getItem('vyapar_trade_state');
      if (pRaw || tRaw) {
        const pParsed = pRaw ? JSON.parse(pRaw) : null;
        const tParsed = tRaw ? JSON.parse(tRaw) : null;
        const sRaw = localStorage.getItem('vyapar_story_state');
        const sParsed = sRaw ? JSON.parse(sRaw) : null;
        const qRaw = localStorage.getItem('vyapar_question_state');
        const qParsed = qRaw ? JSON.parse(qRaw) : null;

        const migrated = {
          version: 1,
          savedAt: Date.now(),
          playerId: this.currentPlayerId,
          gameCompleted: false,
          nickname: getPlayerNickname() || '',
          progress: pParsed || {
            currentLocation: 'ujjain',
            unlockedStates: ['ujjain'],
            visitedLocations: ['ujjain'],
            completedQuestions: []
          },
          trade: tParsed || {
            gold: 150,
            reputation: 10,
            inventory: {},
            tradeHistory: []
          },
          story: sParsed || {
            currentChapterNumber: 1,
            completedObjectives: [],
            discoveredInsightIds: []
          },
          question: qParsed || {
            knowledgeScore: 0,
            reputationScore: 0,
            completedQuestionIds: []
          },
          travel: {
            fromLocation: 'ujjain',
            toLocation: 'bharuch',
            totalJourneys: 0,
            eventsEncountered: 0,
            travelLog: [],
            collectedCoinIds: [],
            journeyKey: null
          }
        };
        localStorage.setItem(playerKey, JSON.stringify(migrated));
        localStorage.setItem(SAVE_KEY, JSON.stringify(migrated));
        return migrated;
      }

      return null;
    } catch (e) {
      console.warn('[SaveManager] Error reading raw save:', e);
      return null;
    }
  }

  /**
   * Returns true if there is an active, unfinished save that can be continued.
   */
  hasUnfinishedSave() {
    const data = this.getRawSave();
    if (!data) return false;
    if (data.gameCompleted) return false;

    // Check if player actually has progress beyond untouched initial state
    const p = data.progress;
    const t = data.trade;
    const s = data.story;

    const hasLocationProgress = p && (p.currentLocation !== 'ujjain' || (p.unlockedStates && p.unlockedStates.length > 1) || (p.visitedLocations && p.visitedLocations.length > 1));
    const hasStoryProgress = s && (s.currentChapterNumber > 1 || (s.completedObjectives && s.completedObjectives.length > 0));
    const hasTradeProgress = t && (t.gold !== 150 || (t.tradeHistory && t.tradeHistory.length > 0));
    const hasQuestionProgress = data.question && (data.question.completedQuestionIds && data.question.completedQuestionIds.length > 0);

    return Boolean(hasLocationProgress || hasStoryProgress || hasTradeProgress || hasQuestionProgress || data.nickname);
  }

  /**
   * Save complete game state atomically to player-specific storage.
   */
  saveGame() {
    if (typeof window === 'undefined') return;
    try {
      const pState = globalProgressManager.getState();
      const tState = globalTradeManager.getState();
      const sState = globalStoryManager.getState();
      const qState = globalQuestionManager.getState();
      const travelManager = globalThis.globalTravelManager || globalTravelManager;

      const isCompleted = sState.currentChapterNumber >= 5 && sState.isChapterCompleted && !sState.showChapterIntro;

      const savePayload = {
        version: 1,
        savedAt: Date.now(),
        playerId: this.currentPlayerId,
        gameCompleted: isCompleted || this.hasCompletedSession,
        nickname: getPlayerNickname() || '',
        selectedCharacter: getPlayerCharacter() || 'merchant_male',
        
        progress: {
          currentLocation: pState.currentLocation || 'ujjain',
          unlockedStates: pState.unlockedStates || ['ujjain'],
          visitedLocations: pState.visitedLocations || ['ujjain'],
          completedQuestions: pState.completedQuestions || []
        },

        trade: {
          gold: typeof tState.gold === 'number' ? tState.gold : 150,
          reputation: typeof tState.reputation === 'number' ? tState.reputation : 10,
          inventory: globalTradeManager.inventory || {},
          tradeHistory: tState.tradeHistory || []
        },

        story: {
          currentChapterNumber: sState.currentChapterNumber || 1,
          completedObjectives: Array.from(globalStoryManager.completedObjectives || []),
          discoveredInsightIds: Array.from(globalStoryManager.discoveredInsightIds || [])
        },

        question: {
          knowledgeScore: qState.knowledgeScore || 0,
          reputationScore: qState.reputationScore || 0,
          completedQuestionIds: Array.from(globalQuestionManager.completedQuestionIds || [])
        },

        travel: {
          fromLocation: travelManager?.fromLocation || 'ujjain',
          toLocation: travelManager?.toLocation || 'bharuch',
          totalJourneys: travelManager?.totalJourneys || 0,
          eventsEncountered: travelManager?.eventsEncountered || 0,
          travelLog: travelManager?.travelLog || [],
          collectedCoinIds: travelManager?.collectedCoinIds || [],
          journeyKey: travelManager?.journeyKey || null
        }
      };

      const playerKey = this.getPlayerSaveKey();
      localStorage.setItem(playerKey, JSON.stringify(savePayload));
      localStorage.setItem(SAVE_KEY, JSON.stringify(savePayload));
      this.notify();
    } catch (e) {
      console.warn('[SaveManager] Error saving game:', e);
    }
  }

  /**
   * Load and hydrate all managers from saved game data.
   */
  loadGame() {
    const data = this.getRawSave();
    if (!data) return false;

    try {
      if (data.playerId) {
        this.currentPlayerId = data.playerId;
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_PLAYER_KEY, data.playerId);
        }
      }

      if (data.nickname) {
        setPlayerNickname(data.nickname);
      }

      if (data.selectedCharacter) {
        setPlayerCharacter(data.selectedCharacter);
      }

      // ProgressManager
      if (data.progress) {
        if (data.progress.currentLocation) globalProgressManager.currentLocation = data.progress.currentLocation;
        if (Array.isArray(data.progress.unlockedStates)) globalProgressManager.unlockedStates = [...data.progress.unlockedStates];
        if (Array.isArray(data.progress.visitedLocations)) globalProgressManager.visitedLocations = [...data.progress.visitedLocations];
        if (Array.isArray(data.progress.completedQuestions)) globalProgressManager.completedQuestions = [...data.progress.completedQuestions];
      }

      // TradeManager
      if (data.trade) {
        if (typeof data.trade.gold === 'number') globalTradeManager.gold = data.trade.gold;
        if (typeof data.trade.reputation === 'number') globalTradeManager.reputation = data.trade.reputation;
        if (data.trade.inventory && typeof data.trade.inventory === 'object') {
          globalTradeManager.inventory = { ...globalTradeManager.inventory, ...data.trade.inventory };
        }
        if (Array.isArray(data.trade.tradeHistory)) {
          globalTradeManager.tradeHistory = [...data.trade.tradeHistory];
        }
      }

      // StoryManager
      if (data.story) {
        if (typeof data.story.currentChapterNumber === 'number') {
          globalStoryManager.currentChapterNumber = data.story.currentChapterNumber;
        }
        if (Array.isArray(data.story.completedObjectives)) {
          globalStoryManager.completedObjectives = new Set(data.story.completedObjectives);
        }
        if (Array.isArray(data.story.discoveredInsightIds)) {
          globalStoryManager.discoveredInsightIds = new Set(data.story.discoveredInsightIds);
        }
      }

      // QuestionManager
      if (data.question) {
        if (typeof data.question.knowledgeScore === 'number') {
          globalQuestionManager.knowledgeScore = data.question.knowledgeScore;
        }
        if (typeof data.question.reputationScore === 'number') {
          globalQuestionManager.reputationScore = data.question.reputationScore;
        }
        if (Array.isArray(data.question.completedQuestionIds)) {
          globalQuestionManager.completedQuestionIds = new Set(data.question.completedQuestionIds);
        }
      }

      // TravelManager
      const travelManager = globalThis.globalTravelManager || globalTravelManager;
      if (data.travel && travelManager) {
        if (data.travel.fromLocation) travelManager.fromLocation = data.travel.fromLocation;
        if (data.travel.toLocation) travelManager.toLocation = data.travel.toLocation;
        if (typeof data.travel.totalJourneys === 'number') travelManager.totalJourneys = data.travel.totalJourneys;
        if (typeof data.travel.eventsEncountered === 'number') travelManager.eventsEncountered = data.travel.eventsEncountered;
        if (Array.isArray(data.travel.travelLog)) travelManager.travelLog = [...data.travel.travelLog];
        if (Array.isArray(data.travel.collectedCoinIds)) travelManager.collectedCoinIds = [...data.travel.collectedCoinIds];
        if (data.travel.journeyKey) travelManager.journeyKey = data.travel.journeyKey;
      }

      // Sync story and location
      if (globalProgressManager.currentLocation) {
        globalStoryManager.syncWithLocation(globalProgressManager.currentLocation);
      }
      globalStoryManager.reconcileDestinationUnlocks();

      // Trigger UI updates
      globalProgressManager.notify();
      globalTradeManager.notify();
      globalStoryManager.notify();
      globalQuestionManager.notify();

      return true;
    } catch (e) {
      console.warn('[SaveManager] Error hydrating game state:', e);
      return false;
    }
  }

  /**
   * Start a brand-new game journey from scratch for this player/session.
   */
  startNewGame(nickname = null, characterId = null) {
    // Generate fresh player ID for this new journey
    this.currentPlayerId = 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_PLAYER_KEY, this.currentPlayerId);
    }

    if (nickname) {
      setPlayerNickname(nickname);
    }
    if (characterId) {
      setPlayerCharacter(characterId);
    }

    this.hasCompletedSession = false;

    // Reset all subsystem managers to clean initial states
    globalProgressManager.reset();
    globalTradeManager.reset();
    globalStoryManager.reset();
    globalQuestionManager.reset();
    
    const travelManager = globalThis.globalTravelManager || globalTravelManager;
    if (travelManager && typeof travelManager.reset === 'function') {
      travelManager.reset();
    }

    // Save clean fresh state
    this.saveGame();
  }

  /**
   * Clean up and permanently remove player's save data upon game completion or reset.
   */
  clearCompletedGame() {
    if (typeof window === 'undefined') return;
    try {
      this.hasCompletedSession = true;
      const playerKey = this.getPlayerSaveKey();
      
      clearPlayerNickname();
      clearPlayerCharacter();
      localStorage.removeItem(playerKey);
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(ACTIVE_PLAYER_KEY);
      localStorage.removeItem('vyapar_progress_state');
      localStorage.removeItem('vyapar_trade_state');
      localStorage.removeItem('vyapar_story_state');
      localStorage.removeItem('vyapar_question_state');
      localStorage.removeItem('vyapar_travel_state');
      
      // Reset subsystem managers to pristine state
      globalProgressManager.reset();
      globalTradeManager.reset();
      globalStoryManager.reset();
      globalQuestionManager.reset();

      const travelManager = globalThis.globalTravelManager || globalTravelManager;
      if (travelManager && typeof travelManager.reset === 'function') {
        travelManager.reset();
      }

      this.notify();
    } catch (e) {
      console.warn('[SaveManager] Error clearing completed game:', e);
    }
  }
}

export const globalSaveManager = new SaveManager();
globalThis.globalSaveManager = globalSaveManager;
