import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSponsorAds from '@/hooks/useSponsorAds';
import SponsorBanner from './SponsorBanner';

export function SponsorBannerCarousel() {
  const { ads, loading, trackImpression, trackClick } =
    useSponsorAds('dashboard_banner');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [fadeKey, setFadeKey] = useState(0);
  const adsLengthRef = useRef(ads?.length || 0);

  // Update ref when ads change
  useEffect(() => {
    adsLengthRef.current = ads?.length || 0;
  }, [ads?.length]);

  // Auto-advance carousel every 2 seconds
  useEffect(() => {
    const adsLength = adsLengthRef.current;

    if (!isAutoPlaying || !ads || adsLength <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % adsLength;
        setFadeKey(k => k + 1); // Force re-render for fade effect
        return nextIndex;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [ads, isAutoPlaying]);

  // Track impression when ad changes
  useEffect(() => {
    if (ads && ads[currentIndex] && trackImpression) {
      trackImpression(ads[currentIndex].id);
    }
  }, [currentIndex, ads, trackImpression]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (loading || !ads || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(prev => {
      const newIndex = (prev - 1 + ads.length) % ads.length;
      setFadeKey(k => k + 1);
      return newIndex;
    });
  };

  const goToNext = () => {
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % ads.length;
      setFadeKey(k => k + 1);
      return newIndex;
    });
  };

  const goToSlide = index => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setFadeKey(k => k + 1);
  };

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner with fade transition */}
      <div className="relative overflow-hidden rounded-2xl h-full">
        <div
          key={`${currentAd.id}-${fadeKey}`}
          className="transition-opacity duration-500 ease-in-out opacity-100"
        >
          <SponsorBanner
            ad={currentAd}
            onImpression={trackImpression}
            onClick={trackClick}
          />
        </div>
      </div>

      {/* Navigation Arrows - only show if multiple ads */}
      {ads.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full h-10 w-10"
            onClick={goToPrevious}
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full h-10 w-10"
            onClick={goToNext}
            aria-label="Next ad"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots Indicator - only show if multiple ads */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SponsorBannerCarousel;
