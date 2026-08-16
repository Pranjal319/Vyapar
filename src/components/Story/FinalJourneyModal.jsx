import React, { useEffect, useState } from 'react';
import { globalStoryManager } from '../../game/story/StoryManager';
import { globalAuthManager } from '../../game/auth/AuthManager';
import { globalSaveManager } from '../../game/progression/SaveManager';

export default function FinalJourneyModal({ onCompleteJourney }) {
  const [storyState, setStoryState] = useState(() => globalStoryManager.getState());
  const [stats, setStats] = useState(() => globalAuthManager.getProfileStats());

  useEffect(() => {
    const unsubStory = globalStoryManager.subscribe(setStoryState);
    const unsubAuth = globalAuthManager.subscribe(() => {
      setStats(globalAuthManager.getProfileStats());
    });

    return () => {
      unsubStory();
      unsubAuth();
    };
  }, []);

  if (!storyState.showFinalSummary) return null;

  const handleFinishJourney = () => {
    // Clear persistent save for this completed player
    globalSaveManager.clearCompletedGame();
    globalStoryManager.closeFinalSummaryModal();
    if (typeof onCompleteJourney === 'function') {
      onCompleteJourney();
    }
  };

  return (
    <div className="final-journey-overlay" role="dialog" aria-label="Grand Finale Journey Summary">
      <div className="final-journey-card">
        
        <div className="final-icon-badge">📜🏆</div>
        <h2 className="final-title">JOURNEY COMPLETE</h2>
        <span className="final-subtitle">INDIA'S HISTORICAL TRADE NETWORK</span>

        <div className="final-narrator-quote">
          <div className="narrator-header">
            <span className="narrator-avatar">👳‍♂️</span>
            <span className="narrator-name">ELDER MERCHANT NARRATOR</span>
          </div>
          <p className="narrator-farewell">
            "{stats.username || 'Merchant'}, you began with a single step at the crossroads of Ujjain and navigated across the Western Sea, the Malabar Spice Realm, and the Southern Kingdoms all the way to the Ganga. You have proven that trade is never simply about buying and selling—merchants carry ideas, culture, and wisdom that unite our realm!"
          </p>
        </div>

        <div className="final-stats-grid">
          <div className="final-stat-box">
            <span className="f-icon">📚</span>
            <span className="f-label">Knowledge</span>
            <strong className="f-val text-gold">{stats.knowledge}</strong>
          </div>

          <div className="final-stat-box">
            <span className="f-icon">💰</span>
            <span className="f-label">Total Net Profit</span>
            <strong className="f-val text-gold">{stats.totalProfit >= 0 ? `+${stats.totalProfit}` : stats.totalProfit} Mudras</strong>
          </div>

          <div className="final-stat-box">
            <span className="f-icon">🗺️</span>
            <span className="f-label">Locations Visited</span>
            <strong className="f-val text-teal">{stats.visitedCount} / 5</strong>
          </div>

          <div className="final-stat-box">
            <span className="f-icon">❓</span>
            <span className="f-label">Questions Solved</span>
            <strong className="f-val text-gold">{stats.completedQuestionsCount}</strong>
          </div>

          <div className="final-stat-box">
            <span className="f-icon">📖</span>
            <span className="f-label">Insights Discovered</span>
            <strong className="f-val text-teal">{storyState.discoveredInsightIds.length} / 15</strong>
          </div>

          <div className="final-stat-box">
            <span className="f-icon">🛒</span>
            <span className="f-label">Trades Executed</span>
            <strong className="f-val text-gold">{stats.totalTradesCount}</strong>
          </div>
        </div>

        {/* Visual Historical Journey Path */}
        <div className="final-route-path">
          <span className="path-title">REALM TRADE ROUTE COMPLETED:</span>
          <div className="path-pills">
            <span>Ujjain</span> → <span>Bharuch</span> → <span>Muziris</span> → <span>Madurai</span> → <span>Pataliputra</span>
          </div>
        </div>

        <div className="final-actions">
          <button
            type="button"
            className="btn-final-continue"
            onClick={handleFinishJourney}
          >
            🏆 COMPLETE JOURNEY & START FRESH →
          </button>
        </div>

      </div>
    </div>
  );
}
