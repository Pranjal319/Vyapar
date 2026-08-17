import React, { useEffect, useState } from 'react';
import { globalTravelManager } from '../../game/travel/TravelManager';
import { globalTradeManager } from '../../game/trading/TradeManager';
import locationContent from '../../data/locationContent.json';

export default function TravelPrepModal({ isOpen, onClose, onStartJourney }) {
  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());

  useEffect(() => {
    const unsub = globalTravelManager.onProgress(setTravelState);
    return unsub;
  }, []);

  if (!isOpen || travelState.state !== 'PREPARING' || !travelState.activeRoute) return null;

  const destKey = (travelState.toLocation || 'bharuch').toLowerCase();
  const destInfo = locationContent[destKey] || {};
  const destName = destInfo.name || travelState.toLocation?.toUpperCase() || 'DESTINATION';
  const route = travelState.activeRoute;

  const playerGold = globalTradeManager.gold;
  const canAfford = playerGold >= travelState.travelCost;
  const cargoCount = globalTradeManager.getTotalCargoCount();
  const cargoCap = globalTradeManager.inventoryCapacity || 10;

  const handleStart = () => {
    if (canAfford) {
      globalTravelManager.confirmStartTravel();
      if (onStartJourney) {
        onStartJourney();
      }
      if (onClose) onClose();
    }
  };

  const handleCancel = () => {
    globalTravelManager.cancelPreparation();
    if (onClose) onClose();
  };

  return (
    <div className="travel-prep-overlay" role="dialog" aria-label="Travel Confirmation">
      <div className="travel-prep-card compact-rpg-panel">
        
        {/* Header */}
        <div className="prep-header">
          <span className="prep-icon">{route.icon || '🐪'}</span>
          <div>
            <h2 className="prep-title">TRAVEL TO {destName.toUpperCase()}</h2>
            <span className="prep-subtitle">
              {travelState.fromLocation?.toUpperCase()} ➔ {destName.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Compact Travel Details Grid */}
        <div className="prep-details-list">
          <div className="prep-row">
            <span className="prep-label">Distance:</span>
            <strong className="prep-val">{route.distance || 'Medium'}</strong>
          </div>

          <div className="prep-row">
            <span className="prep-label">Route:</span>
            <strong className="prep-val text-teal">{route.transport || (route.type ? route.type.toUpperCase() : 'OVERLAND')}</strong>
          </div>

          <div className="prep-row">
            <span className="prep-label">Estimated Travel:</span>
            <strong className="prep-val text-gold">{route.travelDays || route.days || 3} Days</strong>
          </div>

          <div className="prep-row">
            <span className="prep-label">Risk:</span>
            <strong className={`prep-val ${route.risk === 'High' ? 'text-danger' : 'text-gold'}`}>
              {route.risk || 'Medium'}
            </strong>
          </div>

          <div className="prep-row">
            <span className="prep-label">Cargo:</span>
            <strong className="prep-val">{cargoCount} / {cargoCap}</strong>
          </div>

          <div className="prep-row">
            <span className="prep-label">Expected Conditions:</span>
            <strong className="prep-val text-sand">{route.expectedConditions || 'Dry plains & trade highways'}</strong>
          </div>

          <div className="prep-row prep-cost-row">
            <span className="prep-label">Travel Fee:</span>
            <strong className={`prep-val ${canAfford ? 'text-gold' : 'text-danger'}`}>
              {travelState.travelCost} Mudras
            </strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="prep-footer">
          <button
            type="button"
            className="btn-prep-cancel"
            onClick={handleCancel}
          >
            CANCEL
          </button>
          <button
            type="button"
            className={`btn-prep-confirm ${canAfford ? '' : 'btn-disabled'}`}
            disabled={!canAfford}
            onClick={handleStart}
          >
            {canAfford ? 'START JOURNEY ➔' : 'NOT ENOUGH MUDRAS'}
          </button>
        </div>

      </div>
    </div>
  );
}
