import React, { useContext } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { SeasonalThemeContext } from '@/contexts/SeasonalThemeContext';

export function NewYearBanner({ userName }) {
  const { activeTheme } = useContext(SeasonalThemeContext);
  return (
    <section className="newyear-hero-banner mb-8">
      <div className="newyear-hero-content">
        <div className="newyear-year-badge">
          <span>2026</span>
        </div>
        <p className="newyear-hero-kicker">New Year. New Skills. New You.</p>
        <h1>Welcome to 2026, {userName || 'Scholar'}!</h1>
        <p>
          Set ambitious learning goals, track your progress, and unlock your
          full potential this year. Every lesson brings you closer to success.
        </p>
      </div>
      <div className="newyear-hero-visual">
        <div className="newyear-visual-content">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto max-w-md rounded-xl shadow-2xl"
          >
            <source
              src="https://athena-user-assets.s3.eu-north-1.amazonaws.com/Upcoming_events_Banner/_Christmas+Poster+with+Levitating+Book+(2).mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <div className="newyear-kid-image">
        <img
          src="https://lesson-banners.s3.us-east-1.amazonaws.com/ChatGPT+Image+Dec+30%2C+2025%2C+03_23_34+PM+-+Edited.png"
          alt="Kid dragging 2026"
          className="newyear-kid-img"
        />
      </div>
    </section>
  );
}

export default NewYearBanner;
