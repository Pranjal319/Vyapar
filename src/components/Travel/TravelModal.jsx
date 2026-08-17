import React, { useEffect, useState } from 'react';
import statesData from '../../data/states.json';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { globalTravelManager } from '../../game/travel/TravelManager';

export default function TravelModal({ isOpen, onClose, onStartTravel }) {
  const [progressState, setProgressState] = useState(() => globalProgressManager.getState());

  useEffect(() => {
    const unsubscribe = globalProgressManager.subscribe((newState) => {
      setProgressState(newState);
    });
    return unsubscribe;
  }, []);

  if (!isOpen) return null;

  const handleSelectLocation = (locId) => {
    if (globalProgressManager.isUnlocked(locId)) {
      if (globalProgressManager.currentLocation === locId) {
        if (onClose) onClose();
        return;
      }
      globalTravelManager.prepareTravel(locId);
      globalTravelManager.confirmStartTravel();
      if (onClose) onClose();
      if (onStartTravel) onStartTravel();
    }
  };

  return (
    <div className="travel-modal-overlay" role="dialog" aria-label="Historical Travel Selector">
      <div className="travel-modal-card">
        
        <div className="travel-header">
          <div className="travel-title-group">
            <span className="travel-icon">🗺️</span>
            <div>
              <h2 className="travel-title">SELECT TRADE DESTINATION</h2>
              <span className="travel-subtitle">Travel between historical trade hubs of India</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-travel"
            onClick={onClose}
            aria-label="Close Travel Selector"
          >
            ✕
          </button>
        </div>

        <div className="travel-grid">
          {statesData.map((loc) => {
            const isUnlocked = progressState.unlockedStates.includes(loc.id);
            const isCurrent = progressState.currentLocation === loc.id;
            const isVisited = progressState.visitedLocations.includes(loc.id);

            return (
              <div
                key={loc.id}
                className={`travel-loc-card ${isCurrent ? 'card-current' : isUnlocked ? 'card-unlocked' : 'card-locked'}`}
                onClick={() => handleSelectLocation(loc.id)}
              >
                <div className="travel-card-header">
                  <span className="travel-card-name">{loc.name.toUpperCase()}</span>
                  <span className="travel-card-badge">
                    {isCurrent ? '📍 HERE' : isVisited ? '🟢 VISITED' : isUnlocked ? '🔵 UNLOCKED' : '🔒 LOCKED'}
                  </span>
                </div>

                <div className="travel-card-body">
                  <span className="travel-region">{loc.region} • {loc.role}</span>
                  <p className="travel-desc">{loc.description}</p>
                </div>

                <button
                  type="button"
                  className="btn-travel-action"
                  disabled={!isUnlocked || isCurrent}
                >
                  {isCurrent ? 'CURRENT LOCATION 📍' : isUnlocked ? 'PREPARE JOURNEY ➔' : 'LOCKED 🔒'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="travel-footer">
          <button
            type="button"
            className="btn-cancel-travel"
            onClick={onClose}
          >
            CANCEL
          </button>
        </div>

      </div>
    </div>
  );
}
