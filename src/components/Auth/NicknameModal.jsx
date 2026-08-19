import React, { useState } from 'react';
import { setPlayerNickname, setPlayerCharacter, getAllCharacters, getPlayerNickname } from '../../game/player/PlayerIdentity';

export default function NicknameModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1); // 1: Nickname, 2: Character Selection
  const [nickname, setNickname] = useState(() => getPlayerNickname() || '');
  const [selectedCharId, setSelectedCharId] = useState('merchant_male');
  const [error, setError] = useState('');

  const characters = getAllCharacters();

  if (!isOpen) return null;

  const handleNextStep = (event) => {
    event.preventDefault();
    const trimmed = nickname.trim();

    if (!trimmed) {
      setError('Please enter a nickname.');
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 16) {
      setError('Nickname must be 2–16 characters.');
      return;
    }
    if (!/^[A-Za-z0-9]+(?: [A-Za-z0-9]+)*$/.test(trimmed)) {
      setError('Use letters, numbers, and spaces between words.');
      return;
    }

    setError('');
    setStep(2);
  };

  const handleFinalSubmit = () => {
    const trimmed = nickname.trim();
    if (!trimmed) {
      setStep(1);
      setError('Please enter a nickname first.');
      return;
    }

    if (!selectedCharId) {
      setError('Choose a merchant to continue.');
      return;
    }

    setPlayerNickname(trimmed);
    setPlayerCharacter(selectedCharId);
    onComplete(trimmed, selectedCharId);
  };

  return (
    <div className="nickname-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="nickname-title">
      {step === 1 ? (
        /* STEP 1: NICKNAME INPUT */
        <form className="nickname-modal-card" onSubmit={handleNextStep}>
          <span className="nickname-mark">VYAPAR</span>
          <p className="nickname-eyebrow">Begin Your Historical Trade Journey</p>
          <h1 id="nickname-title">Choose Your Name</h1>
          <p className="nickname-prompt">What should the guilds and narrators call you?</p>
          <label htmlFor="player-nickname" className="sr-only">Player nickname</label>
          <input
            id="player-nickname"
            type="text"
            value={nickname}
            onChange={event => {
              setNickname(event.target.value);
              setError('');
            }}
            maxLength={16}
            autoFocus
            placeholder="Your nickname (e.g. Pranjal)"
          />
          {error && <p className="nickname-error" role="alert">{error}</p>}
          <button type="submit" className="nickname-start-button">
            CONTINUE →
          </button>
        </form>
      ) : (
        /* STEP 2: CHOOSE YOUR MERCHANT */
        <div className="character-select-modal-card">
          <span className="nickname-mark">VYAPAR • c. 250 BCE</span>
          <h1 className="char-select-title">CHOOSE YOUR MERCHANT</h1>
          <p className="char-select-subtitle">Who will travel these roads, trade in bustling bazaars, and lead the caravan?</p>

          <div className="characters-selection-grid">
            {characters.map(char => {
              const isSelected = char.id === selectedCharId;
              return (
                <div
                  key={char.id}
                  className={`character-card ${isSelected ? 'character-card-selected' : ''}`}
                  onClick={() => {
                    setSelectedCharId(char.id);
                    setError('');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCharId(char.id);
                      setError('');
                    }
                  }}
                >
                  <div className="character-portrait-wrapper">
                    <img
                      src={char.portrait}
                      alt={char.name}
                      className="character-portrait-img"
                      loading="eager"
                    />
                    {isSelected && (
                      <span className="character-selected-badge">✓ SELECTED</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {error && <p className="nickname-error" role="alert" style={{ marginBottom: '1rem' }}>{error}</p>}

          <div className="char-select-actions-bar">
            <button
              type="button"
              className="btn-char-back"
              onClick={() => {
                setError('');
                setStep(1);
              }}
            >
              ← Back to Name
            </button>
            <button
              type="button"
              className="btn-char-confirm-start"
              onClick={handleFinalSubmit}
            >
              BEGIN JOURNEY →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
