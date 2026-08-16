import React, { useEffect, useState } from 'react';
import { globalStoryManager } from '../../game/story/StoryManager';

export default function ObjectiveTracker() {
  const [storyState, setStoryState] = useState(() => globalStoryManager.getState());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = globalStoryManager.subscribe(setStoryState);
    return unsub;
  }, []);

  const chapter = storyState.chapter;

  return (
    <div className="objective-tracker-container">
      <button
        type="button"
        className="rpg-objective-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Click to view Active Quest Objectives"
      >
        📜 <strong>CHAPTER {chapter.roman} — {chapter.title}</strong> [{storyState.completedCount}/{storyState.totalObjectives}]
      </button>

      {isOpen && (
        <div className="objective-dropdown-card rpg-quest-card">
          <div className="dropdown-header">
            <span className="dropdown-title">CHAPTER {chapter.roman} — {chapter.title}</span>
            <span className="dropdown-location">📍 {chapter.locationName.toUpperCase()}</span>
          </div>

          <div className="dropdown-checklist">
            {storyState.objectives.map(obj => {
              let itemClass = 'checklist-item';
              let icon = '☐';
              if (obj.isCompleted) {
                itemClass += ' obj-done';
                icon = '☑';
              } else if (obj.isActive) {
                itemClass += ' obj-active';
                icon = '▶';
              } else {
                itemClass += ' obj-locked';
                icon = '🔒';
              }

              return (
                <div key={obj.id} className={itemClass}>
                  <span className="obj-checkbox">{icon}</span>
                  <span className="obj-text">{obj.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
