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
