import React, { useEffect, useState } from 'react';
import { globalTravelManager } from '../../game/travel/TravelManager';

export default function TravelEventModal() {
  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());

  useEffect(() => {
    const unsub = globalTravelManager.onProgress(setTravelState);
    return unsub;
  }, []);

  const isEventOpen = travelState.state === 'EVENT' || travelState.state === 'EVENT_RESULT';
  if (!isEventOpen || !travelState.currentEvent) return null;

  const event = travelState.currentEvent;
  const isResultMode = travelState.state === 'EVENT_RESULT';

  const handleChoice = (choice) => {
    globalTravelManager.makeEventChoice(choice);
  };

  const handleResume = () => {
    globalTravelManager.resumeJourney();
  };

  return (
    <div className="travel-event-overlay" role="dialog" aria-label="Historical Travel Encounter">
      <div className="travel-event-card rpg-event-panel">
        
        <div className="event-card-header">
          <span className="event-icon">{event.icon || '📜'}</span>
          <div>
            <span className="event-badge">RANDOM ENCOUNTER • DAY {travelState.currentDay} / {travelState.totalDays}</span>
            <h2 className="event-title">{event.title}</h2>
          </div>
        </div>

        <div className="event-card-body">
          <p className="event-description">{event.description}</p>

          {/* Historical Educational Context */}
          {event.historicalNote && (
            <div className="event-historical-note">
              <span>💡 <strong>HISTORICAL CONTEXT:</strong> {event.historicalNote}</span>
            </div>
          )}

          {/* Question text if Scholar encounter */}
          {event.question && !isResultMode && (
            <div className="event-question-callout">
              <h4>📜 SCHOLAR'S QUESTION:</h4>
              <p>"{event.question}"</p>
            </div>
          )}

          {/* Result Mode Outcome */}
          {isResultMode ? (
            <div className="event-result-box">
              <span className="result-heading">EVENT OUTCOME:</span>
              <p className="result-text">{travelState.lastEventResultText}</p>
              
              <div className="result-rewards-row">
                {travelState.eventKnowledgeGain > 0 && (
                  <div className="knowledge-gain-badge">
                    <span>📚 +{travelState.eventKnowledgeGain} Knowledge Points</span>
                  </div>
                )}
                {travelState.selectedChoice?.effects?.reputation > 0 && (
                  <div className="reputation-gain-badge">
                    <span>⭐ +{travelState.selectedChoice.effects.reputation} Reputation</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Decision Choices Options A, B, C */
            <div className="event-choices-list">
              <span className="choices-heading">WHAT WILL YOU DO?</span>
              {event.choices.map((choice) => (
                <button
                  type="button"
                  key={choice.id}
                  className="btn-event-choice"
                  onClick={() => handleChoice(choice)}
                >
                  <div className="choice-title-row">
                    <span className="choice-label">{choice.label}</span>
                    {choice.effects?.knowledge > 0 && <span className="choice-reward">+Knowledge</span>}
                  </div>
                  <span className="choice-hint">{choice.hint}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer in Result Mode */}
        {isResultMode && (
          <div className="event-card-footer">
            <button
              type="button"
              className="btn-event-continue"
              onClick={handleResume}
            >
              CONTINUE CARAVAN JOURNEY ➔
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
