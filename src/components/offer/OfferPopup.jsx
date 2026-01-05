import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

const OfferPopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [hasShownOnLogin, setHasShownOnLogin] = useState(false);

  useEffect(() => {
    // Show popup automatically on every login/dashboard load
    if (!hasShownOnLogin) {
      // Show popup after 1 second delay
      setTimeout(() => {
        setIsPopupOpen(true);
        setHasShownOnLogin(true);
      }, 1000); // Delay 1 second after page load

      // Auto-close after 5 seconds
      setTimeout(() => {
        setIsPopupOpen(false);
        setShowWidget(true);
      }, 6000); // 1s delay + 5s display
    }
  }, [hasShownOnLogin]);

  const handleClose = () => {
    setIsPopupOpen(false);
    setShowWidget(true);
  };

  const handleWidgetClick = () => {
    setIsPopupOpen(true);
  };

  return (
    <>
      {/* Popup Modal */}
      {isPopupOpen && (
        <div className="offer-popup-overlay" onClick={handleClose}>
          <div
            className="offer-popup-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="offer-popup-close"
              onClick={handleClose}
              aria-label="Close offer"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/White+and+Green+Modern+Business+Growth+Poster+(1).jpg"
              alt="New Year Offer"
              className="offer-popup-image"
            />
          </div>
        </div>
      )}

      {/* Bottom-right Widget */}
      {showWidget && !isPopupOpen && (
        <button
          className="offer-widget"
          onClick={handleWidgetClick}
          aria-label="View special offer"
        >
          <div className="offer-widget-icon">
            <Gift className="h-6 w-6" />
          </div>
          <span className="offer-widget-badge">🎁</span>
        </button>
      )}
    </>
  );
};

export default OfferPopup;
