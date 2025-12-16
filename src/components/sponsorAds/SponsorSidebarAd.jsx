import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackSponsorAdClick } from '@/services/sponsorAdsService';

export const SponsorSidebarAd = ({ ad, className, isActive = true }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);

  if (!ad) return null;

  const {
    sponsorName,
    title,
    description,
    ctaText,
    ctaUrl,
    logo,
    mediaUrl,
    mediaType,
    tier,
    id,
  } = ad;

  // Handle video playback and audio detection
  useEffect(() => {
    if (!videoRef.current || mediaType !== 'video') return;

    const video = videoRef.current;

    // Check if video has audio track
    const checkAudio = () => {
      // Try multiple methods to detect audio
      // Method 1: Check audioTracks (if available)
      if (video.audioTracks && video.audioTracks.length > 0) {
        setHasAudio(true);
        return;
      }

      // Method 2: Check if video has audio by trying to detect duration and checking for audio element
      // Most videos with audio will have this property
      if (video.mozHasAudio !== undefined) {
        setHasAudio(video.mozHasAudio);
        return;
      }

      // Method 3: Assume video has audio (most videos do)
      // User can still mute/unmute - if no audio, nothing will happen
      setHasAudio(true);
    };

    // Set muted state
    video.muted = isMuted;

    // Play/pause based on active state
    if (isActive) {
      video.play().catch(err => {
        console.warn('Video autoplay failed:', err);
      });
      checkAudio();
    } else {
      video.pause();
      video.currentTime = 0; // Reset to start
    }

    // Handle video ended event to loop
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch(err => {
        console.warn('Video loop play failed:', err);
      });
    };

    // Handle loadedmetadata to check for audio
    const handleLoadedMetadata = () => {
      checkAudio();
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', checkAudio);

    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', checkAudio);
      if (!isActive) {
        video.pause();
        video.currentTime = 0;
      }
    };
  }, [isActive, isMuted, mediaType]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleClick = async e => {
    if (id) {
      try {
        await trackSponsorAdClick(id);
      } catch (error) {
        console.warn('Failed to track sponsor ad click:', error);
      }
      // Navigate to ad details page instead of opening website
      navigate(`/dashboard/sponsor-ad/${id}`);
    }
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 shadow-md h-[200px]',
        className
      )}
    >
      {/* Background Image/Video - Full Size */}
      {mediaUrl &&
        (mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            muted={isMuted}
            loop
            playsInline
            preload="auto"
            style={{
              minHeight: '200px',
              minWidth: '100%',
              display: 'block',
            }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ minHeight: '200px', minWidth: '100%' }}
          />
        ))}

      {/* Dark gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-[1]" />

      {/* Mute/Unmute button for videos with audio */}
      {mediaType === 'video' && hasAudio && (
        <button
          onClick={handleMuteToggle}
          className="absolute top-2 right-2 z-30 bg-black/50 hover:bg-black/70 rounded-full p-1.5 transition-all backdrop-blur-sm"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5 text-white" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-white" />
          )}
        </button>
      )}

      {/* All content overlaid on the media */}
      <CardContent className="relative z-10 p-2.5 sm:p-3 h-full flex flex-col justify-between min-h-[200px]">
        <div className="space-y-1">
          {/* Sponsor Name */}
          {sponsorName && (
            <p className="text-[10px] text-white/90 uppercase tracking-wider font-medium">
              {sponsorName}
            </p>
          )}

          {/* Title */}
          {title && (
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-1 drop-shadow-lg">
              {title}
            </h4>
          )}

          {/* Description */}
          {description && (
            <p className="text-[10px] sm:text-xs text-white/90 line-clamp-2 drop-shadow-md">
              {description}
            </p>
          )}
        </div>

        {/* Learn More Button */}
        {ctaText && (
          <Button
            size="sm"
            className="w-full bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-[10px] sm:text-xs px-2 py-1 mt-1.5 flex items-center justify-center gap-1"
            onClick={handleClick}
          >
            {ctaText}
            <ArrowUpRight className="w-2.5 h-2.5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorSidebarAd;
