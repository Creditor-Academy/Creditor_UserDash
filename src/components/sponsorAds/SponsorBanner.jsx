import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackSponsorAdClick } from "@/services/sponsorAdsService";

export const SponsorBanner = ({ ad, className, isActive = false }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAudio, setHasAudio] = useState(false);

  if (!ad) return null;

  const {
    title,
    description,
    ctaText,
    ctaUrl,
    mediaUrl,
    mediaType,
    sponsorName,
    tier,
    id,
  } = ad;

  // Handle video playback and audio detection
  useEffect(() => {
    if (!videoRef.current || mediaType !== "video") return;

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
      video.play().catch((err) => {
        console.warn("Video autoplay failed:", err);
      });
      checkAudio();
    } else {
      video.pause();
      video.currentTime = 0; // Reset to start
    }

    // Handle video ended event to loop
    const handleEnded = () => {
      video.currentTime = 0;
      video.play().catch((err) => {
        console.warn("Video loop play failed:", err);
      });
    };

    // Handle loadedmetadata to check for audio
    const handleLoadedMetadata = () => {
      checkAudio();
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("canplay", checkAudio);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("canplay", checkAudio);
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

  const handleClick = async (e) => {
    if (id) {
      try {
        await trackSponsorAdClick(id);
      } catch (error) {
        console.warn("Failed to track sponsor ad click:", error);
      }
      // Navigate to ad details page instead of opening website
      navigate(`/dashboard/sponsor-ad/${id}`);
    }
  };

  const isVideo = mediaType === "video";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-blue-100 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 h-[190px]",
        className,
      )}
    >
      {/* Video or Image Background */}
      {mediaUrl && isVideo ? (
        <video
          ref={videoRef}
          src={mediaUrl}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          muted={isMuted}
          preload="auto"
        />
      ) : mediaUrl ? (
        <img
          src={mediaUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="lazy"
        />
      ) : null}

      {/* Gradient overlay - lighter for video to show content better */}
      <div
        className={cn(
          "absolute inset-0",
          isVideo
            ? "bg-gradient-to-r from-black/50 via-black/30 to-black/50"
            : "bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-transparent",
        )}
      />

      {/* Mute/Unmute button for videos with audio */}
      {isVideo && hasAudio && (
        <button
          onClick={handleMuteToggle}
          className="absolute top-3 right-3 z-30 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-all backdrop-blur-sm"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-white" />
          ) : (
            <Volume2 className="w-4 h-4 text-white" />
          )}
        </button>
      )}

      <div className="relative z-10 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 h-full">
        <div className="flex-1 text-white space-y-1.5 sm:space-y-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-xs">
              <Sparkles className="w-3 h-3" />
              {sponsorName}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-[10px] font-semibold">
              {tier} Tier
            </span>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight line-clamp-1">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-white/90 line-clamp-2 max-w-full">
            {description}
          </p>
        </div>

        {ctaText && (
          <Button
            size="sm"
            className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 flex-shrink-0 whitespace-nowrap"
            onClick={handleClick}
          >
            {ctaText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SponsorBanner;
