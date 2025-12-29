import React, { useContext } from 'react';
import { Sparkles, Target, TrendingUp } from 'lucide-react';
import Fireworks from '@/components/Fireworks';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

export function NewYearBanner({ userName }) {
  const { activeTheme } = useContext(SeasonalThemeContext);
  return (
    <section className="newyear-hero-banner mb-8">
      {activeTheme === 'newYear' && <Fireworks />}
      <div className="newyear-hero-content">
        <p className="newyear-hero-kicker">New Year. New Skills. New You.</p>
        <h1>Welcome to 2026, {userName || 'Scholar'}!</h1>
        <p>
          Set ambitious learning goals, track your progress, and unlock your
          full potential this year. Every lesson brings you closer to success.
        </p>
        <div className="newyear-hero-cta">
          <span className="goal-pill">
            <Target className="h-4 w-4" />
            Set Learning Goals
          </span>
          <span className="progress-pill">
            <TrendingUp className="h-4 w-4" />
            Track Progress
          </span>
        </div>
      </div>
      <div className="newyear-hero-visual">
        <div className="sparkles-background" aria-hidden="true" />
        <div className="newyear-visual-content">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-w-md rounded-lg shadow-lg"
            style={{ borderRadius: '1rem' }}
          >
            <source
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/_Christmas+Poster+with+Levitating+Book+(2).mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}

export default NewYearBanner;
