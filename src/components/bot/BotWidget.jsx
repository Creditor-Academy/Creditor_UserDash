import { useState, useEffect } from 'react';
import BotWindow from './BotWindow';
import BotAvatar from './BotAvatar';
import introVideo from '@/assets/paulmichael intro.mp4';

export default function BotWidget({ onToggle }) {
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [videoDuration, setVideoDuration] = useState(15000); // Default to 15 seconds

  const handleVideoLoad = e => {
    const duration = e.target.duration * 1000; // Convert to milliseconds
    setVideoDuration(duration);
  };

  useEffect(() => {
    // Set a timeout to hide the video after it plays
    const timer = setTimeout(() => {
      setShowVideo(false);
    }, videoDuration);

    return () => clearTimeout(timer);
  }, [videoDuration]);

  const togglePanel = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    if (onToggle) {
      onToggle(newOpenState);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Bot Window */}
      {open && <BotWindow onClose={togglePanel} />}

      {/* Video Intro */}
      {showVideo && !open && (
        <div className="mt-3 bg-transparent">
          <video
            src={introVideo}
            autoPlay
            controls={false}
            onLoadedMetadata={handleVideoLoad}
            onEnded={() => setShowVideo(false)}
            className="w-[250px] h-[190px] object-cover"
          />
        </div>
      )}

      {/* Floating Avatar Toggle */}
      {!showVideo && !open && (
        <button
          onClick={togglePanel}
          className="
            mt-3
            shadow-xl
            hover:scale-105
            transition-transform
            cursor-pointer
            border-0
          "
          aria-label="Open AI Assistant"
        >
          <BotAvatar size={48} />
        </button>
      )}
    </div>
  );
}
