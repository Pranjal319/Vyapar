import React, { useEffect, useRef, useState } from 'react';
import { TradeMap } from '../../game/map/TradeMap';
import { globalTravelManager } from '../../game/travel/TravelManager';
import LocationPanel from './LocationPanel';
import TravelPrepModal from '../Travel/TravelPrepModal';
import TravelEventModal from '../Travel/TravelEventModal';
import JourneySummaryModal from '../Travel/JourneySummaryModal';

export default function TradeMapCanvas({ onEnterLocalWorld, onCloseMap, onStartTravel }) {
  const canvasRef = useRef(null);
  const tradeMapRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const lastTimeRef = useRef(performance.now());

  const [selectedLoc, setSelectedLoc] = useState(null);
  const [travelState, setTravelState] = useState(() => globalTravelManager.getState());

  const getCanvasPoint = (event, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  useEffect(() => {
    const unsubProgress = globalTravelManager.onProgress((tState) => {
      setTravelState(tState);
    });

    return () => {
      if (typeof unsubProgress === 'function') {
        unsubProgress();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tradeMap = new TradeMap(window.innerWidth, window.innerHeight);
    tradeMapRef.current = tradeMap;
    lastTimeRef.current = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      tradeMap.resize(w, h, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse Pan & Zoom Event Listeners
    const handleMouseDown = (e) => {
      if (tradeMapRef.current) {
        const point = getCanvasPoint(e, canvas);
        tradeMapRef.current.camera.startDrag(point.x, point.y);
      }
    };

    const handleMouseMove = (e) => {
      if (tradeMapRef.current) {
        const point = getCanvasPoint(e, canvas);
        if (tradeMapRef.current.camera.isDragging) {
          tradeMapRef.current.camera.drag(point.x, point.y);
        }
        const hovered = tradeMapRef.current.handleMouseMove(point.x, point.y);
        if (canvas) {
          canvas.style.cursor = hovered ? 'pointer' : (tradeMapRef.current.camera.isDragging ? 'grabbing' : 'grab');
        }
      }
    };

    const handleMouseUp = () => {
      if (tradeMapRef.current) {
        tradeMapRef.current.camera.endDrag();
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      if (tradeMapRef.current) {
        const point = getCanvasPoint(e, canvas);
        const factor = e.deltaY < 0 ? 1.1 : 0.9;
        tradeMapRef.current.camera.setZoom(
          tradeMapRef.current.camera.zoom * factor,
          point.x,
          point.y
        );
      }
    };

    const handleClick = (e) => {
      if (tradeMapRef.current && !tradeMapRef.current.camera.isDragging) {
        const point = getCanvasPoint(e, canvas);
        const loc = tradeMapRef.current.handleMouseClick(point.x, point.y);
        if (loc) {
          setSelectedLoc(loc);
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('click', handleClick);

    const renderLoop = (currentTime) => {
      if (!canvas || !ctx) return;

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      tradeMap.update(dt);
      tradeMap.render(ctx);

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (canvas) {
        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('click', handleClick);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="trade-map-container-fullscreen">
      
      {/* Strategic Map Top Bar HUD */}
      <div className="trade-map-top-bar">
        <div className="map-title-group">
          <span className="live-dot green-live-dot"></span>
          <h2 className="map-bar-title">STRATEGIC TRADE MAP OF INDIA</h2>
        </div>

        <div className="map-hud-actions">
          <button
            type="button"
            className="btn-map-control"
            onClick={() => tradeMapRef.current?.camera.zoomIn()}
            title="Zoom In"
          >
            🔍 +
          </button>
          <button
            type="button"
            className="btn-map-control"
            onClick={() => tradeMapRef.current?.camera.zoomOut()}
            title="Zoom Out"
          >
            🔍 −
          </button>
          <button
            type="button"
            className="btn-map-close"
            onClick={onCloseMap}
            title="Return to Local RPG World"
          >
            🏛️ Return to Local World (M)
          </button>
        </div>
      </div>

      {/* Travel Progress HUD Overlay (active during caravan travel) */}
      {travelState.isTravelling && (
        <div className="caravan-travel-hud" role="status" aria-label="Caravan Travel Progress">
          <div className="caravan-hud-header">
            <span className="caravan-hud-icon">🐪</span>
            <div>
              <span className="caravan-hud-title">CARAVAN TRAVELLING</span>
              <span className="caravan-hud-route">{travelState.fromLocation?.toUpperCase()} → {travelState.toLocation?.toUpperCase()}</span>
            </div>
          </div>

          <div className="caravan-progress-bar-box">
            <div
              className="caravan-progress-fill"
              style={{ width: `${travelState.percentage}%` }}
            />
          </div>

          <div className="caravan-hud-footer">
            <span>Travel Day {travelState.currentDay} / {travelState.totalDays}</span>
            <span>{travelState.percentage}% Completed</span>
          </div>
        </div>
      )}

      {/* Map Legend Overlay */}
      <div className="map-legend-card">
        <span className="legend-title">MAP LEGEND</span>
        <div className="legend-items">
          <div className="legend-item"><span className="dot dot-current"></span> Current Hub</div>
          <div className="legend-item"><span className="dot dot-unlocked"></span> Unlocked Hub</div>
          <div className="legend-item"><span className="dot dot-visited"></span> Visited Hub</div>
          <div className="legend-item"><span className="dot dot-locked"></span> Locked Hub</div>
          <div className="legend-item"><span className="line line-overland"></span> Overland Route</div>
          <div className="legend-item"><span className="line line-maritime"></span> Maritime Route</div>
        </div>
      </div>

      {/* Fullscreen HTML5 Map Canvas */}
      <canvas
        ref={canvasRef}
        className="trade-map-canvas-element"
        role="img"
        aria-label="2D Strategic Trade Map of Ancient India with Caravan Movement"
      />

      {/* Location Detail Panel Overlay */}
      {selectedLoc && (
        <LocationPanel
          location={selectedLoc}
          onClose={() => setSelectedLoc(null)}
          onEnterCity={(locId) => {
            setSelectedLoc(null);
            if (onEnterLocalWorld) onEnterLocalWorld(locId);
          }}
        />
      )}

      {/* Travel Preparation Briefing Modal */}
      <TravelPrepModal
        isOpen={travelState.state === 'PREPARING'}
        onClose={() => globalTravelManager.cancelPreparation()}
        onStartJourney={() => {
          if (onStartTravel) onStartTravel();
        }}
      />

      {/* Travel Event Decision & Outcome Overlay Modal */}
      <TravelEventModal />

      {/* Journey Completion Summary Modal */}
      <JourneySummaryModal
        isOpen={travelState.state === 'ARRIVAL'}
        onEnterLocalWorld={(locId) => {
          globalTravelManager.reset();
          if (onEnterLocalWorld) {
            onEnterLocalWorld(locId);
          }
        }}
      />

    </div>
  );
}
