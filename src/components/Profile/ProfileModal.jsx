import React, { useEffect, useState } from 'react';
import { globalAuthManager } from '../../game/auth/AuthManager';
import { getCharacterDetails } from '../../game/player/PlayerIdentity';

export default function ProfileModal({ isOpen, onClose, onLogout }) {
  const [stats, setStats] = useState(() => globalAuthManager.getProfileStats());
  const character = getCharacterDetails();

  useEffect(() => {
    const unsubAuth = globalAuthManager.subscribe(() => {
      setStats(globalAuthManager.getProfileStats());
    });
    return unsubAuth;
  }, []);

  if (!isOpen) return null;

  const handleAction = () => {
    if (onClose) onClose();
  };

  const handleLogoutClick = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await globalAuthManager.logout();
      if (onClose) onClose();
    }
  };

  const isProfitPositive = stats.totalProfit >= 0;

  return (
    <div className="profile-modal-overlay" role="dialog" aria-label="Merchant Profile and Journey Status">
      <div className="profile-modal-card">
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-circle">
            <img src={character.portrait} alt={character.name} className="profile-avatar-img" />
          </div>
          <div className="profile-identity">
            <div className="profile-name-row">
              <h2 className="profile-username">{stats.username}</h2>
              <span className="profile-gender-badge">{character.genderSymbol}</span>
            </div>
            <span className="profile-char-title">{character.name} • Ancient Indian Trader</span>
          </div>
        </div>

        {/* Welcome-Back & Journey Status Card */}
        <div className="welcome-journey-card">
          {stats.isNewPlayer ? (
            <div className="journey-prompt-box">
              <span className="journey-prompt-badge">✨ NEW MERCHANT</span>
              <h3>Welcome, {stats.username}!</h3>
              <p>Your trade journey begins at the ancient crossroads of <strong>Ujjain</strong>.</p>
            </div>
          ) : (
            <div className="journey-prompt-box">
              <span className="journey-prompt-badge">🗺️ JOURNEY IN PROGRESS</span>
              <h3>Welcome back, {stats.username}!</h3>
              <p>Your journey continues from <strong>{stats.currentLocation}</strong>.</p>
            </div>
          )}
        </div>

        {/* Statistics Grid */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <span className="stat-card-icon">📍</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Current Location</span>
              <strong className="stat-card-val text-gold">{stats.currentLocation}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">🪙</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Mudras (Gold)</span>
              <strong className="stat-card-val text-gold">{stats.gold}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">📚</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Knowledge</span>
              <strong className="stat-card-val">{stats.knowledge}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">📦</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Cargo</span>
              <strong className="stat-card-val">{stats.totalCargo} / {stats.inventoryCapacity}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">🗺️</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Locations Visited</span>
              <strong className="stat-card-val">{stats.visitedCount} / 5</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">📜</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Story Chapters</span>
              <strong className="stat-card-val text-gold">{stats.currentChapter || 1} / 5</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">📖</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Discovered Insights</span>
              <strong className="stat-card-val text-teal">{stats.insightsCount || 0} / 15</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">🤝</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Total Trades</span>
              <strong className="stat-card-val">{stats.totalTradesCount}</strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">🐫</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Journeys / Events</span>
              <strong className="stat-card-val text-gold">
                {stats.totalJourneys || 0} Journeys ({stats.eventsEncountered || 0} Events)
              </strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">📈</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Successful / Loss Trades</span>
              <strong className="stat-card-val text-teal">
                {stats.successfulTrades || 0} / {stats.lossTrades || 0}
              </strong>
            </div>
          </div>

          <div className="profile-stat-card">
            <span className="stat-card-icon">💰</span>
            <div className="stat-card-info">
              <span className="stat-card-label">Total Net Profit</span>
              <strong className={`stat-card-val ${isProfitPositive ? 'text-profit' : 'text-loss'}`}>
                {isProfitPositive ? `+${stats.totalProfit}` : stats.totalProfit} Mudras
              </strong>
            </div>
          </div>
        </div>

        {/* Visited Locations Badges */}
        <div className="visited-hubs-bar">
          <span className="visited-hubs-title">REALM TRADE HUBS:</span>
          <div className="visited-hubs-pills">
            {['ujjain', 'bharuch', 'muziris', 'madurai', 'pataliputra'].map((locId) => {
              const isVisited = stats.visitedLocations.includes(locId);
              const nameCapitalized = locId.charAt(0).toUpperCase() + locId.slice(1);
              return (
                <span
                  key={locId}
                  className={`hub-visited-tag ${isVisited ? 'tag-visited' : 'tag-locked'}`}
                >
                  {nameCapitalized} {isVisited ? '✓' : '🔒'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Profile Footer Actions */}
        <div className="profile-modal-actions">
          <button
            type="button"
            className="btn-resume-journey"
            onClick={handleAction}
          >
            {stats.isNewPlayer ? 'BEGIN JOURNEY →' : 'CONTINUE JOURNEY →'}
          </button>

          <button
            type="button"
            className="btn-profile-logout"
            onClick={handleLogoutClick}
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
