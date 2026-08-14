import React, { useState } from 'react';
import Home from './pages/Home';
import Game from './pages/Game';
import NicknameModal from './components/Auth/NicknameModal';
import { globalSaveManager } from './game/progression/SaveManager';

import { ErrorBoundary } from './components/Common/ErrorBoundary';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showNicknameModal, setShowNicknameModal] = useState(false);

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueJourney = () => {
    if (globalSaveManager.hasUnfinishedSave()) {
      globalSaveManager.loadGame();
      handleNavigate('game');
    } else {
      handleNewJourney();
    }
  };

  const handleNewJourney = () => {
    setShowNicknameModal(true);
  };

  const handleStartJourney = () => {
    if (globalSaveManager.hasUnfinishedSave()) {
      handleContinueJourney();
    } else {
      handleNewJourney();
    }
