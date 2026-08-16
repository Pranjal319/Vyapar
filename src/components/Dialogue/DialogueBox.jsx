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
