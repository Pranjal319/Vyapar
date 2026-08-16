import React, { useEffect, useState } from 'react';
import { globalStoryManager } from '../../game/story/StoryManager';
import insightsData from '../../data/historicalInsights.json';

export default function KnowledgeJournalModal({ isOpen, onClose }) {
  const [storyState, setStoryState] = useState(() => globalStoryManager.getState());
  const [activeLocTab, setActiveLocTab] = useState('pataliputra');

  useEffect(() => {
    const unsub = globalStoryManager.subscribe(setStoryState);
    return unsub;
  }, []);

  if (!isOpen) return null;

  const discoveredSet = new Set(storyState.discoveredInsightIds);

  const locations = [
    { id: 'pataliputra', name: 'Pataliputra' },
    { id: 'ujjain', name: 'Ujjain' },
    { id: 'bharuch', name: 'Bharuch' },
    { id: 'madurai', name: 'Madurai' },
    { id: 'muziris', name: 'Muziris' }
  ];

  const currentLocInsights = insightsData.filter(i => i.location === activeLocTab);

  return (
    <div className="journal-modal-overlay" role="dialog" aria-label="Knowledge Journal">
      <div className="journal-modal-card">
        
        <div className="journal-header">
          <div className="journal-title-group">
            <span className="journal-icon">📖</span>
            <div>
              <h2 className="journal-title">HISTORICAL KNOWLEDGE JOURNAL</h2>
              <span className="journal-subtitle">
                {discoveredSet.size} / {insightsData.length} Insights Discovered
              </span>
            </div>
          </div>
          <button type="button" className="btn-close-journal" onClick={onClose}>✕</button>
        </div>

        {/* Location Tabs */}
        <div className="journal-tabs">
          {locations.map(loc => {
            const locInsights = insightsData.filter(i => i.location === loc.id);
            const countDiscovered = locInsights.filter(i => discoveredSet.has(i.id)).length;
            const isTabActive = loc.id === activeLocTab;

            return (
              <button
                type="button"
                key={loc.id}
                className={`journal-tab ${isTabActive ? 'tab-active' : ''}`}
                onClick={() => setActiveLocTab(loc.id)}
              >
                <span>{loc.name}</span>
                <span className="tab-count">{countDiscovered} / {locInsights.length}</span>
              </button>
            );
          })}
        </div>

        {/* Insights List */}
        <div className="journal-body">
          {currentLocInsights.map(insight => {
            const isUnlocked = discoveredSet.has(insight.id);

            return (
              <div
                key={insight.id}
                className={`insight-card ${isUnlocked ? 'insight-unlocked' : 'insight-locked'}`}
              >
                <div className="insight-card-header">
                  <span className="insight-status-icon">{isUnlocked ? '📜' : '🔒'}</span>
                  <h3 className="insight-title">
                    {isUnlocked ? insight.title : 'Undiscovered Historical Insight'}
                  </h3>
                </div>
                <p className="insight-text">
                  {isUnlocked
                    ? insight.text
                    : 'Explore local cities, speak with merchants and narrator, and solve historical questions to unlock this lore.'}
                </p>
                {isUnlocked && (
                  <span className="insight-reward">📚 Knowledge +{insight.knowledgeReward}</span>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
