import React, { useEffect, useState } from 'react';
import { globalStoryManager } from '../../game/story/StoryManager';

export default function ChapterIntroModal() {
  const [storyState, setStoryState] = useState(() => globalStoryManager.getState());

  useEffect(() => {
    const unsub = globalStoryManager.subscribe(setStoryState);
    return unsub;
  }, []);

  if (!storyState.showChapterIntro) return null;

  const chapter = storyState.chapter;

  const handleBegin = () => {
    globalStoryManager.closeIntroModal();
  };

  return (
    <div className="chapter-intro-overlay" role="dialog" aria-label="Story Chapter Introduction">
      <div className="chapter-intro-card">
        
        <div className="intro-roman-badge">CHAPTER {chapter.roman}</div>
        <h2 className="intro-chapter-title">{chapter.title}</h2>
        <span className="intro-location-tag">📍 {chapter.locationName.toUpperCase()}</span>

        <div className="intro-quote-box">
          <p className="quote-text">"{chapter.quote}"</p>
        </div>

        <div className="intro-narrator-briefing">
          <div className="narrator-header">
            <span className="narrator-avatar">👳‍♂️</span>
            <span className="narrator-name">ELDER MERCHANT NARRATOR</span>
          </div>
          <p className="narrator-text">"{chapter.narratorIntro}"</p>
        </div>

        <div className="intro-actions">
          <button
            type="button"
            className="btn-begin-chapter"
            onClick={handleBegin}
          >
            📜 BEGIN CHAPTER {chapter.roman} JOURNEY →
          </button>
        </div>

      </div>
    </div>
  );
}
