import React, { useCallback, useEffect, useState } from 'react';
import { globalQuestionManager } from './QuestionManager';

export default function QuestionCard() {
  const [qState, setQState] = useState(() => globalQuestionManager.getState());

  useEffect(() => {
    const unsubscribe = globalQuestionManager.subscribe((newState) => {
      setQState(newState);
    });
    return unsubscribe;
  }, []);

  const { status, isOpen, currentQuestion, selectedIndex, isCorrect } = qState;

  const handleSelect = (idx) => {
    globalQuestionManager.selectOption(idx);
  };

  const handleSubmit = useCallback(() => {
    globalQuestionManager.submitAnswer();
  }, []);

  const handleContinue = useCallback(() => {
    globalQuestionManager.complete();
  }, []);

  // Keyboard shortcut listener (1, 2, 3, 4 to select; Enter/Space to submit or continue)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (status === 'question') {
        if (['Digit1', 'Numpad1', 'KeyA'].includes(e.code)) {
          e.preventDefault();
          handleSelect(0);
        } else if (['Digit2', 'Numpad2', 'KeyB'].includes(e.code)) {
          e.preventDefault();
          handleSelect(1);
        } else if (['Digit3', 'Numpad3', 'KeyC'].includes(e.code)) {
          e.preventDefault();
          handleSelect(2);
        } else if (['Digit4', 'Numpad4', 'KeyD'].includes(e.code)) {
          e.preventDefault();
          handleSelect(3);
        } else if (e.code === 'Enter' && selectedIndex !== null) {
          e.preventDefault();
          handleSubmit();
        }
      } else if (status === 'result') {
        if (['Enter', 'Space', 'KeyE'].includes(e.code)) {
          e.preventDefault();
          handleContinue();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, status, selectedIndex, handleSubmit, handleContinue]);

  if (!isOpen || !currentQuestion) {
    return null;
  }

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="question-card-overlay" role="dialog" aria-label="Historical Knowledge Challenge">
      <div className="question-card rpg-dialogue-event">
        {/* Header Title with Guide Identity */}
        <div className="question-header">
          <div className="question-speaker-tag">
            <span className="speaker-avatar">👳‍♂️</span>
            <div>
              <span className="speaker-title">ELDER MERCHANT</span>
              <span className="speaker-sub">📜 HISTORICAL KNOWLEDGE ENCOUNTER</span>
            </div>
          </div>
          <span className="question-topic-badge">{currentQuestion.topic || (currentQuestion.location ? currentQuestion.location.toUpperCase() : 'HISTORICAL REALM')}</span>
        </div>

        {/* Question Prompt View */}
        {status === 'question' && (
          <div className="question-body">
            <h3 className="question-prompt-text">{currentQuestion.question}</h3>

            <div className="options-grid">
              {currentQuestion.options.map((optText, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`option-card ${isSelected ? 'option-selected' : ''}`}
                    onClick={() => handleSelect(idx)}
                    aria-pressed={isSelected}
                  >
                    <span className="option-radio">{isSelected ? '◉' : '○'}</span>
                    <span className="option-letter">{optionLabels[idx]}.</span>
                    <span className="option-label">{optText}</span>
                    <span className="option-key-hint">[{idx + 1}]</span>
                  </button>
                );
              })}
            </div>

            <div className="question-footer">
              <span className="keyboard-hint">⌨️ Press <kbd>1</kbd>–<kbd>4</kbd> to select • <kbd>Enter</kbd> to submit</span>
              <button
                type="button"
                className="btn-submit-answer"
                disabled={selectedIndex === null}
                onClick={handleSubmit}
              >
                SUBMIT ANSWER ➔
              </button>
            </div>
          </div>
        )}

        {/* Result & Explanation View */}
        {status === 'result' && (
          <div className="result-body">
            {isCorrect ? (
              <div className="result-banner result-banner-correct">
                <div className="result-title">
                  <span className="result-icon">✓</span>
                  <span>CORRECT!</span>
                </div>
                <p className="npc-feedback-quote">
                  "Well answered, traveler. Your knowledge will serve you well on the ancient trade routes."
                </p>
                <div className="reward-pills-row">
                  <div className="knowledge-gain-pill">+{currentQuestion.knowledgeReward || 10} Knowledge Points 📚</div>
                  <div className="reputation-gain-pill">+2 Reputation ⭐</div>
                </div>
              </div>
            ) : (
              <div className="result-banner result-banner-wrong">
                <div className="result-title">
                  <span className="result-icon">✗</span>
                  <span>NOT QUITE</span>
                </div>
                <p className="npc-feedback-quote">
                  "Every traveler must learn the history of our roads and ports. Keep this truth in mind:"
                </p>
                <div className="correct-answer-callout">
                  Correct answer: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </div>
              </div>
            )}

            {/* Historical Educational Explanation */}
            <div className="explanation-card">
              <h4 className="explanation-heading">💡 Historical Context:</h4>
              <p className="explanation-text">{currentQuestion.explanation}</p>
            </div>

            <div className="result-footer">
              <span className="keyboard-hint">⌨️ Press <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>E</kbd> to continue</span>
              <button
                type="button"
                className="btn-result-continue"
                onClick={handleContinue}
              >
                CONTINUE JOURNEY →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
