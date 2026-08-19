/**
 * AuthManager.js - State & synchronization engine for Supabase Auth and persistent progress
 * 
 * Handles user registration, login, logout, profile creation, session restoration on refresh,
 * database loading, debounced saving of player progress to PostgreSQL via Supabase RLS, and safe error handling.
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { globalProgressManager } from '../progression/ProgressManager';
import { globalTradeManager } from '../trading/TradeManager';
import { globalQuestionManager } from '../../components/Question/QuestionManager';
import { globalTravelManager } from '../travel/TravelManager';
import { getPlayerNickname } from '../player/PlayerIdentity';

export class AuthManager {
  constructor() {
    this.user = null;
    this.profile = null;
    this.isAuthenticated = false;
    this.isLoading = true;
    this.saveStatus = 'idle'; // 'idle' | 'saving' | 'saved' | 'error'
    this.error = null;
    this.loadError = null;

    this.saveDebounceTimer = null;
    this.savedResetTimer = null;

    this.listeners = new Set();
    this.init();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = this.getState();
    this.listeners.forEach(fn => fn(state));
  }

  getState() {
    return {
      user: this.user,
      profile: this.profile,
      isAuthenticated: this.isAuthenticated,
      isLoading: this.isLoading,
      saveStatus: this.saveStatus,
      error: this.error,
      loadError: this.loadError,
      isConfigured: isSupabaseConfigured
    };
  }

  /**
   * Get formatted merchant profile statistics
   */
  getProfileStats() {
    const pState = globalProgressManager.getState();
    const tState = globalTradeManager.getState();
    const history = tState.tradeHistory || [];
    const totalProfit = history.reduce((acc, item) => acc + (item.profit || 0), 0);

    let successfulTrades = 0;
    let lossTrades = 0;
    history.forEach(item => {
      if (item.profit > 0) successfulTrades++;
      else if (item.profit < 0) lossTrades++;
    });

    const isNewPlayer = (
      pState.currentLocation === 'ujjain' &&
      (!pState.completedQuestions || pState.completedQuestions.length === 0) &&
      history.length === 0
    );

    const travelManager = globalThis.globalTravelManager || globalTravelManager;
    const storyManager = globalThis.globalStoryManager;

    return {
      username: getPlayerNickname() || this.profile?.username || (this.user?.email ? this.user.email.split('@')[0] : 'Merchant'),
      email: this.user?.email || 'merchant@vyapar.history',
      currentLocation: pState.locationName || 'Ujjain',
      locationId: pState.currentLocation || 'ujjain',
      gold: tState.gold,
      knowledge: globalQuestionManager.knowledgeScore || 0,
      totalCargo: tState.totalCargo || 0,
      inventoryCapacity: tState.inventoryCapacity || 10,
      unlockedStatesCount: pState.unlockedStates ? pState.unlockedStates.length : 1,
      visitedLocations: pState.visitedLocations || ['ujjain'],
      visitedCount: pState.visitedLocations ? pState.visitedLocations.length : 1,
      completedQuestionsCount: pState.completedQuestions ? pState.completedQuestions.length : 0,
      totalTradesCount: history.length,
      successfulTrades,
      lossTrades,
      totalJourneys: travelManager?.totalJourneys || 0,
      eventsEncountered: travelManager?.eventsEncountered || 0,
      currentChapter: storyManager?.currentChapterNumber || 1,
      insightsCount: storyManager?.discoveredInsightIds ? storyManager.discoveredInsightIds.size : 0,
      totalProfit: totalProfit,
      isNewPlayer
    };
  }

  async init() {
    if (!isSupabaseConfigured || !supabase) {
      this.isLoading = false;
      this.notify();
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user) {
        this.user = session.user;
        await this.loadUserProfileAndProgress(session.user.id);
      }
    } catch (err) {
      console.warn('Supabase Auth init error:', err);
    } finally {
      this.isLoading = false;
      this.notify();
    }

    // Listen for real-time auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session && session.user) {
        this.user = session.user;
        await this.loadUserProfileAndProgress(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.user = null;
        this.profile = null;
        this.isAuthenticated = false;
        this.saveStatus = 'idle';
        this.notify();
      }
    });
  }

  /**
   * Register a new user with Email, Password, and Username
   */
  async register({ email, password, username }) {
    this.error = null;
    this.loadError = null;
    this.isLoading = true;
    this.notify();

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode fallback
      this.user = { id: 'demo-user-id', email };
      this.profile = { username: username || email.split('@')[0] };
      this.isAuthenticated = true;
      this.isLoading = false;
      this.notify();
      return { success: true };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('An account with this email already exists.');
        }
        throw new Error(authError.message || 'Registration failed.');
      }

      const user = authData.user;
      if (!user) {
        throw new Error('User creation failed.');
      }

      this.user = user;
      const cleanUsername = username || email.split('@')[0];

      // 1. Create Profile Row
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({ id: user.id, username: cleanUsername });

      if (profileErr) {
        console.warn('Profile creation warning:', profileErr);
      }
      this.profile = { username: cleanUsername };

      // 2. Create Initial Game Progress Row
      const initialProgress = {
        user_id: user.id,
        current_location: 'pataliputra',
        gold: 250,
        knowledge: 0,
        unlocked_states: ['pataliputra'],
        completed_questions: [],
        inventory: {},
        trade_history: []
      };

      await supabase.from('game_progress').upsert(initialProgress);
      this.applyProgressToEngines(initialProgress);

      this.isAuthenticated = true;
      this.isLoading = false;
      this.notify();
      return { success: true };

    } catch (err) {
      this.error = err.message || 'Unable to connect. Please try again.';
      this.isLoading = false;
      this.notify();
      return { success: false, error: this.error };
    }
  }

  /**
   * Log in existing user with Email and Password
   */
  async login({ email, password }) {
    this.error = null;
    this.loadError = null;
    this.isLoading = true;
    this.notify();

    if (!isSupabaseConfigured || !supabase) {
      // Demo mode fallback
      this.user = { id: 'demo-user-id', email };
      this.profile = { username: email.split('@')[0] };
      this.isAuthenticated = true;
      this.isLoading = false;
      this.notify();
      return { success: true };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error('Invalid email or password.');
      }

      const user = authData.user;
      this.user = user;

      await this.loadUserProfileAndProgress(user.id);

      this.isAuthenticated = true;
      this.isLoading = false;
      this.notify();
      return { success: true };

    } catch (err) {
      this.error = err.message || 'Unable to connect. Please try again.';
      this.isLoading = false;
      this.notify();
      return { success: false, error: this.error };
    }
  }

  /**
   * Log out active user and save current progress safely
   */
  async logout() {
    this.isLoading = true;
    this.notify();

    // Save final progress immediately before signout
    await this.executeSaveNow();

    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }

    this.user = null;
    this.profile = null;
    this.isAuthenticated = false;
    this.saveStatus = 'idle';
    this.isLoading = false;
    this.notify();
  }

  /**
   * Fetch Profile & Game Progress from Supabase and hydrate local frontend state safely
   */
  async loadUserProfileAndProgress(userId) {
    if (!isSupabaseConfigured || !supabase) return;
    this.loadError = null;

    try {
      // 1. Fetch Profile
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileErr && profileErr.code !== 'PGRST116') {
        console.warn('Profile fetch warning:', profileErr);
      }

      if (profileData) {
        this.profile = profileData;
      } else {
        this.profile = { username: this.user?.email ? this.user.email.split('@')[0] : 'Merchant' };
      }

      // 2. Fetch Game Progress
      const { data: progressData, error: progressErr } = await supabase
        .from('game_progress')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (progressErr && progressErr.code !== 'PGRST116') {
        // Genuine network/database load failure: do NOT overwrite existing progress with defaults!
        this.loadError = 'Unable to load your journey. Please check network connection.';
        console.error('Database progress load error:', progressErr);
        return;
      }

      if (progressData) {
        this.applyProgressToEngines(progressData);
      } else {
        // Create default initial progress ONLY if row is genuinely missing
        const newProgress = {
          user_id: userId,
          current_location: 'ujjain',
          gold: 150,
          knowledge: 0,
          unlocked_states: ['ujjain'],
          completed_questions: [],
          inventory: {},
          trade_history: []
        };
        await supabase.from('game_progress').upsert(newProgress);
        this.applyProgressToEngines(newProgress);
      }

      this.isAuthenticated = true;
    } catch (err) {
      this.loadError = 'Unable to connect to database to load journey.';
      console.error('Error loading progress:', err);
    }
  }

  /**
   * Retry loading game progress after a load error
   */
  async retryLoadProgress() {
    if (this.user) {
      this.isLoading = true;
      this.notify();
      await this.loadUserProfileAndProgress(this.user.id);
      this.isLoading = false;
      this.notify();
    }
  }

  /**
   * Hydrate local singleton managers from Database row
   */
  applyProgressToEngines(data) {
    if (!data) return;

    // ProgressManager sync
    if (data.current_location) {
      globalProgressManager.currentLocation = data.current_location;
    }
    if (Array.isArray(data.unlocked_states)) {
      globalProgressManager.unlockedStates = [...data.unlocked_states];
    }
    if (Array.isArray(data.visited_locations)) {
      globalProgressManager.visitedLocations = [...data.visited_locations];
    } else {
      globalProgressManager.visitedLocations = [data.current_location || 'pataliputra'];
    }
    if (Array.isArray(data.completed_questions)) {
      globalProgressManager.completedQuestions = [...data.completed_questions];
    }
    globalProgressManager.notify();

    // QuestionManager sync
    if (typeof data.knowledge === 'number') {
      globalQuestionManager.knowledgeScore = data.knowledge;
      globalQuestionManager.notifyKnowledge();
    }

    // TradeManager sync
    if (typeof data.gold === 'number') {
      globalTradeManager.gold = data.gold;
    }
    if (data.inventory && typeof data.inventory === 'object') {
      const hydrated = {
        textile: { quantity: 0, totalCost: 0 },
        pepper: { quantity: 0, totalCost: 0 },
        salt: { quantity: 0, totalCost: 0 },
        gems: { quantity: 0, totalCost: 0 }
      };

      for (const [key, val] of Object.entries(data.inventory)) {
        if (typeof val === 'number') {
          hydrated[key] = { quantity: val, totalCost: val * 50 };
        } else if (val && typeof val === 'object') {
          hydrated[key] = {
            quantity: val.quantity || 0,
            totalCost: val.totalCost || 0
          };
        }
      }
      globalTradeManager.inventory = hydrated;
    }
    if (Array.isArray(data.trade_history)) {
      globalTradeManager.tradeHistory = [...data.trade_history];
    }

    globalTradeManager.notify();

    // StoryManager sync
    const storyManager = globalThis.globalStoryManager;
    if (storyManager && typeof storyManager.hydrate === 'function') {
      storyManager.hydrate(data);
    }
  }

  /**
   * Debounced entrypoint for saving progress (batches rapid state updates within 400ms)
   */
  saveGameProgress() {
    if (!this.isAuthenticated || !this.user || !isSupabaseConfigured || !supabase) {
      return;
    }

    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    this.saveDebounceTimer = setTimeout(() => {
      this.executeSaveNow();
    }, 400);
  }

  /**
   * Immediate execution of Supabase save payload
   */
  async executeSaveNow() {
    if (!this.isAuthenticated || !this.user || !isSupabaseConfigured || !supabase) {
      return;
    }

    this.saveStatus = 'saving';
    this.notify();

    try {
      const pState = globalProgressManager.getState();
      const tState = globalTradeManager.getState();
      const storyManager = globalThis.globalStoryManager;
      const sState = storyManager ? storyManager.getState() : { currentChapterNumber: 1, completedObjectives: [], discoveredInsightIds: [] };

      const payload = {
        user_id: this.user.id,
        current_location: pState.currentLocation,
        gold: tState.gold,
        knowledge: globalQuestionManager.knowledgeScore || 0,
        unlocked_states: pState.unlockedStates,
        visited_locations: pState.visitedLocations,
        completed_questions: pState.completedQuestions,
        inventory: tState.inventory,
        trade_history: tState.tradeHistory,
        current_chapter: sState.currentChapterNumber,
        completed_objectives: sState.completedObjectives,
        discovered_insights: sState.discoveredInsightIds,
        updated_at: new Date().toISOString()
      };

      const { error: saveErr } = await supabase.from('game_progress').upsert(payload);

      if (saveErr) {
        throw saveErr;
      }

      this.saveStatus = 'saved';
      this.notify();

      if (this.savedResetTimer) clearTimeout(this.savedResetTimer);
      this.savedResetTimer = setTimeout(() => {
        if (this.saveStatus === 'saved') {
          this.saveStatus = 'idle';
          this.notify();
        }
      }, 2500);

    } catch (err) {
      console.warn('Save game progress error:', err);
      this.saveStatus = 'error';
      this.notify();
    }
  }
}

// Global shared instance
export const globalAuthManager = new AuthManager();
globalThis.globalAuthManager = globalAuthManager;
