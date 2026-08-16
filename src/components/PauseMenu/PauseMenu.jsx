import React, { useEffect, useState } from 'react';
import { globalAuthManager } from '../../game/auth/AuthManager';
import { globalAudioManager } from '../../game/audio/AudioManager';
import { globalSaveManager } from '../../game/progression/SaveManager';

export default function PauseMenu({ isOpen, onResume, onOpenProfile, onOpenTravel, onReturnHome }) {
  const [audioSettings, setAudioSettings] = useState(() => globalAudioManager.getSettings());
  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const unsub = globalAudioManager.subscribe(setAudioSettings);
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleSaveNow = async () => {
    globalSaveManager.saveGame();
    if (globalAuthManager && typeof globalAuthManager.executeSaveNow === 'function') {
      await globalAuthManager.executeSaveNow();
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    globalSaveManager.startNewGame();
    onResume();
  };

  const handleVolumeChange = (category, val) => {
    globalAudioManager.setVolume(category, parseFloat(val));
  };

  return (
    <div className="pause-menu-overlay" role="dialog" aria-label="Game Pause Menu">
      <div className="pause-menu-card">
        <div className="pause-menu-header">
          <h2 className="pause-menu-title">VYAPAR</h2>
          <span className="pause-menu-subtitle">GAME PAUSED</span>
        </div>

        {/* Audio Volume Settings Section */}
        <div className="pause-audio-section">
          <span className="audio-section-title">🔊 AUDIO & AMBIENCE SETTINGS</span>
          
          <div className="volume-sliders-grid">
            <div className="volume-control-row">
              <span className="vol-label">Master: {Math.round(audioSettings.volumes.master * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.volumes.master}
                onChange={(e) => handleVolumeChange('master', e.target.value)}
              />
            </div>

            <div className="volume-control-row">
              <span className="vol-label">Ambient: {Math.round(audioSettings.volumes.ambient * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.volumes.ambient}
                onChange={(e) => handleVolumeChange('ambient', e.target.value)}
              />
            </div>

            <div className="volume-control-row">
              <span className="vol-label">SFX: {Math.round(audioSettings.volumes.sfx * 100)}%</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={audioSettings.volumes.sfx}
                onChange={(e) => handleVolumeChange('sfx', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pause-menu-options">
          <button
            type="button"
            className="btn-pause-option btn-primary-option"
            onClick={onResume}
          >
            ▶ RESUME JOURNEY
          </button>

          <button
            type="button"
            className="btn-pause-option"
            onClick={() => { onResume(); onOpenProfile(); }}
          >
            🧑 MERCHANT PROFILE
          </button>

          <button
            type="button"
            className="btn-pause-option"
            onClick={() => { onResume(); onOpenTravel(); }}
          >
            🗺️ TRAVEL TO REGION
          </button>

          <button
            type="button"
            className={`btn-pause-option ${savedNotice ? 'btn-save-confirmed' : ''}`}
            onClick={handleSaveNow}
          >
            {savedNotice ? '✓ PROGRESS SAVED' : '💾 SAVE PROGRESS NOW'}
          </button>

          <button
            type="button"
            className="btn-pause-option btn-reset-option"
            onClick={() => setShowResetConfirm(true)}
          >
            ⚠️ RESET GAME
          </button>

          <button
            type="button"
            className="btn-pause-option btn-danger-option"
            onClick={onReturnHome}
          >
            🏠 RETURN TO MAIN MENU
          </button>
        </div>

        <div className="pause-menu-footer">
          <span className="pause-hint-text">Press <strong>ESC</strong> to return to the game</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="reset-confirm-overlay" role="dialog" aria-label="Confirm Reset Journey">
          <div className="reset-confirm-card">
            <div className="reset-confirm-icon">⚠️</div>
            <h3 className="reset-confirm-title">RESET YOUR JOURNEY?</h3>
            <p className="reset-confirm-text">
              This will erase your current journey, progress, inventory, money, completed objectives and chapter progress for this player. This cannot be undone.
            </p>
            <div className="reset-confirm-actions">
              <button
                type="button"
                className="btn-reset-cancel"
                onClick={() => setShowResetConfirm(false)}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn-reset-confirm"
                onClick={handleConfirmReset}
              >
                RESET GAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
