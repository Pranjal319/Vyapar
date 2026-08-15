import React from 'react';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { globalTravelManager } from '../../game/travel/TravelManager';
import routesData from '../../data/routes.json';

export default function LocationPanel({ location, onClose, onEnterCity }) {
  if (!location) return null;

  const isCurrent = globalProgressManager.currentLocation === location.id;
  const isUnlocked = globalProgressManager.isUnlocked(location.id);
  const curLocId = globalProgressManager.currentLocation || 'ujjain';

  // Find connected route
  const matchingRoute = routesData.find(
    r => (r.from === curLocId && r.to === location.id) || (r.from === location.id && r.to === curLocId)
  );

  const handleTravelOrEnter = () => {
    if (isCurrent) {
      if (onEnterCity) onEnterCity(location.id);
      onClose();
      return;
    }

    if (!isUnlocked) return;

    globalTravelManager.prepareTravel(matchingRoute || location.id, curLocId, location.id);
    onClose();
  };

  const knownGoods = location.knownGoods || ["Textiles", "Spices", "Grains"];

  return (
    <div className="rpg-map-tooltip-overlay" onClick={onClose}>
      <div className="rpg-map-tooltip-card compact-rpg-panel" onClick={e => e.stopPropagation()}>
        <button type="button" className="rpg-tooltip-close" onClick={onClose}>✕</button>

        <div className="rpg-tooltip-header">
          <span className="rpg-tooltip-badge">{location.isPort ? '⚓ MARITIME PORT' : '🏛️ INLAND TRADE HUB'}</span>
          <h2 className="rpg-tooltip-title">{location.name.toUpperCase()}</h2>
          <span className="rpg-tooltip-subtitle">{location.region}</span>
        </div>

        {isUnlocked ? (
          <div className="rpg-tooltip-body">
            <div className="rpg-tooltip-section">
              <span className="rpg-tooltip-label">SPECIALTY GOODS:</span>
              <div className="rpg-tooltip-goods-list">
                {knownGoods.map((g, idx) => (
                  <span key={idx} className="rpg-tooltip-good-tag">✦ {g}</span>
                ))}
              </div>
            </div>

            <div className="rpg-tooltip-meta-grid">
              <div className="rpg-meta-item">
                <span className="rpg-meta-label">ROUTE TYPE:</span>
                <span className="rpg-meta-val">
                  {matchingRoute ? `${matchingRoute.icon || '🐪'} ${matchingRoute.type.toUpperCase()}` : '— OVERLAND'}
                </span>
              </div>
              <div className="rpg-meta-item">
                <span className="rpg-meta-label">ESTIMATED TIME:</span>
                <span className="rpg-meta-val text-gold">
                  {isCurrent ? 'CURRENT LOCATION 📍' : matchingRoute ? `${matchingRoute.travelDays || matchingRoute.days || 3} DAYS` : '3 DAYS'}
                </span>
              </div>
            </div>

            <div className="rpg-tooltip-footer">
              <button
                type="button"
                className={`rpg-btn-action ${isCurrent ? 'btn-enter-city' : 'btn-start-journey'}`}
                onClick={handleTravelOrEnter}
              >
                {isCurrent ? 'EXPLORE CITY 📍' : `SELECT ROUTE TO ${location.name.toUpperCase()} ➔`}
              </button>
            </div>
          </div>
        ) : (
          <div className="rpg-tooltip-body rpg-locked-body">
            <div className="rpg-locked-alert">
              <span className="rpg-locked-icon">🔒</span>
              <span className="rpg-locked-text">LOCKED REGION</span>
            </div>
            <p className="rpg-locked-desc">
              Complete trade journeys along connected historical routes to unlock this trade destination.
            </p>
            <div className="rpg-tooltip-footer">
              <button type="button" className="rpg-btn-action btn-disabled" disabled>
                LOCKED DESTINATION 🔒
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
