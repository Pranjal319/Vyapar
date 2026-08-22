import React from 'react';
import Hero from '../components/Hero';

export default function Home({ onStartJourney, onContinueJourney, onNewJourney }) {
  return (
    <main className="home-page">
      <Hero 
        onStartJourney={onStartJourney} 
        onContinueJourney={onContinueJourney}
        onNewJourney={onNewJourney}
      />
    </main>
  );
}
