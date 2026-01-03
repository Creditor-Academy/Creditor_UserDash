import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Volume2, VolumeX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trackSponsorAdClick } from '@/services/sponsorAdsService';

const SponsorSidebarAd = ({ ad, className }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  if (!ad) return null;

  const { id, sponsorName, title, description, ctaText, mediaUrl, mediaType } =
    ad;

  // ✅ FORCE BACKGROUND AUTOPLAY (CRITICAL FIX)
  useEffect(() => {
    if (!videoRef.current || mediaType !== 'video') return;

    const video = videoRef.current;

    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    const retry = setTimeout(tryPlay, 300); // fixes carousel timing

    return () => {
      clearTimeout(retry);
      video.pause();
    };
  }, [mediaType]);

  const handleMuteToggle = () => {
    setIsMuted(prev => {
      if (videoRef.current) {
        videoRef.current.muted = !prev;
      }
      return !prev;
    });
  };

  const handleClick = async () => {
    if (!id) return;
    await trackSponsorAdClick(id);
    navigate(`/dashboard/sponsor-ad/${id}`);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 shadow-md h-[200px]',
        className
      )}
    >
      {/* 🔹 BACKGROUND MEDIA */}
      {mediaUrl && mediaType === 'video' ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-10" />

      {/* Mute / Unmute */}
      {mediaType === 'video' && (
        <button
          onClick={handleMuteToggle}
          className="absolute top-2 right-2 z-30 bg-black/50 rounded-full p-1.5"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      {/* CONTENT */}
      <CardContent className="relative z-20 p-3 h-full flex flex-col justify-between">
        <div>
          {sponsorName && (
            <p className="text-[10px] uppercase tracking-wide text-white/90">
              {sponsorName}
            </p>
          )}
          {title && (
            <h4 className="text-sm font-bold text-white line-clamp-1">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-xs text-white/90 line-clamp-2">{description}</p>
          )}
        </div>

        {ctaText && (
          <Button
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 text-xs"
            onClick={handleClick}
          >
            {ctaText}
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SponsorSidebarAd;
