import React, { useEffect, useRef } from 'react';
import { Fireworks } from 'fireworks-js';

const FireworksComponent = () => {
  const containerRef = useRef(null);
  const fireworksRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const fireworks = new Fireworks(containerRef.current, {
        maxRockets: 3,
        rocketSpawnInterval: 150,
        numParticles: 100,
        explosionMinHeight: 0.2,
        explosionMaxHeight: 0.9,
        explosionChance: 0.08,
      });
      fireworksRef.current = fireworks;
      fireworks.start();
    }

    return () => {
      if (fireworksRef.current) {
        fireworksRef.current.stop();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
};

export default FireworksComponent;
