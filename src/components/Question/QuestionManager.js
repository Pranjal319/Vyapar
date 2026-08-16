/**
 * QuestionManager.js - State engine for historical Q&A challenges
 * 
 * Manages question lifecycle states ('idle', 'question', 'result', 'completed'),
 * option selections, answer validation, knowledge & reputation rewards, and UI notifications.
 */

import questionsData from '../../data/questions.json';
import { globalProgressManager } from '../../game/progression/ProgressManager';

export class QuestionManager {
  constructor() {
    this.status = 'idle'; // 'idle' | 'question' | 'result' | 'completed'
    this.currentQuestion = null;
    this.selectedIndex = null;
    this.isCorrect = null;
    this.knowledgeScore = 0;
    this.reputationScore = 0;
    this.locationQuestionIndex = {};
    this.completedQuestionIds = new Set();
    this.listeners = new Set();
    this.knowledgeListeners = new Set();
    this.questionAnsweredListeners = new Set();

    this.loadFromStorage();
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('vyapar_question_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.knowledgeScore === 'number') this.knowledgeScore = parsed.knowledgeScore;
        if (typeof parsed.reputationScore === 'number') this.reputationScore = parsed.reputationScore;
        if (Array.isArray(parsed.completedQuestionIds)) {
          this.completedQuestionIds = new Set(parsed.completedQuestionIds);
        }
      }
    } catch (e) {
      console.warn('[QuestionManager] Error loading storage:', e);
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('vyapar_question_state', JSON.stringify({
        knowledgeScore: this.knowledgeScore,
        reputationScore: this.reputationScore,
        completedQuestionIds: Array.from(this.completedQuestionIds)
      }));
    } catch (e) {
      console.warn('[QuestionManager] Error saving storage:', e);
    }
  }

  /**
   * Subscribe to Question state changes
   * @param {Function} listener 
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to Knowledge reward events
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  onKnowledgeGain(callback) {
    this.knowledgeListeners.add(callback);
    return () => this.knowledgeListeners.delete(callback);
  }

  /**
   * Subscribe to Question Answered events
   * @param {Function} callback 
   * @returns {Function} Unsubscribe function
   */
  onQuestionAnswered(callback) {
    this.questionAnsweredListeners.add(callback);
    return () => this.questionAnsweredListeners.delete(callback);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
    this.saveToStorage();

    if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
      globalThis.globalSaveManager.saveGame();
    }
  }

  reset() {
    this.knowledgeScore = 0;
    this.reputationScore = 0;
    this.completedQuestionIds = new Set();
    this.locationQuestionIndex = {};
    this.currentQuestion = null;
    this.selectedIndex = null;
    this.isCorrect = null;
    this.status = 'idle';
    this.saveToStorage();
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  notifyKnowledgeGain(amount) {
    this.knowledgeScore = (this.knowledgeScore || 0) + amount;
    this.knowledgeListeners.forEach(fn => fn(amount));
    this.saveToStorage();
    if (globalThis.globalSaveManager && typeof globalThis.globalSaveManager.saveGame === 'function') {
      globalThis.globalSaveManager.saveGame();
    }
  }

  addKnowledge(amount = 5) {
    this.notifyKnowledgeGain(amount);
    this.notify();
  }

  addReputation(amount = 2) {
    this.reputationScore = (this.reputationScore || 0) + amount;
    if (typeof window !== 'undefined') {
      import('../../game/trading/TradeManager').then(({ globalTradeManager }) => {
        globalTradeManager.addReputation(amount);
      }).catch(() => {});
    }
    this.saveToStorage();
    this.notify();
  }

  notifyQuestionAnswered(isCorrect) {
    this.questionAnsweredListeners.forEach(fn => fn(isCorrect));
  }

  /**
   * Snapshot of active question state
   */
  getState() {
    return {
      status: this.status,
      isOpen: this.isOpen,
      currentQuestion: this.currentQuestion,
      selectedIndex: this.selectedIndex,
      isCorrect: this.isCorrect,
      knowledgeScore: this.knowledgeScore,
      reputationScore: this.reputationScore
    };
  }

  get isOpen() {
    return this.status === 'question' || this.status === 'result';
  }

  /**
   * Initiate question for a specific regional hub
   * @param {string} locationId e.g. 'ujjain'
   */
  startQuestionForLocation(locationId = 'ujjain') {
    const locKey = locationId.toLowerCase();
    const locQuestions = questionsData.filter(q => (q.location === locKey || q.state === locKey));

    if (locQuestions.length === 0) {
      console.warn(`[QuestionManager] No question found for location: "${locationId}"`);
      return false;
    }

    // Prioritize uncompleted questions for this location
    const uncompleted = locQuestions.filter(q => !this.completedQuestionIds.has(q.id));
    let targetQ = null;

    if (uncompleted.length > 0) {
      targetQ = uncompleted[0];
    } else {
      // Cycle through questions
      const currIdx = this.locationQuestionIndex[locKey] || 0;
      targetQ = locQuestions[currIdx % locQuestions.length];
      this.locationQuestionIndex[locKey] = (currIdx + 1) % locQuestions.length;
    }

    this.currentQuestion = targetQ;
    this.selectedIndex = null;
    this.isCorrect = null;
    this.status = 'question';
    this.notify();
    return true;
  }

  /**
   * Select an option index (0..3)
   * @param {number} index 
   */
  selectOption(index) {
    if (this.status !== 'question') return;
    this.selectedIndex = index;
    this.notify();
  }

  /**
   * Submit selected answer and evaluate result
   */
  submitAnswer() {
    if (this.status !== 'question' || this.selectedIndex === null || !this.currentQuestion) {
      return;
    }

    const isCorrect = (this.selectedIndex === this.currentQuestion.correctAnswer);
    this.isCorrect = isCorrect;
    this.status = 'result';

    const reward = this.currentQuestion.knowledgeReward || 10;

    const qLoc = this.currentQuestion.location || this.currentQuestion.state || 'ujjain';

    if (isCorrect) {
      this.notifyKnowledgeGain(reward);
      this.addReputation(2);
      this.completedQuestionIds.add(this.currentQuestion.id);
      this.saveToStorage();

      if (typeof window !== 'undefined') {
        import('../../game/story/StoryManager').then(({ globalStoryManager }) => {
          globalStoryManager.completeObjectiveByAction('question', {
            location: qLoc,
            questionId: this.currentQuestion.id
          });
        });
        import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
          globalAudioManager.playCorrectAnswer();
        });
      }
    } else {
      // Wrong answers must not block progression - player learns and gets partial/feedback
      if (typeof window !== 'undefined') {
        import('../../game/story/StoryManager').then(({ globalStoryManager }) => {
          globalStoryManager.completeObjectiveByAction('question', {
            location: qLoc,
            questionId: this.currentQuestion.id
          });
        });
        import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
          globalAudioManager.playWrongAnswer();
        });
      }
    }

    this.notifyQuestionAnswered(isCorrect);
    this.notify();
  }

  /**
   * Close question workflow and return to game
   */
  complete() {
    const qId = this.currentQuestion ? this.currentQuestion.id : null;
    this.status = 'completed';
    this.currentQuestion = null;
    this.selectedIndex = null;
    this.isCorrect = null;
    this.notify();

    if (qId) {
      globalProgressManager.completeQuestion(qId);
    }
  }
}

// Shared global instance
export const globalQuestionManager = new QuestionManager();
globalThis.globalQuestionManager = globalQuestionManager;
