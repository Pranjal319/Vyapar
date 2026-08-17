import React, { useEffect, useRef, useState } from 'react';
import { TravelSceneRenderer } from '../../game/rendering/TravelSceneRenderer';
import { globalTravelManager } from '../../game/travel/TravelManager';
import TravelEventModal from './TravelEventModal';
import locationContent from '../../data/locationContent.json';

export default function TravelScene({ onArrivalInWorld }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(0);
  const pressedKeysRef = useRef(new Set());

  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());
  const [showLog, setShowLog] = useState(false);

  useEffect(() => {
    // Ensure travel journey is initialized if opened directly or from preparation
    if (globalTravelManager.state === 'IDLE' || globalTravelManager.state === 'PREPARING') {
      if (!globalTravelManager.activeRoute) {
        const from = globalProgressManager.currentLocation || 'ujjain';
        const to = globalTravelManager.toLocation || 'bharuch';
        globalTravelManager.prepareTravel(to, from, to);
      }
      globalTravelManager.confirmStartTravel();
    }

    const unsub = globalTravelManager.onProgress(setTravelState);
    return unsub;
  }, []);

  useEffect(() => {
    const keyMap = {
      KeyW: 'up',
      ArrowUp: 'up',
      KeyS: 'down',
      ArrowDown: 'down',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
      w: 'up',
      W: 'up',
      s: 'down',
      S: 'down',
      a: 'left',
      A: 'left',
      d: 'right',
      D: 'right'
    };

    const handleTravelInput = (event) => {
      const action = keyMap[event.code] || keyMap[event.key];
      if (!action) return;

      if (event.code?.startsWith('Arrow') || event.key?.startsWith('Arrow') || event.code === 'Space') {
        event.preventDefault();
      }

      pressedKeysRef.current.add(action);
    };

    const handleTravelInputRelease = (event) => {
      const action = keyMap[event.code] || keyMap[event.key];
      if (action) {
        pressedKeysRef.current.delete(action);
      }
    };

    const handleBlur = () => {
      pressedKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleTravelInput);
    window.addEventListener('keyup', handleTravelInputRelease);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleTravelInput);
      window.removeEventListener('keyup', handleTravelInputRelease);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Initialize Canvas & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = new TravelSceneRenderer();
    rendererRef.current = renderer;
    lastTimeRef.current = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const renderLoop = (currentTime) => {
      if (!canvas || !ctx) return;

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      const dpr = window.devicePixelRatio || 1;

      // Update simulation physics
      const keys = pressedKeysRef.current;
      const isEventActive = globalTravelManager.state === 'EVENT' || globalTravelManager.state === 'EVENT_RESULT' || globalTravelManager.state === 'ARRIVAL';

      let isMoving = false;
      if (!isEventActive && globalTravelManager.state === 'TRAVELLING') {
        const directionX = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0);
        const directionY = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);

        if (directionX !== 0 || directionY !== 0) {
          isMoving = true;
          const length = Math.hypot(directionX, directionY) || 1;
          globalTravelManager.movePlayer(directionX / length, directionY / length, dt);
        } else {
          globalTravelManager.update(dt);
        }
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      const currentState = globalTravelManager.getState();
      renderer.render(ctx, window.innerWidth, window.innerHeight, dt, currentState, isMoving);

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const destKey = (travelState.toLocation || 'bharuch').toLowerCase();
  const destInfo = locationContent[destKey] || {};
  const destName = destInfo.name || travelState.toLocation?.toUpperCase() || 'DESTINATION';

  const handleArrivalContinue = () => {
    globalTravelManager.completeArrival();
    if (onArrivalInWorld) {
      onArrivalInWorld(destKey);
    }
  };

  return (
    <div className="travel-scene-container">
      {/* 2D Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="travel-canvas-element"
        role="img"
        aria-label="2D Pixel-Art Historical Indian Caravan Journey Viewport"
      />

      {/* Top-Left Small RPG Travel HUD */}
      <div className="rpg-travel-hud-card">
        <div className="travel-hud-header">
          <span className="travel-hud-badge">🐪 JOURNEY IN PROGRESS</span>
          <h2 className="travel-hud-destination">
            TRAVELLING TO {destName.toUpperCase()}
          </h2>
        </div>

        <div className="travel-hud-metrics">
          <div className="hud-metric-row">
            <span>📅 TRAVEL DAYS:</span>
            <strong className="text-gold">Day {travelState.currentDay} / {travelState.totalDays}</strong>
          </div>
          <div className="hud-metric-row">
            <span>🧭 ROUTE:</span>
            <strong className="text-teal">{travelState.activeRoute?.transport?.toUpperCase() || 'OVERLAND CARAVAN'}</strong>
          </div>
          <div className="hud-metric-row">
            <span>📦 CARGO:</span>
            <span>{travelState.totalCargo} / {travelState.cargoCapacity} Units</span>
          </div>
          <div className="hud-metric-row">
            <span>🪙 MUDRAS:</span>
            <span className="text-gold">{travelState.mudras} M</span>
          </div>
          <div className="hud-metric-row">
            <span>🪙 COINS:</span>
            <span className="text-gold">{travelState.collectedCoins} / {travelState.totalCoins}</span>
          </div>
        </div>

        {/* Travel Day Journey Progress Track */}
        <div className="travel-route-progress-bar">
          <div
            className="route-progress-fill"
            style={{ width: `${Math.min(100, travelState.percentage)}%` }}
          />
        </div>

        <div className="travel-hud-actions">
          <button
            type="button"
            className="btn-toggle-log"
            onClick={() => setShowLog(!showLog)}
          >
            📜 {showLog ? 'Hide Travel Log' : 'View Travel Log'}
          </button>
        </div>
      </div>

      {/* Travel Log Side Drawer */}
      {showLog && (
        <div className="travel-log-card">
          <div className="log-header">
            <h3>📜 CARAVAN TRAVEL LOG</h3>
            <button
              type="button"
              className="btn-close-log"
              onClick={() => setShowLog(false)}
            >
              ✕
            </button>
          </div>
          <div className="log-entries-list">
            {travelState.travelLog.length === 0 ? (
              <p className="empty-log">Caravan just departed...</p>
            ) : (
              travelState.travelLog.map((entry, idx) => (
                <div key={idx} className="log-entry-item">
                  <span className="log-day">Day {entry.day || idx + 1}:</span>
                  <span className="log-text">{entry.text || entry.resultText}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Historical Travel Event Modal (Dust Storm, River Crossing, Roadblock, Broken Cart, Local Trader, Scholar) */}
      <TravelEventModal />

      {/* Destination Arrival Screen */}
      {travelState.state === 'ARRIVAL' && (
        <div className="destination-arrival-overlay" role="dialog">
          <div className="destination-arrival-card rpg-chapter-card">
            <div className="arrival-icon-badge">🏛️✨</div>
            <div className="arrival-tag">DESTINATION REACHED</div>
            <h2 className="arrival-city-name">{destName.toUpperCase()}</h2>
            <span className="arrival-city-type">{destInfo.type || 'Historical Trade Port & Commercial Hub'}</span>

            <p className="arrival-desc">
              Your merchant caravan has successfully crossed ancient trade highways and safely reached {destName}.
            </p>

            <div className="arrival-stats-row">
              <div className="arr-stat">
                <span>Total Days</span>
                <strong className="text-gold">{travelState.totalDays} Days</strong>
              </div>
              <div className="arr-stat">
                <span>Encounters</span>
                <strong className="text-teal">{travelState.eventsEncountered}</strong>
              </div>
              <div className="arr-stat">
                <span>Cargo Intact</span>
                <strong>{travelState.totalCargo} Units</strong>
              </div>
            </div>

            <button
              type="button"
              className="btn-enter-destination-city"
              onClick={handleArrivalContinue}
            >
              🏛️ ENTER {destName.toUpperCase()} BAZAAR →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
