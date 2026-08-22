import React from 'react';
import GameCanvas from '../components/Game/GameCanvas';

export default function Game({ onReturnHome }) {
  return (
    <main className="game-screen-page-fullscreen">
      <GameCanvas onReturnHome={onReturnHome} />
    </main>
  );
}
