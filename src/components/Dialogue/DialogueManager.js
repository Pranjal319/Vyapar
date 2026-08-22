/**
 * DialogueManager.js - State engine for dialogue sequences
 * 
 * Manages active dialogue sequences, line progression, opening/closing state,
 * and listener subscriptions for decoupled React UI rendering.
 */

import dialoguesData from '../../data/dialogues.json';
import { globalQuestionManager } from '../Question/QuestionManager';
import { getPlayerNickname } from '../../game/player/PlayerIdentity';

export class DialogueManager {
  constructor() {
    this.isOpen = false;
    this.currentSequenceId = null;
    this.currentSequence = [];
    this.currentIndex = 0;
    this.listeners = new Set();
  }

  /**
   * Subscribe to dialogue state changes
   * @param {Function} listener 
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  /**
   * Get immutable snapshot of current dialogue state
   */
  getState() {
    const currentLine = this.getCurrentLine();
    return {
      isOpen: this.isOpen,
      sequenceId: this.currentSequenceId,
      currentIndex: this.currentIndex,
      totalLines: this.currentSequence.length,
      currentLine,
      isLastLine: this.currentIndex >= this.currentSequence.length - 1
    };
  }

  /**
   * Start a specified dialogue sequence by key ID
   * @param {string} sequenceId 
   */
  startSequence(sequenceId) {
    const sequence = dialoguesData[sequenceId];
    if (!sequence || sequence.length === 0) {
      console.warn(`[DialogueManager] Sequence not found: "${sequenceId}"`);
      return false;
    }

    this.currentSequenceId = sequenceId;
    this.currentSequence = sequence;
    this.currentIndex = 0;
    this.isOpen = true;

    // Complete specific talk objective and discover historical insight
    if (typeof window !== 'undefined') {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.setDialogueActive(true);
      }).catch(() => {});

      import('../../game/story/StoryManager').then(({ globalStoryManager }) => {
        let locId = sequenceId.replace('narrator_', '').replace('npc_', '');
        if (locId.includes('ujjain') || locId === 'elder_merchant' || locId === 'textile' || locId === 'spice' || locId === 'grain' || locId === 'artisan' || locId === 'guard' || locId === 'townsperson') {
          locId = 'ujjain';
        } else if (locId.includes('bharuch') || locId === 'sailor' || locId === 'salt') {
          locId = 'bharuch';
        } else if (locId.includes('muziris') || locId === 'kalyan' || locId === 'marcus') {
          locId = 'muziris';
        } else if (locId.includes('madurai') || locId === 'weaver' || locId === 'pearl') {
          locId = 'madurai';
        } else if (locId.includes('patali') || locId === 'sutradhar') {
          locId = 'pataliputra';
        }

        globalStoryManager.completeObjectiveByAction('talk', {
          dialogueId: sequenceId,
          npcId: sequenceId,
          location: locId
        });
        globalStoryManager.discoverLocationInsight(locId);
      });
    }

    this.notify();
    return true;
  }

  /**
   * Return current line object
   */
  getCurrentLine() {
    if (!this.isOpen || this.currentIndex < 0 || this.currentIndex >= this.currentSequence.length) {
      return null;
    }
    const line = this.currentSequence[this.currentIndex];
    return {
      ...line,
      text: line.text.replace(/\{\{playerName\}\}/g, getPlayerNickname() || 'traveler')
    };
  }

  /**
   * Advance to the next line or close if finished
   */
  nextLine() {
    if (!this.isOpen) return;

    if (this.currentIndex < this.currentSequence.length - 1) {
      this.currentIndex += 1;
      this.notify();
    } else {
      this.close();
    }
  }

  /**
   * Close dialogue box and reset state
   */
  close() {
    if (!this.isOpen) return;
    const completedSeqId = this.currentSequenceId;
    this.isOpen = false;
    this.currentIndex = 0;
    this.currentSequence = [];
    this.currentSequenceId = null;
    if (typeof window !== 'undefined') {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.setDialogueActive(false);
      }).catch(() => {});
    }
    this.notify();

    // Trigger location question transition if an Elder/Narrator sequence completed
    const isGuideSequence = (
      completedSeqId === 'elder_merchant' ||
      completedSeqId === 'narrator_ujjain' ||
      completedSeqId === 'narrator_bharuch' ||
      completedSeqId === 'narrator_pataliputra' ||
      completedSeqId === 'narrator_madurai' ||
      completedSeqId === 'narrator_muziris'
    );

    if (isGuideSequence) {
      let locId = 'ujjain';
      if (completedSeqId.startsWith('narrator_')) {
        locId = completedSeqId.replace('narrator_', '');
      }
      globalQuestionManager.startQuestionForLocation(locId);
    } else if (completedSeqId) {
      // If closing a merchant/trader dialogue, automatically open the trading market
      const isMerchantDialogue = (
        completedSeqId.startsWith('npc_') ||
        completedSeqId.includes('textile') ||
        completedSeqId.includes('spice') ||
        completedSeqId.includes('grain') ||
        completedSeqId.includes('artisan') ||
        completedSeqId.includes('salt') ||
        completedSeqId.includes('marcus') ||
        completedSeqId.includes('pearl') ||
        completedSeqId.includes('silk')
      );
      if (isMerchantDialogue && typeof window !== 'undefined') {
        import('../../game/trading/TradeManager').then(({ globalTradeManager }) => {
          globalTradeManager.openMarket();
        }).catch(() => {});
      }
    }
  }
}

// Global shared instance
export const globalDialogueManager = new DialogueManager();
