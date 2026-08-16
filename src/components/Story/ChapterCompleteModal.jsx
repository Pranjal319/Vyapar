import React, { useEffect, useState } from 'react';
import { globalStoryManager } from '../../game/story/StoryManager';

export default function ChapterCompleteModal() {
  const [storyState, setStoryState] = useState(() => globalStoryManager.getState());

  useEffect(() => {
    const unsub = globalStoryManager.subscribe(setStoryState);
    return unsub;
  }, []);

  if (!storyState.showChapterComplete) return null;

  const chapter = storyState.chapter;
  const rewards = chapter.rewards || { knowledge: 25, reputation: 10, mudras: 100 };

  const handleContinue = () => {
    globalStoryManager.closeCompleteModal();
  };

  return (
    <div className="chapter-complete-overlay" role="dialog" aria-label="Chapter Completion Celebration">
      <div className="chapter-complete-card rpg-chapter-card">
        
        <div className="complete-badge">🏆 CHAPTER COMPLETE</div>
        <h2 className="complete-chapter-title">{chapter.title}</h2>
        <span className="complete-subtitle">Trade completed successfully.</span>

        <div className="complete-rewards-section">
          <h4 className="rewards-heading">🎁 REWARDS EARNED:</h4>
          <div className="rewards-grid-list">
            <div className="reward-item-pill">
              <span className="r-icon">📚</span>
              <span className="r-text">+{rewards.knowledge} Knowledge</span>
            </div>
            <div className="reward-item-pill">
              <span className="r-icon">⭐</span>
              <span className="r-text">+{rewards.reputation} Reputation</span>
            </div>
            <div className="reward-item-pill">
              <span className="r-icon">🪙</span>
              <span className="r-text">+{rewards.mudras} Mudras</span>
            </div>
          </div>
        </div>

        <div className="complete-actions">
          <button
            type="button"
            className="btn-complete-continue"
            onClick={handleContinue}
          >
            CONTINUE JOURNEY →
          </button>
        </div>

      </div>
    </div>
  );
}
