import React, { useEffect, useRef, useState } from 'react';
import { Camera } from '../../game/camera/Camera';
import { GameWorld } from './GameWorld';
import { globalDialogueManager } from '../Dialogue/DialogueManager';
import { globalQuestionManager } from '../Question/QuestionManager';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { globalTradeManager } from '../../game/trading/TradeManager';
import { globalAuthManager } from '../../game/auth/AuthManager';
import { globalTravelManager } from '../../game/travel/TravelManager';

import DialogueBox from '../Dialogue/DialogueBox';
import QuestionModal from '../Question/QuestionCard';
import MarketPanel from '../Trading/MarketPanel';
import TradeMapCanvas from '../Map/TradeMapCanvas';
import TravelScene from '../Travel/TravelScene';
import TravelPrepModal from '../Travel/TravelPrepModal';

import PauseMenu from '../PauseMenu/PauseMenu';
import ProfileModal from '../Profile/ProfileModal';
import LocationInfoModal from '../Education/LocationInfoModal';
import TravelModal from '../Travel/TravelModal';

// Story & Knowledge Journal Components
import ObjectiveTracker from '../Story/ObjectiveTracker';
import KnowledgeJournalModal from '../Story/KnowledgeJournalModal';
import ChapterIntroModal from '../Story/ChapterIntroModal';
import ChapterCompleteModal from '../Story/ChapterCompleteModal';
import FinalJourneyModal from '../Story/FinalJourneyModal';
import CinematicBanner from './CinematicBanner';
import DemoSummaryModal from '../Demo/DemoSummaryModal';
import { globalDemoManager } from '../../game/demo/DemoManager';
import { getPlayerNickname, getCharacterDetails } from '../../game/player/PlayerIdentity';

export default function GameCanvas({ onReturnHome }) {
  const canvasRef = useRef(null);
  const worldRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const [gameView, setGameView] = useState('local'); // 'local' | 'map' | 'travel'
  const [isPaused, setIsPaused] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLocationInfoModal, setShowLocationInfoModal] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [demoState, setDemoState] = useState(() => globalDemoManager.getState());
  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());

  useEffect(() => {
    const unsubDemo = globalDemoManager.subscribe(setDemoState);
    const unsubTravel = globalTravelManager.onProgress((tState) => {
      setTravelState(tState);
      if (tState.isTravelling && gameView !== 'travel') {
        setGameView('travel');
      }
    });

    return () => {
      unsubDemo();
      if (typeof unsubTravel === 'function') unsubTravel();
    };
  }, [gameView]);

  // Unified BGM Audio Lifecycle
  useEffect(() => {
    import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
      globalAudioManager.initContext();
      globalAudioManager.startBGM();
    }).catch(() => {});

    return () => {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.stopBGM();
      }).catch(() => {});
    };
  }, []);

  const [playerStats, setPlayerStats] = useState(() => {
    const pState = globalProgressManager.getState();
    const tState = globalTradeManager.getState();
    const qState = globalQuestionManager.getState();
    return {
      gold: tState.gold || 500,
      reputation: tState.reputation || 0,
      knowledge: qState.knowledgeScore || 0,
      currentLocation: pState.locationName || 'Ujjain',
      currentLocationId: pState.currentLocation || 'ujjain',
      totalCargo: tState.totalCargo || 0,
      cargoValue: tState.cargoValue || 0,
      inventoryCapacity: tState.inventoryCapacity || 10
    };
  });

  const [authState, setAuthState] = useState(() => globalAuthManager.getState());

  useEffect(() => {
    const unsubAuth = globalAuthManager.subscribe(setAuthState);
    const unsubQuestion = globalQuestionManager.subscribe((qState) => {
      setPlayerStats(prev => ({ ...prev, knowledge: qState.knowledgeScore || 0 }));
    });
    const unsubProgress = globalProgressManager.onProgressChange((pState) => {
      setPlayerStats(prev => ({
        ...prev,
        currentLocation: pState.locationName,
        currentLocationId: pState.currentLocation
      }));
    });
    const unsubTrade = globalTradeManager.subscribe((tState) => {
      setPlayerStats(prev => ({
        ...prev,
        gold: tState.gold,
        reputation: tState.reputation || 0,
        totalCargo: tState.totalCargo,
        cargoValue: tState.cargoValue || 0,
        inventoryCapacity: tState.inventoryCapacity
      }));
    });

    return () => {
      unsubAuth();
      unsubQuestion();
      unsubProgress();
      unsubTrade();
    };
  }, []);

  // Listen for ESC key (Pause Menu) and M key (Trade Map Toggle)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isOverlayOpen = (
        globalDialogueManager.isOpen ||
        globalQuestionManager.isOpen ||
        globalProgressManager.hasNotification ||
        globalTradeManager.isOpen ||
        showTravelModal ||
        showProfileModal ||
        showLocationInfoModal ||
        showJournalModal ||
        travelState.state === 'PREPARING'
      );

      if (e.code === 'Escape' && !isOverlayOpen) {
        setIsPaused(prev => !prev);
      } else if (e.code === 'KeyM' && !isOverlayOpen && !isPaused && gameView !== 'travel') {
        setGameView(prev => (prev === 'local' ? 'map' : 'local'));
      } else if (e.code === 'KeyT' && !isOverlayOpen && !isPaused && gameView === 'local') {
        if (globalTradeManager.isOpen) {
          globalTradeManager.closeMarket();
        } else {
          globalTradeManager.openMarket();
        }
      } else if (e.code === 'KeyI' && !isOverlayOpen && !isPaused) {
        setShowJournalModal(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTravelModal, showProfileModal, showLocationInfoModal, showJournalModal, isPaused, gameView, travelState.state]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
    const isModalOpen = showProfileModal || showLocationInfoModal || showJournalModal || showTravelModal || isPaused;
    if (worldRef.current?.input) {
      if (isModalOpen) {
        worldRef.current.input.reset();
        worldRef.current.input.setEnabled(false);
      } else {
        worldRef.current.input.setEnabled(true);
      }
    }
  }, [showProfileModal, showLocationInfoModal, showJournalModal, showTravelModal, isPaused]);

  useEffect(() => {
    if (gameView !== 'local') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const worldWidth = 2000;
    const worldHeight = 1400;
    const world = new GameWorld(window.innerWidth, window.innerHeight);
    world.worldWidth = worldWidth;
    world.worldHeight = worldHeight;
    worldRef.current = world;

    const camera = new Camera(window.innerWidth, window.innerHeight, worldWidth, worldHeight);
    cameraRef.current = camera;
    lastTimeRef.current = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);

      world.resize(w, h);
      camera.resize(w, h, worldWidth, worldHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = (currentTime) => {
      if (!canvas || !ctx) return;

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      const dpr = window.devicePixelRatio || 1;

      if (world.player) {
        camera.update(world.player);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.scale(dpr, dpr);

      if (isPausedRef.current) {
        world.render(ctx, camera);
      } else {
        world.update(dt);
        world.render(ctx, camera);
      }

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (world.cleanup) {
        world.cleanup();
      }
    };
  }, [gameView]);

  const usernameDisplay = getPlayerNickname() || authState.profile?.username || (authState.user?.email ? authState.user.email.split('@')[0] : 'Merchant');

  // 1. Dedicated 2D Animated Caravan Travel Scene
  if (gameView === 'travel') {
    return (
      <TravelScene
        onArrivalInWorld={(destLocId) => {
          if (destLocId) {
            globalProgressManager.arriveAtState(destLocId);
          }
          setGameView('local');
        }}
      />
    );
  }

  // 2. Strategic India Trade Map View
  if (gameView === 'map') {
    return (
      <TradeMapCanvas
        onStartTravel={() => setGameView('travel')}
        onEnterLocalWorld={(destLocId) => {
          if (destLocId) {
            globalProgressManager.arriveAtState(destLocId);
          }
          setGameView('local');
        }}
        onCloseMap={() => setGameView('local')}
      />
    );
  }

  // 3. Local 2D Historical RPG City View
  return (
    <div className="vyapar-fullscreen-game-mode">
      
      {/* RPG Top HUD Bar Overlay */}
      <header className="rpg-top-hud">
        <div className="hud-left-brand">
          <button
            type="button"
            className="rpg-profile-btn"
            onClick={() => setShowProfileModal(true)}
            title="Click to view Merchant Profile"
          >
            <div className="hud-avatar-circle">
              <img src={getCharacterDetails().portrait} alt={getCharacterDetails().name} className="hud-avatar-img" />
            </div>
            <strong className="hud-nickname-text">{usernameDisplay}</strong>
          </button>

          {/* Active Story Objective Tracker */}
          <ObjectiveTracker />

          {/* SIH Demo Mode Indicator Pill */}
          {demoState.isDemoActive && (
            <div className="rpg-demo-hud-pill">
              <span>🏆 SIH DEMO MODE</span>
              <button
                type="button"
                className="btn-demo-restart-sm"
                onClick={() => globalDemoManager.restartDemo()}
                title="Restart SIH Presentation Demo"
              >
                🔄
              </button>
              <button
                type="button"
                className="btn-demo-exit-sm"
                onClick={() => {
                  globalDemoManager.exitDemo();
                  if (onReturnHome) onReturnHome();
                }}
                title="Exit Demo Mode"
              >
                ✖
              </button>
            </div>
          )}
        </div>

        <div className="hud-center-location">
          <button
            type="button"
            className="rpg-location-btn"
            onClick={() => setShowLocationInfoModal(true)}
            title="Click for Location History & Trade Info"
          >
            📍 <strong>{playerStats.currentLocation.toUpperCase()}</strong> ℹ️
          </button>
        </div>

        <div className="hud-right-cluster">
          <div className="rpg-hud-pill">
            <span>🪙 {playerStats.gold}</span>
          </div>
          <div className="rpg-hud-pill">
            <span>📚 {playerStats.knowledge}</span>
          </div>
          <div className="rpg-hud-pill">
            <span>⭐ {playerStats.reputation}</span>
          </div>
          <div className="rpg-hud-pill">
            <span>📦 {playerStats.totalCargo}/{playerStats.inventoryCapacity}</span>
          </div>
          <div className="rpg-hud-pill" title="Current Selling Value of Cargo Goods">
            <span>💰 {playerStats.cargoValue} M</span>
          </div>

          {/* Historical Knowledge Journal Button */}
          <button
            type="button"
            className="rpg-journal-btn"
            onClick={() => {
              import('../../game/audio/AudioManager').then(({ globalAudioManager }) => globalAudioManager.initContext());
              setShowJournalModal(true);
            }}
            title="Open Historical Knowledge Journal"
          >
            📖 Journal
          </button>

          {/* Quick Mute Audio Toggle Button */}
          <button
            type="button"
            className="rpg-audio-mute-btn"
            onClick={() => {
              import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
                globalAudioManager.initContext();
                globalAudioManager.toggleMute();
              });
            }}
            title="Toggle Quick Mute Audio"
          >
            🔊 Sound
          </button>

          <button
            type="button"
            className="rpg-travel-btn"
            onClick={() => {
              import('../../game/audio/AudioManager').then(({ globalAudioManager }) => globalAudioManager.initContext());
              globalTradeManager.openMarket();
            }}
            title="Open City Bazaar Market to Buy/Sell Goods (T)"
          >
            🛒 Market (T)
          </button>

          <button
            type="button"
            className="rpg-travel-btn"
            onClick={() => {
              import('../../game/audio/AudioManager').then(({ globalAudioManager }) => globalAudioManager.initContext());
              setGameView('map');
            }}
            title="Open Strategic India Trade Map (M)"
          >
            🗺️ Trade Map (M)
          </button>
          <button
            type="button"
            className="rpg-pause-btn"
            onClick={() => setIsPaused(true)}
            title="Pause Game (ESC)"
          >
            ⏸️
          </button>
        </div>
      </header>

      {/* Controls Hint Bar (Bottom-Left) */}
      <div className="rpg-controls-hint-bar">
        <span>⌨️ WASD / Arrows to Move • E to Interact • T for Market • M for Strategic Map • ESC for Pause</span>
      </div>

      {/* Full-Screen 2D HTML5 Canvas Viewport */}
      <div className="canvas-fullscreen-box">
        <canvas
          ref={canvasRef}
          className="rpg-game-canvas-element"
          role="img"
          aria-label="2D Full-Screen RPG World Viewport with Player and Merchants"
        />
      </div>

      {/* Cinematic Location Arrival Banner */}
      <CinematicBanner />

      {/* Interactive Overlays */}
      <DialogueBox />
      <QuestionModal />
      <MarketPanel />

      {/* Story & Lore Modals */}
      <ChapterIntroModal />
      <ChapterCompleteModal />
      <FinalJourneyModal onCompleteJourney={onReturnHome} />
      <DemoSummaryModal
        isOpen={demoState.isComplete}
        onReplay={() => globalDemoManager.restartDemo()}
        onExit={() => {
          globalDemoManager.exitDemo();
          if (onReturnHome) onReturnHome();
        }}
      />
      <KnowledgeJournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
      />

      {/* Modals & Pause Menu */}
      <PauseMenu
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onOpenProfile={() => { setIsPaused(false); setShowProfileModal(true); }}
        onOpenTravel={() => { setIsPaused(false); setGameView('map'); }}
        onReturnHome={onReturnHome}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <LocationInfoModal
        isOpen={showLocationInfoModal}
        onClose={() => setShowLocationInfoModal(false)}
      />

      <TravelModal
        isOpen={showTravelModal}
        onClose={() => setShowTravelModal(false)}
        onStartTravel={() => {
          setShowTravelModal(false);
          setGameView('travel');
        }}
      />

      {/* Travel Preparation Modal in Local View */}
      <TravelPrepModal
        isOpen={travelState.state === 'PREPARING'}
        onClose={() => globalTravelManager.cancelPreparation()}
        onStartJourney={() => setGameView('travel')}
      />

    </div>
  );
}
