import React from 'react';
import locationContentData from '../../data/locationContent.json';

export default function LocationInfoModal({ locationId, isOpen, onClose }) {
  if (!isOpen || !locationId) return null;

  const content = locationContentData[locationId] || locationContentData['pataliputra'];

  return (
    <div className="location-info-modal-overlay" role="dialog" aria-label={`Historical Information about ${content.name}`}>
      <div className="location-info-modal-card">
        
        {/* Header */}
        <div className="loc-info-header">
          <div className="loc-info-title-group">
            <span className="loc-info-icon">🏛️</span>
            <div>
              <h2 className="loc-info-title">{content.name.toUpperCase()}</h2>
              <span className="loc-info-subtitle">{content.type} • {content.region}</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-loc-info"
            onClick={onClose}
            aria-label="Close Location Information"
          >
            ✕
          </button>
        </div>

        {/* Intro */}
        <div className="loc-info-section">
          <h3 className="loc-section-heading">HISTORICAL OVERVIEW</h3>
          <p className="loc-info-intro">{content.intro}</p>
        </div>

        {/* Historical Facts */}
        <div className="loc-info-section">
          <h3 className="loc-section-heading">KEY HISTORICAL FACTS</h3>
          <ul className="loc-facts-list">
            {content.historicalFacts.map((fact, index) => (
              <li key={index} className="loc-fact-item">
                <span className="fact-bullet">📜</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Trade Context */}
        <div className="loc-info-section">
          <h3 className="loc-section-heading">COMMERCIAL & TRADE CONTEXT</h3>
          <p className="loc-info-trade-context">{content.tradeContext}</p>
        </div>

        {/* Major Goods */}
        <div className="loc-info-section">
          <h3 className="loc-section-heading">MAJOR TRADE COMMODITIES</h3>
          <div className="major-goods-tags">
            {content.majorGoods.map((good, idx) => (
              <span key={idx} className="good-tag-pill">
                🏷️ {good.replace('_', ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Historical Disclaimer */}
        <div className="loc-info-footer">
          <span className="loc-disclaimer-text">
            ⚖️ <em>{content.disclaimer || 'Game mechanic inspired by historical trade.'}</em>
          </span>
          <button
            type="button"
            className="btn-loc-info-close"
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
}
