import React, { useEffect, useState } from 'react';
import { globalSaveManager } from '../game/progression/SaveManager';

export default function Hero({ onStartJourney, onContinueJourney, onNewJourney }) {
  const [hasSave, setHasSave] = useState(() => globalSaveManager.hasUnfinishedSave());

  useEffect(() => {
    const unsub = globalSaveManager.subscribe(status => {
      setHasSave(status.hasUnfinishedSave);
    });
    return unsub;
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-emblem" aria-hidden="true">✦ ॐ ✦</div>

      <h1 className="hero-title">VYAPAR</h1>
      <p className="hero-subtitle">ANCIENT INDIAN TRADE ROUTES • c. 250 BCE</p>

      <div className="hero-divider" aria-hidden="true">
        <span className="divider-line"></span>
        <span className="divider-gem">◆</span>
        <span className="divider-line"></span>
      </div>

      <p className="hero-description">
        Become a merchant. Travel across ancient India, trade valuable goods, meet merchants, and build your legacy.
      </p>

      <div className="hero-actions">
        {hasSave ? (
          <div className="hero-buttons-stacked">
            <button 
              id="continue-journey-btn" 
              className="btn-rpg-start" 
              onClick={onContinueJourney || onStartJourney}
              aria-label="Continue Journey"
            >
              <span>CONTINUE JOURNEY</span>
              <span className="btn-arrow">→</span>
            </button>

            <button 
              id="new-journey-btn" 
              className="btn-rpg-secondary" 
              onClick={onNewJourney}
              aria-label="Start New Journey"
            >
              <span>NEW JOURNEY</span>
            </button>
          </div>
        ) : (
          <button 
            id="start-journey-btn" 
            className="btn-rpg-start" 
            onClick={onStartJourney || onNewJourney}
            aria-label="Start Journey"
          >
            <span>START JOURNEY</span>
            <span className="btn-arrow">→</span>
          </button>
        )}
      </div>
    </section>
  );
}
