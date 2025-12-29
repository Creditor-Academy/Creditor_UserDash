import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Mic, MessageSquare, Volume2, X } from 'lucide-react';
import PaulImage from './paulmichael.png';

/**
 * FloatingMiniChatbot
 * Minimal floating UI with transparent background showing only the provided image.
 */
const FloatingMiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [micStatus, setMicStatus] = useState('idle'); // idle | prompt | allowed | denied
  const [micMuted, setMicMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 - 260 : 200,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 - 150 : 200,
  }));
  const dragOffset = useRef({ x: 0, y: 0 });
  const viewport = useRef({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const requestMicPermission = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicStatus('denied');
      return;
    }
    setMicStatus('prompt');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStatus('allowed');
      setMicMuted(false);
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setMicStatus('denied');
    }
  };

  const handleToggleMic = async () => {
    if (micStatus !== 'allowed') {
      await requestMicPermission();
      return;
    }
    setMicMuted(prev => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      viewport.current = {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleMouseMove = e => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const startDrag = e => {
    if (isFullscreen) return;
    // Allow dragging from any area unless a control stops propagation
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const centerModal = (width, height) => {
    setPosition({
      x: Math.max((viewport.current.w - width) / 2, 12),
      y: Math.max((viewport.current.h - height) / 2, 12),
    });
  };

  const handleOpen = () => {
    setIsChatOpen(false);
    setIsOpen(true);
    setIsFullscreen(false);
    centerModal(baseWidth, baseHeight);
    requestMicPermission();
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsChatOpen(false);
    setIsFullscreen(false);
  };

  const baseWidth = isChatOpen ? 880 : 640;
  const baseHeight = isChatOpen ? 420 : 360;
  const fullscreenWidth = Math.min(
    viewport.current.w - 60,
    isChatOpen ? 1200 : 1100
  );
  const fullscreenHeight = Math.min(
    viewport.current.h - 80,
    isChatOpen ? 760 : 700
  );
  const chatWidth = isFullscreen ? fullscreenWidth : baseWidth;
  const chatHeight = isFullscreen ? fullscreenHeight : baseHeight;

  const handleToggleFullscreen = () => {
    const next = !isFullscreen;
    setIsFullscreen(next);
    const targetWidth = next ? fullscreenWidth : baseWidth;
    const targetHeight = next ? fullscreenHeight : baseHeight;
    centerModal(targetWidth, targetHeight);
    setIsDragging(false);
  };

  return (
    <>
      {/* Floating teaser card */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 pointer-events-none">
          <button
            type="button"
            className="pointer-events-auto relative w-[230px] h-[160px] rounded-2xl border border-white/50 bg-white/10 backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden transition hover:scale-[1.02] active:scale-[0.99]"
            onClick={handleOpen}
          >
            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-semibold flex items-center justify-center shadow-md">
              i
            </div>
            <img
              src={PaulImage}
              alt="Chatbot avatar"
              className="w-full h-full object-cover"
              draggable="false"
              loading="lazy"
            />
          </button>
        </div>
      )}

      {/* Draggable modal */}
      {isOpen && (
        <div
          className="fixed z-50 transition-all duration-300 ease-out"
          style={
            isFullscreen
              ? {
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: chatWidth,
                  height: chatHeight,
                }
              : {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  width: chatWidth,
                  height: chatHeight,
                }
          }
        >
          <div
            className={`relative w-full h-full rounded-3xl border border-white/50 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden pointer-events-auto transition-all duration-300 ease-out ${
              isFullscreen ? 'cursor-default' : 'cursor-move'
            }`}
            onMouseDown={isFullscreen ? undefined : startDrag}
          >
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
            <div className="absolute inset-0 flex">
              {/* Media pane */}
              <div
                className={`${isChatOpen ? 'w-[48%]' : 'w-full'} h-full relative transition-all duration-300 ease-out`}
              >
                <img
                  src={PaulImage}
                  alt="Chatbot avatar"
                  className="w-full h-full object-cover"
                  draggable="false"
                  loading="lazy"
                />

                {/* Top controls */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                    aria-label="Toggle audio"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full bg-black/40 text-white hover:bg-white/80"
                    aria-label="Fullscreen"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={handleToggleFullscreen}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-2 rounded-full bg-black/40 text-white hover:bg-red-500"
                    aria-label="Close"
                    onMouseDown={e => e.stopPropagation()}
                    onClick={handleClose}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom controls bar */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/65 via-black/35 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/15 text-white text-sm font-semibold shadow-md">
                      <span className="truncate">Ambassador Paul</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className={`p-3 rounded-full ${
                          micStatus === 'allowed' && !micMuted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/15 text-white hover:bg-white/25'
                        } shadow-md`}
                        aria-label="Mic"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={handleToggleMic}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <div className="px-6 py-3 rounded-full bg-white/20 text-white text-xs font-semibold shadow-md transition-colors duration-200">
                        {micStatus === 'allowed'
                          ? micMuted
                            ? 'Muted'
                            : 'Listening...'
                          : micStatus === 'prompt'
                            ? 'Requesting mic...'
                            : micStatus === 'denied'
                              ? 'Mic blocked'
                              : 'Tap mic to speak'}
                      </div>
                      <button
                        type="button"
                        className={`p-3 rounded-full ${isChatOpen ? 'bg-white/90 text-gray-800' : 'bg-white/15 text-white hover:bg-white/25'} shadow-md`}
                        aria-label="Open chat"
                        onMouseDown={e => e.stopPropagation()}
                        onClick={() => setIsChatOpen(prev => !prev)}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat pane */}
              {isChatOpen && (
                <div className="w-[52%] h-full bg-white text-gray-900 relative flex flex-col transition-all duration-300 ease-out border-l border-gray-100 shadow-inner">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                    <div className="font-semibold">Chat</div>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-gray-100"
                      aria-label="Close chat"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={() => setIsChatOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white">
                    <div className="self-start max-w-[80%] rounded-2xl bg-gray-100 px-3 py-2 text-sm shadow-sm">
                      Hi! I’m Paul. Ask me anything about the academy or your
                      courses.
                    </div>
                    <div className="self-end max-w-[80%] rounded-2xl bg-blue-600 text-white px-3 py-2 text-sm shadow-sm">
                      What can you help me with?
                    </div>
                    <div className="self-start max-w-[80%] rounded-2xl bg-gray-100 px-3 py-2 text-sm shadow-sm">
                      I can guide you on course selection, schedules, credits,
                      or general questions.
                    </div>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-3 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your message here..."
                        onMouseDown={e => e.stopPropagation()}
                      />
                      <button
                        type="button"
                        className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        aria-label="Send message"
                        onMouseDown={e => e.stopPropagation()}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingMiniChatbot;
