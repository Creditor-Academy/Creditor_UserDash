import React, { useState, useEffect } from 'react';
import NewYearPopup from './NewYearPopup';

const NewYearCountdown = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Force show popup for testing - REMOVE THIS IN PRODUCTION
    setShowPopup(true);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
    // Mark as shown today
    const today = new Date().toDateString();
    localStorage.setItem('newYearPopupLastShown', today);
  };

  return (
    <>
      {showPopup && <NewYearPopup onClose={handleClosePopup} />}
    </>
  );
};

export default NewYearCountdown;
