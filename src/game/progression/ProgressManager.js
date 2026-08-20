/**
 * ProgressManager.js - State engine for historical journey & location progression
 * 
 * Manages unlocked states, completed questions, visited locations, physical arrival detection,
 * educational notification overlays, and HUD location synchronization with local persistence.
 */

import statesData from '../../data/states.json';
import locationContentData from '../../data/locationContent.json';
import { globalAuthManager } from '../auth/AuthManager';

export class ProgressManager {
  constructor() {
    this.currentLocation = 'ujjain';
    this.unlockedStates = ['ujjain'];
    this.visitedLocations = ['ujjain'];
    this.completedQuestions = [];
    this.activeNotification = null;
    this.listeners = new Set();
    this.hudListeners = new Set();
    this.locationChangeListeners = new Set();

    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('vyapar_progress_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentLocation) this.currentLocation = parsed.currentLocation;
        if (Array.isArray(parsed.unlockedStates)) this.unlockedStates = parsed.unlockedStates;
        if (Array.isArray(parsed.visitedLocations)) this.visitedLocations = parsed.visitedLocations;
        if (Array.isArray(parsed.completedQuestions)) this.completedQuestions = parsed.completedQuestions;
      }
    } catch (e) {
      console.warn('[ProgressManager] Error loading storage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vyapar_progress_state', JSON.stringify({
        currentLocation: this.currentLocation,
        unlockedStates: this.unlockedStates,
        visitedLocations: this.visitedLocations,
        completedQuestions: this.completedQuestions
      }));
    } catch (e) {
      console.warn('[ProgressManager] Error saving storage:', e);
    }
  }

  /**
   * Subscribe to progression state updates
   * @param {Function} listener 
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to HUD location updates
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  onProgressChange(callback) {
    this.hudListeners.add(callback);
    return () => this.hudListeners.delete(callback);
  }

  onLocationChange(callback) {
    this.locationChangeListeners.add(callback);
    return () => this.locationChangeListeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.hudListeners.forEach(fn => fn(state));
    this.locationChangeListeners.forEach(fn => fn(this.currentLocation));
    this.saveToStorage();

    if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
      globalThis.globalSaveManager.saveGame();
    }

    if (globalAuthManager && typeof globalAuthManager.saveGameProgress === 'function') {
      globalAuthManager.saveGameProgress();
    }
  }

  reset() {
    this.currentLocation = 'ujjain';
    this.unlockedStates = ['ujjain'];
    this.visitedLocations = ['ujjain'];
    this.completedQuestions = [];
    this.activeNotification = null;
    this.saveToStorage();
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.hudListeners.forEach(fn => fn(state));
    this.locationChangeListeners.forEach(fn => fn(this.currentLocation));
  }

  /**
   * Snapshot of game progression state
   */
  getState() {
    const stateInfo = statesData.find(s => s.id === this.currentLocation) || {};
    return {
      currentLocation: this.currentLocation,
      locationName: stateInfo.name || 'Ujjain',
      unlockedStates: [...this.unlockedStates],
      visitedLocations: [...this.visitedLocations],
      completedQuestions: [...this.completedQuestions],
      activeNotification: this.activeNotification,
      hasNotification: this.activeNotification !== null
    };
  }

  get hasNotification() {
    return this.activeNotification !== null;
  }

  /**
   * Check if a location state is unlocked
   * @param {string} stateId 
   */
  isUnlocked(stateId) {
    return this.unlockedStates.includes(stateId);
  }

  /**
   * Check if a location has been visited
   * @param {string} stateId 
   */
  isVisited(stateId) {
    return this.visitedLocations.includes(stateId);
  }

  /**
   * Record question completion and trigger progression rules
   * @param {string} questionId 
   */
  completeQuestion(questionId) {
    if (!this.completedQuestions.includes(questionId)) {
      this.completedQuestions.push(questionId);
      this.saveToStorage();
    }
  }

  /**
   * Unlock a new historical state and trigger destination notification
   * @param {string} stateId 
   */
  unlockState(stateId) {
    if (!this.unlockedStates.includes(stateId)) {
      this.unlockedStates.push(stateId);

      const targetState = statesData.find(s => s.id === stateId);
      const targetName = targetState ? targetState.name : stateId;

      this.activeNotification = {
        type: 'unlock',
        title: '🗺️ NEW DESTINATION',
        subtitle: `${targetName} Unlocked`,
        text: `${targetName} is now unlocked on your India Trade Map!`,
        buttonText: 'Continue →'
      };

      this.notify();
    }
  }

  /**
   * Record physical arrival in a new location state
   * @param {string} stateId 
   */
  arriveAtState(stateId) {
    if (!stateId) return;
    const dest = stateId.toLowerCase();
    if (!this.unlockedStates.includes(dest)) {
      this.unlockedStates.push(dest);
    }

    if (this.currentLocation !== dest) {
      this.currentLocation = dest;
      const isFirstVisit = !this.visitedLocations.includes(dest);

      if (isFirstVisit) {
        this.visitedLocations.push(dest);
      }

      const targetState = statesData.find(s => s.id === dest);
      const targetName = targetState ? targetState.name : dest;
      const locContent = locationContentData[dest] || {};

      if (isFirstVisit) {
        this.activeNotification = {
          type: 'arrival',
          title: `🏛️ ARRIVAL — ${targetName.toUpperCase()}`,
          subtitle: `${locContent.type || 'Historical Hub'} • ${locContent.region || 'India'}`,
          text: locContent.intro || `You have reached ${targetName}. New merchants and trade opportunities await.`,
          buttonText: 'Explore City →'
        };
      }

      // Notify story manager of location arrival
      if (typeof window !== 'undefined') {
        import('../story/StoryManager').then(({ globalStoryManager }) => {
          globalStoryManager.completeObjectiveByAction('travel', { destination: dest });
          globalStoryManager.syncWithLocation(dest);
        });
      }

      // Progression Rules: Ujjain -> Bharuch -> Muziris -> Madurai -> Pataliputra
      this.notify();
    }
  }

  /**
   * Close active notification card
   */
  closeNotification() {
    if (this.activeNotification) {
      this.activeNotification = null;
      this.notify();
    }
  }
}

// Global shared instance
export const globalProgressManager = new ProgressManager();
globalThis.globalProgressManager = globalProgressManager;
