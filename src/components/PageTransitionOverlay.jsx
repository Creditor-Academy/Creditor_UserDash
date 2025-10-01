import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function PageTransitionOverlay() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [pageName, setPageName] = useState("");

  useEffect(() => {
    const formatName = (pathname) => {
      if (pathname === "/") return "HOME";
      return pathname.replace("/", "").replace(/-/g, " ").toUpperCase();
    };

    // Don't show overlay for login page
    if (location.pathname === "/login") {
      setVisible(false);
      return;
    }

    setPageName(formatName(location.pathname));
    setVisible(true);
    setAnimateOut(false);

    // Wait 1s to show overlay, then animate it out smoothly over 0.5s
    const timeoutOut = setTimeout(() => setAnimateOut(true), 1000);

    // Remove overlay completely after animation completes (1.5s total)
    const timeoutHide = setTimeout(() => setVisible(false), 1500);

    return () => {
      clearTimeout(timeoutOut);
      clearTimeout(timeoutHide);
    };
  }, [location]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        .page-transition {
          position: fixed;
          inset: 0;
          background: black;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          pointer-events: none;
        }
        .overlay-text {
          color: white;
          font-size: 3rem;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          opacity: 1;
          transform: translateY(0);
          transition: transform 0.5s ease, opacity 0.5s ease;
          will-change: transform, opacity;
        }
        .overlay-text.animate-out {
          opacity: 0;
          transform: translateY(-80px);
        }
      `}</style>
      <div className="page-transition">
        <div className={`overlay-text${animateOut ? " animate-out" : ""}`}>
          {pageName}
        </div>
      </div>
    </>
  );
}
