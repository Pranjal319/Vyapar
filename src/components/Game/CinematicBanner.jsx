import React, { useEffect, useState } from 'react';
import { globalProgressManager } from '../../game/progression/ProgressManager';
import locationContent from '../../data/locationContent.json';

export default function CinematicBanner() {
  const [activeBanner, setActiveBanner] = useState(null);

  useEffect(() => {
    const unsub = globalProgressManager.onProgressChange((pState) => {
      const locId = pState.currentLocation;
      const locInfo = locationContent[locId] || {};
      const locName = locInfo.name || locId.toUpperCase();
      const locSubtitle = locInfo.role || 'HISTORICAL TRADE HUB';

      setActiveBanner({
        name: locName.toUpperCase(),
        subtitle: locSubtitle.toUpperCase()
      });

      const timer = setTimeout(() => {
        setActiveBanner(null);
      }, 2600);

      return () => clearTimeout(timer);
    });

    return unsub;
  }, []);

  if (!activeBanner) return null;

  return (
    <div className="cinematic-banner-container" role="status" aria-label="Location Arrival Banner">
      <div className="cinematic-banner-card">
        <div className="banner-line top-line"></div>
        <h1 className="banner-location-title">{activeBanner.name}</h1>
        <span className="banner-location-subtitle">{activeBanner.subtitle}</span>
        <div className="banner-line bottom-line"></div>
      </div>
    </div>
  );
}
