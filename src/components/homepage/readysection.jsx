import React, { useRef, useEffect, useState } from "react";

export default function Ready() {
  const sectionRef = useRef();
  const leftPupil = useRef();
  const rightPupil = useRef();
  const [showText, setShowText] = useState(false);
  const [showEyes, setShowEyes] = useState(false);

  // Intersection Observer for scroll-based reveal with ease
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowText(true);
          setTimeout(() => setShowEyes(true), 700);
        }
      },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Smoothed Eye-follow motion using requestAnimationFrame for fluidity
  useEffect(() => {
    if (!showEyes) return;

    let rafId = null;

    const state = {
      mouseX: 0,
      mouseY: 0,
      eyes: []
    };

    if (sectionRef.current && leftPupil.current && rightPupil.current) {
      const sectionBounds = sectionRef.current.getBoundingClientRect();

      state.eyes = [
        {
          eye: leftPupil.current.parentElement,
          pupil: leftPupil.current,
          currX: 0,
          currY: 0,
          targetX: 0,
          targetY: 0
        },
        {
          eye: rightPupil.current.parentElement,
          pupil: rightPupil.current,
          currX: 0,
          currY: 0,
          targetX: 0,
          targetY: 0
        }
      ];

      // Mouse move handler updates target pupil positions instantly
      const onMouseMove = e => {
        state.mouseX = e.clientX - sectionBounds.left;
        state.mouseY = e.clientY - sectionBounds.top;

        state.eyes.forEach(({ eye, targetX, targetY, pupil }, i, arr) => {
          const eyeRect = eye.getBoundingClientRect();
          const eyeCenterX = eyeRect.left + eyeRect.width / 2 - sectionBounds.left;
          const eyeCenterY = eyeRect.top + eyeRect.height / 2 - sectionBounds.top;
          const dx = state.mouseX - eyeCenterX;
          const dy = state.mouseY - eyeCenterY;
          const distance = Math.min(Math.hypot(dx, dy), 32);
          const angle = Math.atan2(dy, dx);

          arr[i].targetX = Math.cos(angle) * distance;
          arr[i].targetY = Math.sin(angle) * distance;
        });
      };

      // Animation loop gradually moves pupils from current pos => target pos
      const animate = () => {
        state.eyes.forEach(eyeState => {
          // Smooth easing (lerp)
          eyeState.currX += (eyeState.targetX - eyeState.currX) * 0.15;
          eyeState.currY += (eyeState.targetY - eyeState.currY) * 0.15;
          eyeState.pupil.style.transform = `translate(${eyeState.currX}px, ${eyeState.currY}px)`;
        });
        rafId = requestAnimationFrame(animate);
      };

      sectionRef.current.addEventListener("mousemove", onMouseMove);

      animate();

      return () => {
        sectionRef.current.removeEventListener("mousemove", onMouseMove);
        if (rafId) cancelAnimationFrame(rafId);
        // Reset pupils
        state.eyes.forEach(eye => {
          eye.pupil.style.transform = "translate(0,0)";
        });
      };
    }
  }, [showEyes]);

  return (
    <section ref={sectionRef} className="ready-hero">
      <style>{`
        .ready-hero {
          min-height: 100vh;
          background: #74A8FF;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          padding: 0 2vw;
        }
        .ready-text {
          font-family: 'Montserrat', Arial, sans-serif;
          font-weight: 900;
          font-size: 8vw;
          text-align: center;
          letter-spacing: -0.03em;
          color: #191919;
          line-height: 0.92;
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.9s cubic-bezier(.5,.01,.17,1),
            transform 0.9s cubic-bezier(.5,.01,.17,1);
          will-change: opacity, transform;
        }
        .ready-text.show {
          opacity: 1;
          transform: translateY(0);
        }
        .eyes-row {
          display: flex;
          flex-direction: row;
          gap: 2vw;
          justify-content: center;
          margin: 0.9vw 0 0.9vw 0;
          opacity: 0;
          transform: translateY(-35px) scale(0.85);
          transition:
            opacity 0.85s 0.15s cubic-bezier(.5,.01,.17,1),
            transform 0.95s 0.15s cubic-bezier(.55,1.2,.31,1);
          will-change: opacity, transform;
        }
        .eyes-row.show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .eye {
          background: #fff;
          border: 4px solid #21212199;
          border-radius: 50%;
          width: 10vw;
          height: 10vw;
          min-width: 120px;
          min-height: 120px;
          max-width: 180px;
          max-height: 180px;
          box-shadow: 0 3px 30px #222a;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          filter: drop-shadow(0 0 2px #0006);
        }
        .pupil {
          background: #181818;
          border-radius: 50%;
          width: 5vw;
          height: 5vw;
          min-width: 54px;
          min-height: 54px;
          max-width: 80px;
          max-height: 80px;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          transition: transform 0.13s cubic-bezier(.8,.1,.2,1);
          z-index: 2;
          box-shadow:
            inset 0 8px 10px #6669,
            0 8px 15px #111f;
          display: flex;
          align-items: flex-start;
          justify-content: flex-start;
          will-change: transform;
        }
        .pupil-reflection {
          background: #fff;
          border-radius: 50%;
          width: 1vw;
          height: 1vw;
          min-width: 18px;
          min-height: 18px;
          max-width: 22px;
          max-height: 22px;
          opacity: 0.95;
          box-shadow: 0 0 5px #fff6;
          position: absolute;
          left: 18%;
          top: 21%;
          z-index: 3;
          filter: drop-shadow(0 0 1px #fff9);
        }
        .ready-btn {
          background: #191919;
          color: #fff;
          font-weight: 900;
          font-size: 1.75rem;
          border-radius: 14px;
          padding: 24px 50px;
          border: none;
          margin-top: 2.8vw;
          transition: background 0.22s ease, box-shadow 0.22s ease;
          cursor: pointer;
          box-shadow: 0 4px 25px #1118;
          user-select: none;
        }
        .ready-btn:hover {
          background: #222222;
          box-shadow: 0 4px 40px #111d;
        }
        @media (max-width: 700px) {
          .ready-text { font-size: 14vw; }
          .eye { min-width: 77px; min-height: 77px; }
          .pupil { min-width: 32px; min-height: 32px; }
          .ready-btn {
            padding: 16px 38px;
            font-size: 1.4rem;
            margin-top: 4vw;
          }
        }
      `}</style>

      <div className={`ready-text${showText ? " show" : ""}`}>
        READY
      </div>

      <div className={`eyes-row${showEyes ? " show" : ""}`}>
        <div className="eye">
          <div ref={leftPupil} className="pupil">
            <div className="pupil-reflection" />
          </div>
        </div>
        <div className="eye">
          <div ref={rightPupil} className="pupil">
            <div className="pupil-reflection" />
          </div>
        </div>
      </div>

      <div className={`ready-text${showText ? " show" : ""}`}
           style={{ marginTop: "-1vw" }}>
        TO START<br />YOUR JOURNEY
      </div>

      <button className="ready-btn">START FREE TRIAL</button>
    </section>
  );
}
