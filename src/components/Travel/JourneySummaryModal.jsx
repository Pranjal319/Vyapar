import React, { useEffect, useState } from 'react';
import { globalTravelManager } from '../../game/travel/TravelManager';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import locationContent from '../../data/locationContent.json';

export default function JourneySummaryModal({ isOpen, onEnterLocalWorld }) {
  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());

  useEffect(() => {
    const unsub = globalTravelManager.onProgress(setTravelState);
    return unsub;
  }, []);

  if (!isOpen || travelState.state !== 'ARRIVAL') return null;

  const targetId = travelState.toLocation || 'ujjain';
  const locInfo = locationContent[targetId] || {};
  const locName = locInfo.name || targetId.toUpperCase();

  const handleEnterWorld = () => {
    globalProgressManager.arriveAtState(targetId);
    if (onEnterLocalWorld) {
      onEnterLocalWorld(targetId);
    }
  };

  return (
    <div className="journey-summary-overlay" role="dialog" aria-label="Journey Completion Summary">
      <div className="journey-summary-card">
        
        <div className="summary-icon-badge">🐪✨</div>
        <h2 className="summary-title">JOURNEY COMPLETE</h2>
        <span className="summary-route">
          {travelState.fromLocation?.toUpperCase()} → {locName.toUpperCase()}
        </span>

        <div className="summary-metrics-grid">
          <div className="summary-metric">
            <span className="s-label">TRAVEL DAYS</span>
            <strong className="s-val text-gold">{travelState.totalDays} Days</strong>
          </div>
          <div className="summary-metric">
            <span className="s-label">EVENTS ENCOUNTERED</span>
            <strong className="s-val text-teal">{travelState.eventsEncountered} Event(s)</strong>
          </div>
          <div className="summary-metric">
            <span className="s-label">TRAVEL COST</span>
            <strong className="s-val text-gold">{travelState.travelCost} Mudras</strong>
          </div>
          <div className="summary-metric">
            <span className="s-label">KNOWLEDGE GAINED</span>
            <strong className="s-val text-teal">+{travelState.eventKnowledgeGain} Knowledge</strong>
          </div>
        </div>

        <div className="summary-lore-box">
          <p>
            📜 <strong>REGION BRIEFING:</strong> {locInfo.intro || `Your merchant caravan has safely arrived in ${locName}.`}
          </p>
        </div>

        <div className="summary-actions">
          <button
            type="button"
            className="btn-summary-enter"
            onClick={handleEnterWorld}
          >
            🏛️ ENTER {locName.toUpperCase()} LOCAL WORLD →
          </button>
        </div>

      </div>
    </div>
  );
}
