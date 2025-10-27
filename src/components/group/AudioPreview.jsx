import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Send, Play, Pause, Volume2 } from "lucide-react";

export function AudioPreview({ 
  audioFile, 
  onSend, 
  onCancel, 
  isSending = false 
}) {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  React.useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      
      // Cleanup function to revoke the object URL
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [audioFile]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioFile || !audioUrl) return null;

  return (
    <div className="border-t bg-gray-50 p-4 flex-shrink-0">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">Audio Preview</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700 mb-1">
                {audioFile.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
          </div>
          
          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSend}
            disabled={isSending}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
          >
            {isSending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Send Audio
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AudioPreview;
