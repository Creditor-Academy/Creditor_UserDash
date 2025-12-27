import React from 'react';
import { Sparkles, Target, TrendingUp } from 'lucide-react';

export function NewYearBanner({ userName }) {
  return (
    <section className="newyear-hero-banner mb-8">
      <div className="newyear-hero-content">
        <p className="newyear-hero-kicker">New Year. New Skills. New You.</p>
        <h1>
          Welcome to {new Date().getFullYear()}, {userName || 'Scholar'}! 🎯
        </h1>
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
          <Sparkles className="h-24 w-24 text-yellow-400 opacity-60" />
        </div>
      </div>
    </section>
  );
}

export default NewYearBanner;
