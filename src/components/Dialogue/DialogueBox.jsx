import React, { useCallback, useEffect, useState } from 'react';
import { globalDialogueManager } from './DialogueManager';

export default function DialogueBox() {
  const [dialogueState, setDialogueState] = useState(() => globalDialogueManager.getState());
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Subscribe to DialogueManager state changes
  useEffect(() => {
    const unsubscribe = globalDialogueManager.subscribe((newState) => {
      setDialogueState(newState);
    });
    return unsubscribe;
  }, []);

  const currentLine = dialogueState.currentLine;

  // Typewriter effect for current text line
  useEffect(() => {
    if (!dialogueState.isOpen || !currentLine) {
      return;
    }

    const fullText = currentLine.text;
    setDisplayedText('');
    setIsTyping(true);

    if (typeof window !== 'undefined') {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.playDialogue();
      });
    }

    let charIdx = 0;
    const timer = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      
      if (charIdx % 3 === 0 && typeof window !== 'undefined') {
        import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
          globalAudioManager.playTypewriter();
        });
      }

      if (charIdx >= fullText.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 18); // Fast 18ms speed for smooth readability

    return () => clearInterval(timer);
  }, [dialogueState.isOpen, dialogueState.currentIndex, currentLine]);

  // Handle advancing line or skipping typewriter
  const handleAdvance = useCallback(() => {
    if (!dialogueState.isOpen) return;

    if (isTyping && currentLine) {
      // Complete current typing instantly
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      globalDialogueManager.nextLine();
    }
  }, [dialogueState.isOpen, isTyping, currentLine]);

  const handleClose = useCallback(() => {
    globalDialogueManager.close();
  }, []);

  // Keyboard shortcut listener (Enter, Space, E, Escape)
  useEffect(() => {
    if (!dialogueState.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      } else if (['Enter', 'Space', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [dialogueState.isOpen, handleAdvance, handleClose]);

  if (!dialogueState.isOpen || !currentLine) {
    return null;
  }

  return (
    <div 
      className="dialogue-box-container"
      role="dialog"
      aria-label="Narrator Dialogue Window"
    >
      <div className="dialogue-box">
        {/* Narrator Portrait / Avatar */}
        <div className="dialogue-portrait">
          <svg className="narrator-svg-avatar" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="30" fill="url(#avatarGlow)" stroke="#f4a261" strokeWidth="2" />
            <defs>
              <radialGradient id="avatarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2a9d8f" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#141b27" stopOpacity="0.9" />
              </radialGradient>
            </defs>
            {/* Sage Head & Beard */}
            <circle cx="32" cy="24" r="10" fill="#d49b6a" />
            <path d="M26 28 Q32 38 38 28 Z" fill="#f8fafc" /> {/* White Wisdom Beard */}
            <circle cx="32" cy="14" r="5" fill="#4a3525" /> {/* Shikha / Sage Topknot */}
            <rect x="31" y="19" width="2" height="4" fill="#e76f51" /> {/* Tilak */}
            {/* Scholar White & Saffron Robe */}
            <path d="M16 52 C16 40, 48 40, 48 52 Z" fill="#f8fafc" />
            <path d="M20 40 L38 52 L44 52 L26 40 Z" fill="#f4a261" /> {/* Saffron Shawl */}
          </svg>
        </div>

        {/* Dialogue Content */}
        <div className="dialogue-content">
          <div className="dialogue-header">
            <div className="dialogue-speaker-group">
              <span className="speaker-name">{currentLine.speaker}</span>
              <span className="speaker-title-badge">📜 {currentLine.role || 'NARRATOR'}</span>
            </div>
            <div className="dialogue-counter">
              Line {dialogueState.currentIndex + 1} of {dialogueState.totalLines}
            </div>
          </div>

          <div className="dialogue-body-text">
            <p>{displayedText}</p>
            {isTyping && <span className="typing-cursor">▌</span>}
          </div>

          {/* Dialogue Footer Controls */}
          <div className="dialogue-footer">
            <div className="dialogue-hints">
              <span>⌨️ <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>E</kbd> to continue</span>
              <span><kbd>Esc</kbd> to skip</span>
            </div>

            <div className="dialogue-actions">
              <button 
                className="btn-dialogue-continue"
                onClick={handleAdvance}
                aria-label={dialogueState.isLastLine ? "Close Dialogue" : "Continue Dialogue"}
              >
                {dialogueState.isLastLine ? 'Close ✕' : 'Continue →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
