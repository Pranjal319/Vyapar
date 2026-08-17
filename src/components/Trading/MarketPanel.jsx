import React, { useEffect, useState } from 'react';
import goodsData from '../../data/goods.json';
import marketsData from '../../data/markets.json';
import { globalTradeManager } from '../../game/trading/TradeManager';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import { MarketEngine } from '../../game/trading/MarketEngine';

export default function MarketPanel() {
  const [tradeState, setTradeState] = useState(() => globalTradeManager.getState());
  const [currentLocationId, setCurrentLocationId] = useState(() => globalProgressManager.currentLocation || 'ujjain');
  const [selectedGoodId, setSelectedGoodId] = useState('textile');

  useEffect(() => {
    const unsubTrade = globalTradeManager.subscribe(setTradeState);
    const unsubProgress = globalProgressManager.onProgressChange(pState => {
      setCurrentLocationId(pState.currentLocation);
    });

    return () => {
      unsubTrade();
      unsubProgress();
    };
  }, []);

  // Keyboard shortcut listener (ESC to close market)
  useEffect(() => {
    if (!tradeState.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        if (tradeState.lastTradeResult) {
          globalTradeManager.clearTradeResult();
        } else {
          globalTradeManager.closeMarket();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [tradeState.isOpen, tradeState.lastTradeResult]);

  if (!tradeState.isOpen) return null;

  const currentLocKey = currentLocationId.toLowerCase();
  const currentMarket = marketsData[currentLocKey] || marketsData['pataliputra'];
  const availableGoodsList = currentMarket.availableGoods || goodsData.map(g => g.id);

  // Each location specializes in certain goods for sale; all goods can be sold to local buyers
  const displayedGoods = tradeState.activeTab === 'buy'
    ? goodsData.filter(g => availableGoodsList.includes(g.id))
    : goodsData;

  const activeGoodId = displayedGoods.some(g => g.id === selectedGoodId)
    ? selectedGoodId
    : (displayedGoods[0]?.id || goodsData[0].id);

  const selectedGood = goodsData.find(g => g.id === activeGoodId) || goodsData[0];
  const marketInfo = MarketEngine.getMarketInfo(selectedGood, currentLocKey);

  const ownedQty = tradeState.inventory[selectedGood.id]?.quantity || 0;
  const ownedTotalCost = tradeState.inventory[selectedGood.id]?.totalCost || 0;
  const avgCostUnit = ownedQty > 0 ? Math.round(ownedTotalCost / ownedQty) : 0;

  // Selected quantity for buy/sell
  const selectedBuyQty = tradeState.selectedBuyQuantities[selectedGood.id] || 1;
  const selectedSellQty = Math.min(tradeState.selectedSellQuantities[selectedGood.id] || 1, Math.max(1, ownedQty));

  // Profit / Loss calculation preview before selling
  const sellRevenuePreview = marketInfo.sellPrice * selectedSellQty;
  const costPreview = avgCostUnit * selectedSellQty;
  const profitPreview = sellRevenuePreview - costPreview;

  const handleBuy = (goodId = selectedGood.id) => {
    globalTradeManager.buyGood(goodId, currentLocationId);
    if (typeof window !== 'undefined') {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.playTradeBuy();
      });
      import('../../game/fx/ParticleSystem').then(({ globalParticleSystem }) => {
        globalParticleSystem.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `-${marketInfo.buyPrice * selectedBuyQty} Mudras`, 'gold');
      });
    }
  };

  const handleSell = (goodId = selectedGood.id) => {
    globalTradeManager.sellGood(goodId, currentLocationId);
    if (typeof window !== 'undefined') {
      import('../../game/audio/AudioManager').then(({ globalAudioManager }) => {
        globalAudioManager.playTradeSell();
      });
      import('../../game/fx/ParticleSystem').then(({ globalParticleSystem }) => {
        const sign = profitPreview >= 0 ? '+' : '';
        globalParticleSystem.spawnFloatingText(window.innerWidth / 2, window.innerHeight / 2, `💰 ${sign}${profitPreview} Mudras`, 'gold');
      });
    }
  };

  const cargoPercent = Math.min(100, Math.round((tradeState.totalCargo / tradeState.inventoryCapacity) * 100));

  return (
    <div className="market-panel-overlay" role="dialog" aria-label="Regional Merchant Market">
      <div className="market-panel-card rpg-merchant-window">
        
        {/* Market Header Bar */}
        <div className="market-header">
          <div className="merchant-identity">
            <span className="merchant-avatar-icon">👳‍♂️</span>
            <div className="merchant-title-group">
              <h2 className="merchant-name">{tradeState.merchantName}</h2>
              <span className="merchant-subtitle">{tradeState.merchantTitle} • {currentLocationId.toUpperCase()} BAZAAR</span>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-market"
            onClick={() => globalTradeManager.closeMarket()}
            title="Close [ESC]"
          >
            ✕ ESC
          </button>
        </div>

        {/* Financial & Cargo Visual Bar HUD */}
        <div className="market-hud-stats">
          <div className="market-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon">🪙</span>
              <span className="stat-label">MUDRAS BALANCE</span>
            </div>
            <div className="stat-value text-gold">{tradeState.gold} Mudras</div>
          </div>

          <div className="market-stat-card cargo-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon">📦</span>
              <span className="stat-label">CARGO CAPACITY</span>
            </div>
            <div className="cargo-stat-row">
              <span className={`stat-value ${tradeState.totalCargo >= tradeState.inventoryCapacity ? 'text-danger' : 'text-teal'}`}>
                {tradeState.totalCargo} / {tradeState.inventoryCapacity}
              </span>
              <span className="cargo-percent-label">{cargoPercent}%</span>
            </div>
            <div className="cargo-progress-track">
              <div
                className={`cargo-progress-fill ${tradeState.totalCargo >= tradeState.inventoryCapacity ? 'fill-full' : ''}`}
                style={{ width: `${cargoPercent}%` }}
              />
            </div>
          </div>

          <div className="market-stat-card">
            <div className="stat-card-header">
              <span className="stat-icon">⭐</span>
              <span className="stat-label">MERCHANT REPUTATION</span>
            </div>
            <div className="stat-value text-gold">★ {tradeState.reputation || 0}</div>
          </div>
        </div>

        {/* Trade Tab Switcher (Buy / Sell / Inventory) */}
        <div className="market-tab-switcher">
          <button
            type="button"
            className={`tab-btn ${tradeState.activeTab === 'buy' ? 'tab-active' : ''}`}
            onClick={() => globalTradeManager.setActiveTab('buy')}
          >
            🛍️ BUY GOODS
          </button>
          <button
            type="button"
            className={`tab-btn ${tradeState.activeTab === 'sell' ? 'tab-active' : ''}`}
            onClick={() => globalTradeManager.setActiveTab('sell')}
          >
            ⚖️ SELL CARGO
          </button>
          <button
            type="button"
            className={`tab-btn ${tradeState.activeTab === 'inventory' ? 'tab-active' : ''}`}
            onClick={() => globalTradeManager.setActiveTab('inventory')}
          >
            📦 CARAVAN INVENTORY ({tradeState.totalCargo})
          </button>
        </div>

        {/* BUY / SELL Commodity List View */}
        {tradeState.activeTab !== 'inventory' ? (
          <div className="market-body-split">
            {/* Commodities List Grid */}
            <div className="market-goods-grid">
              {displayedGoods.map(good => {
                const info = MarketEngine.getMarketInfo(good, currentLocKey);
                const isSelected = good.id === activeGoodId;
                const owned = tradeState.inventory[good.id]?.quantity || 0;
                const price = tradeState.activeTab === 'buy' ? info.buyPrice : info.sellPrice;

                return (
                  <button
                    type="button"
                    key={good.id}
                    className={`good-selector-card ${isSelected ? 'good-card-selected' : ''}`}
                    onClick={() => setSelectedGoodId(good.id)}
                  >
                    <div className="good-card-top">
                      <span className="good-card-icon">{good.icon}</span>
                      <span className="good-card-name">{good.name}</span>
                    </div>
                    <div className="good-card-bottom">
                      <span className="good-card-price">
                        {price} Mudras
                      </span>
                      <span className="good-card-demand">{info.demandLevel}</span>
                    </div>
                    {owned > 0 && <span className="good-card-owned-badge">x{owned} in Cargo</span>}
                  </button>
                );
              })}
            </div>

            {/* Trade Action Detail Panel */}
            <div className="market-action-panel">
              {/* Item Info Header */}
              <div className="action-item-info">
                <div className="item-title-row">
                  <span className="item-large-icon">{selectedGood.icon}</span>
                  <div className="item-text-group">
                    <h3 className="item-name">{selectedGood.name.toUpperCase()}</h3>
                    <p className="item-desc">{selectedGood.description}</p>
                  </div>
                </div>

                <div className="item-market-metrics">
                  <div className="metric-box">
                    <span className="metric-label">REGIONAL DEMAND</span>
                    <span className="metric-value text-gold">{marketInfo.demandFormatted}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">LOCAL SUPPLY</span>
                    <span className="metric-value text-teal">{marketInfo.supplyLevel}</span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="action-controls-box">
                {tradeState.activeTab === 'buy' ? (
                  <>
                    <div className="price-display-box">
                      <span className="price-display-label">PRICE PER UNIT</span>
                      <span className="price-display-value text-gold">{marketInfo.buyPrice} Mudras</span>
                    </div>

                    <div className="quantity-control-section">
                      <span className="qty-section-label">SELECT QUANTITY:</span>
                      <div className="quantity-selector-bar">
                        <button
                          type="button"
                          className="btn-qty"
                          onClick={() => globalTradeManager.adjustQuantity(selectedGood.id, -1, 'buy')}
                        >
                          −
                        </button>
                        <span className="qty-value">{selectedBuyQty}</span>
                        <button
                          type="button"
                          className="btn-qty"
                          onClick={() => globalTradeManager.adjustQuantity(selectedGood.id, +1, 'buy')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="total-cost-summary">
                      <span className="total-label">TOTAL COST:</span>
                      <span className="total-value text-gold">{marketInfo.buyPrice * selectedBuyQty} Mudras</span>
                    </div>

                    <button
                      type="button"
                      className="btn-trade-execute btn-buy-execute"
                      onClick={() => handleBuy(selectedGood.id)}
                    >
                      🛍️ BUY {selectedBuyQty} × {selectedGood.name.toUpperCase()}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="price-display-box">
                      <span className="price-display-label">CURRENT SELLING PRICE</span>
                      <span className="price-display-value text-gold">{marketInfo.sellPrice} Mudras</span>
                    </div>

                    <div className="owned-cost-summary">
                      <div className="owned-row">
                        <span className="owned-label">IN CARGO:</span>
                        <span className="owned-val">{ownedQty} Units</span>
                      </div>
                      <div className="owned-row">
                        <span className="owned-label">AVG BOUGHT COST:</span>
                        <span className="owned-val">{avgCostUnit} Mudras</span>
                      </div>
                    </div>

                    <div className="quantity-control-section">
                      <span className="qty-section-label">SELECT QUANTITY TO SELL:</span>
                      <div className="quantity-selector-bar">
                        <button
                          type="button"
                          className="btn-qty"
                          disabled={ownedQty === 0}
                          onClick={() => globalTradeManager.adjustQuantity(selectedGood.id, -1, 'sell')}
                        >
                          −
                        </button>
                        <span className="qty-value">{selectedSellQty}</span>
                        <button
                          type="button"
                          className="btn-qty"
                          disabled={ownedQty === 0}
                          onClick={() => globalTradeManager.adjustQuantity(selectedGood.id, +1, 'sell')}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Profit / Loss Preview Before Selling */}
                    {ownedQty > 0 && (
                      <div className={`profit-preview-box ${profitPreview >= 0 ? 'preview-profit' : 'preview-loss'}`}>
                        <div className="preview-row">
                          <span>TOTAL REVENUE:</span>
                          <span className="text-gold">{sellRevenuePreview} Mudras</span>
                        </div>
                        <div className="preview-row preview-total">
                          <span>ESTIMATED {profitPreview >= 0 ? 'PROFIT' : 'LOSS'}:</span>
                          <strong className={profitPreview >= 0 ? 'text-success' : 'text-danger'}>
                            {profitPreview >= 0 ? `+${profitPreview}` : profitPreview} Mudras
                          </strong>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn-trade-execute btn-sell-execute"
                      disabled={ownedQty <= 0}
                      onClick={() => handleSell(selectedGood.id)}
                    >
                      ⚖️ SELL {selectedSellQty} × {selectedGood.name.toUpperCase()}
                    </button>
                  </>
                )}

                {/* Toast Feedback Notification */}
                {tradeState.toast && (
                  <div className={`market-toast ${tradeState.toast.isError ? 'toast-error' : 'toast-success'}`}>
                    {tradeState.toast.isError ? '⚠️ ' : '✅ '} {tradeState.toast.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Proper RPG Inventory Tab */
          <div className="rpg-inventory-tab-view">
            <div className="inventory-summary-header">
              <div className="inv-header-title">
                <span className="inv-header-icon">📦</span>
                <h3>CARAVAN CARGO MANIFEST</h3>
              </div>
              <span className="inv-capacity-tag">
                Used: <strong>{tradeState.totalCargo} / {tradeState.inventoryCapacity} slots</strong>
              </span>
            </div>

            {tradeState.totalCargo === 0 ? (
              <div className="empty-inventory-state">
                <span className="empty-icon">🎒</span>
                <p className="empty-title">Your caravan cargo is currently empty.</p>
                <p className="empty-desc">Purchase trade goods in the Bazaar to transport and sell across ancient trade routes.</p>
                <button
                  type="button"
                  className="btn-go-buy"
                  onClick={() => globalTradeManager.setActiveTab('buy')}
                >
                  🛍️ Go to Buy Commodities →
                </button>
              </div>
            ) : (
              <div className="inventory-items-table">
                <div className="inv-table-header">
                  <span>GOOD</span>
                  <span>QTY</span>
                  <span>BOUGHT PRICE</span>
                  <span>CURRENT VALUE</span>
                  <span>ACTION</span>
                </div>
                {goodsData.map(good => {
                  const invItem = tradeState.inventory[good.id];
                  if (!invItem || invItem.quantity <= 0) return null;
                  const curMarket = MarketEngine.getMarketInfo(good, currentLocKey);
                  const curValUnit = curMarket.sellPrice;
                  const avgBought = Math.round(invItem.totalCost / invItem.quantity) || 0;
                  const profitUnit = curValUnit - avgBought;

                  return (
                    <div key={good.id} className="inv-table-row">
                      <div className="inv-good-col">
                        <span className="inv-icon">{good.icon}</span>
                        <div className="inv-good-text">
                          <strong className="inv-good-name">{good.name}</strong>
                          <small className="inv-good-desc">{good.description}</small>
                        </div>
                      </div>
                      <div className="inv-qty-col">
                        <span className="qty-badge">x{invItem.quantity}</span>
                      </div>
                      <div className="inv-bought-col">
                        <span>{avgBought} Mudras</span>
                      </div>
                      <div className="inv-value-col">
                        <span className="text-gold">{curValUnit} Mudras</span>
                        <small className={profitUnit >= 0 ? 'text-success' : 'text-danger'}>
                          ({profitUnit >= 0 ? `+${profitUnit}` : profitUnit} diff)
                        </small>
                      </div>
                      <div className="inv-action-col">
                        <button
                          type="button"
                          className="btn-quick-sell"
                          onClick={() => {
                            setSelectedGoodId(good.id);
                            globalTradeManager.setActiveTab('sell');
                          }}
                        >
                          ⚖️ Sell at Bazaar →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Trade Result Summary Overlay Modal */}
        {tradeState.lastTradeResult && (
          <div className="trade-result-overlay" role="dialog">
            <div className="trade-result-card rpg-compact-notification">
              <span className="result-icon">{tradeState.lastTradeResult.profit >= 0 ? '🎉' : '📉'}</span>
              <h3 className="result-title">
                {tradeState.lastTradeResult.profit >= 0 ? 'TRADE COMPLETE' : 'TRADE COMPLETED'}
              </h3>
              <p className="result-text">
                {tradeState.lastTradeResult.goodName} x{tradeState.lastTradeResult.quantity} sold
              </p>

              <div className="result-metrics-grid">
                <div className="res-metric-item">
                  <span className="res-label">Revenue:</span>
                  <span className="res-val text-gold">{tradeState.lastTradeResult.saleRevenue} Mudras</span>
                </div>
                <div className="res-metric-item">
                  <span className="res-label">Cost:</span>
                  <span className="res-val">{tradeState.lastTradeResult.buyCost} Mudras</span>
                </div>
                <div className="res-metric-item">
                  <span className="res-label">Profit:</span>
                  <span className={`res-val ${tradeState.lastTradeResult.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                    {tradeState.lastTradeResult.profit >= 0 ? `+${tradeState.lastTradeResult.profit}` : tradeState.lastTradeResult.profit} Mudras
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="btn-close-result"
                onClick={() => globalTradeManager.clearTradeResult()}
              >
                CONTINUE TRADING →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
