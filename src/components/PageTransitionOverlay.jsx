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
      if (pathname === "/faq") return "RESOURCES";
      
      // Split the path and get the last segment
      const pathSegments = pathname.split('/').filter(segment => segment !== '');
      const lastSegment = pathSegments[pathSegments.length - 1];
      
      // Convert UUIDs or long IDs to more readable format
      if (lastSegment && lastSegment.length > 20) {
        return "COURSE";
      }
      
      return lastSegment ? lastSegment.replace(/-/g, " ").toUpperCase() : "PAGE";
    };

    // Normalize path (remove trailing slash) for matching
    const normalizedPath = (() => {
      const withoutTrailing = location.pathname.replace(/\/+$/, "");
      return withoutTrailing === "" ? "/" : withoutTrailing;
    })();

    // Whitelist only these routes for overlay
    const allowedPaths = new Set(["/", "/about", "/contact", "/faq", "/features", "/whyus", "/product", "/plans"]);

    // Hide overlay for non-whitelisted routes or login explicitly
    if (location.pathname === "/login" || !allowedPaths.has(normalizedPath)) {
      setVisible(false);
      return;
    }

    setPageName(formatName(normalizedPath));
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
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #000000;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          pointer-events: none;
        }
         
         .overlay-text {
           color: rgba(255, 255, 255, 0.95);
           font-size: 3rem;
           font-weight: 700;
           letter-spacing: 0.15em;
           text-transform: uppercase;
           opacity: 1;
           transform: translateY(0);
           transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
           will-change: transform, opacity;
           text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
           background: linear-gradient(135deg, 
             rgba(255, 255, 255, 0.9) 0%, 
             rgba(255, 255, 255, 0.7) 100%
           );
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
           background-clip: text;
           filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.2));
         }
         
         .overlay-text.animate-out {
           opacity: 0;
           transform: translateY(-100px) scale(0.9);
         }
         
         @media (max-width: 768px) {
           .overlay-text {
             font-size: 2.2rem;
             letter-spacing: 0.1em;
           }
           
           .page-transition::before {
             width: 250%;
             height: 80px;
             bottom: -40px;
           }
           
           .page-transition::after {
             width: 200%;
             height: 50px;
             bottom: -25px;
           }
         }
         
         @media (max-width: 480px) {
           .overlay-text {
             font-size: 1.8rem;
             letter-spacing: 0.08em;
           }
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
