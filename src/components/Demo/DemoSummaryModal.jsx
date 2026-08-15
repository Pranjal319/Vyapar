import React from 'react';
import { globalDemoManager } from '../../game/demo/DemoManager';

export default function DemoSummaryModal({ isOpen, onReplay, onExit }) {
  if (!isOpen) return null;

  const demoState = globalDemoManager.getState();
  const stats = demoState.demoStats;
  const netProfitDisplay = stats.netProfit >= 0 ? `+${stats.netProfit}` : `${stats.netProfit}`;

  return (
    <div className="demo-summary-overlay" role="dialog" aria-label="SIH Demo Summary">
      <div className="demo-summary-card">
        <div className="demo-summary-header">
          <span className="demo-summary-badge">🏆 SIH PRESENTATION DEMO</span>
          <h2 className="demo-summary-title">VYAPAR DEMO COMPLETE</h2>
        </div>

        <div className="demo-stats-table">
          <div className="demo-stat-row">
            <span className="d-label">🗺️ Route</span>
            <strong className="d-val text-gold">{stats.route}</strong>
          </div>

          <div className="demo-stat-row">
            <span className="d-label">🛒 Goods Traded</span>
            <strong className="d-val">Textiles (Ujjain → Bharuch)</strong>
          </div>

          <div className="demo-stat-row">
            <span className="d-label">💰 Trade Result</span>
            <strong className={`d-val ${stats.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
              {netProfitDisplay} Mudras
            </strong>
          </div>
