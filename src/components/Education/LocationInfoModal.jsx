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
