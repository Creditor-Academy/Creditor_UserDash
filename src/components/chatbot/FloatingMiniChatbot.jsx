import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Mic, MessageSquare, Volume2, X } from 'lucide-react';
import PaulImage from './paulmichael.png';

const FloatingMiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const [micMuted, setMicMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, content: "Hi, I'm Paul. How can I help you?", isUser: false },
    { id: 2, content: 'Tell me about the courses', isUser: true },
    { id: 3, content: 'I can guide you through all programs.', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Speaker state
  const [chatSize, setChatSize] = useState('small'); // 'small', 'fullscreen'
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position after component mounts
    if (typeof window !== 'undefined') {
      setPosition({
        x: (window.innerWidth - 860) / 2, // Center horizontally (assuming 860px width)
        y: (window.innerHeight - 420) / 2, // Center vertically (assuming 420px height)
      });
    }
  }, []);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTeaserDragging, setIsTeaserDragging] = useState(false);
  const [teaserPosition, setTeaserPosition] = useState({
    x: window.innerWidth - 250,
    y: window.innerHeight - 200,
  });
  const [teaserDragOffset, setTeaserDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response after a delay
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        content: getBotResponse(inputValue),
        isUser: false,
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dragging functionality
  const handleMouseDown = e => {
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = e => {
    if (!dragging) return;

    // Calculate new position with boundaries
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Keep within screen boundaries
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const elementWidth = 860; // Approximate width of the modal
    const elementHeight = 420; // Approximate height of the modal

    newX = Math.max(0, Math.min(screenWidth - elementWidth, newX));
    newY = Math.max(0, Math.min(screenHeight - elementHeight, newY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragging]);

  // Teaser drag functionality
  const handleTeaserMouseDown = e => {
    setIsTeaserDragging(true);
    setTeaserDragOffset({
      x: e.clientX - teaserPosition.x,
      y: e.clientY - teaserPosition.y,
    });
  };

  const handleTeaserMouseMove = e => {
    if (!isTeaserDragging) return;

    // Calculate new position with boundaries
    let newX = e.clientX - teaserDragOffset.x;
    let newY = e.clientY - teaserDragOffset.y;

    // Keep within screen boundaries
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const elementWidth = 220; // Width of teaser button
    const elementHeight = 150; // Height of teaser button

    newX = Math.max(0, Math.min(screenWidth - elementWidth, newX));
    newY = Math.max(0, Math.min(screenHeight - elementHeight, newY));

    setTeaserPosition({ x: newX, y: newY });
  };

  const handleTeaserMouseUp = () => {
    setIsTeaserDragging(false);
  };

  // Add event listeners for teaser dragging
  useEffect(() => {
    if (isTeaserDragging) {
      window.addEventListener('mousemove', handleTeaserMouseMove);
      window.addEventListener('mouseup', handleTeaserMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleTeaserMouseMove);
        window.removeEventListener('mouseup', handleTeaserMouseUp);
      };
    }
  }, [isTeaserDragging]);

  // Size adjustment functions
  const changeSize = size => {
    setChatSize(size);

    // Center the chatbot when size changes (only for non-fullscreen)
    if (
      typeof window !== 'undefined' &&
      !isFullscreen &&
      size !== 'fullscreen'
    ) {
      const dimensions = getSizeDimensions();
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);

      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      });
    }
  };

  const toggleSize = () => {
    const sizes = ['small', 'fullscreen'];
    const currentIndex = sizes.indexOf(chatSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    setChatSize(newSize);

    // Center the chatbot when size changes (only for non-fullscreen)
    if (
      typeof window !== 'undefined' &&
      !isFullscreen &&
      newSize !== 'fullscreen'
    ) {
      const dimensions = getSizeDimensions();
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);

      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      });
    }
  };

  // Get dimensions based on size
  const getSizeDimensions = () => {
    switch (chatSize) {
      case 'small':
        return {
          width: isChatOpen ? '700px' : '600px',
          height: isChatOpen ? '350px' : '300px',
        };
      case 'fullscreen':
        return { width: '95vw', height: '90vh' };
      default:
        return {
          width: isChatOpen ? '700px' : '600px',
          height: isChatOpen ? '350px' : '300px',
        };
    }
  };

  // Speaker functionality
  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
  };

  const getBotResponse = userInput => {
    const lowerInput = userInput.toLowerCase();

    if (lowerInput.includes('course') || lowerInput.includes('program')) {
      return 'We offer a variety of courses in technology, business, and design. Which specific area interests you most?';
    } else if (
      lowerInput.includes('price') ||
      lowerInput.includes('cost') ||
      lowerInput.includes('fee')
    ) {
      return 'Our courses range from $99 to $499 depending on the duration and complexity. Would you like details about a specific course?';
    } else if (
      lowerInput.includes('duration') ||
      lowerInput.includes('time') ||
      lowerInput.includes('long')
    ) {
      return 'Course durations vary from 2 weeks to 3 months. Most of our courses are self-paced with flexible deadlines.';
    } else if (
      lowerInput.includes('certificate') ||
      lowerInput.includes('certification')
    ) {
      return 'Yes, we provide certificates of completion for all our courses. These are recognized by industry partners.';
    } else {
      return "Thank you for your message. I'm here to help you with any questions about our courses and programs. What else would you like to know?";
    }
  };

  const requestMicPermission = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }

    try {
      setMicStatus('prompt');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicStatus('allowed');
      setMicMuted(false);
    } catch (err) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError') {
        setMicStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setMicStatus('notfound');
      } else {
        setMicStatus('error');
      }
    }
  };

  const toggleMic = async () => {
    if (
      micStatus === 'idle' ||
      micStatus === 'denied' ||
      micStatus === 'notfound' ||
      micStatus === 'unsupported' ||
      micStatus === 'error'
    ) {
      await requestMicPermission();
    } else if (micStatus === 'allowed') {
      if (isRecording) {
        // Stop recording
        setIsRecording(false);
        // Here we would normally get the recorded audio and convert to text
        // For now, we'll simulate with a placeholder
        setInputValue('');
      } else {
        // Start recording
        setIsRecording(true);
        // Auto-stop after 5 seconds for demo purposes
        setTimeout(() => {
          setIsRecording(false);
          setInputValue('');
        }, 5000);
      }
      setMicMuted(v => !v);
    } else if (micStatus === 'prompt') {
      // User is already being prompted, do nothing
      return;
    }
  };

  const modalAnim = {
    initial: { opacity: 0, scale: 0.9, y: 40 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 30 },
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  };

  return (
    <>
      {/* Floating teaser */}
      {!isOpen && (
        <motion.button
          onClick={() => {
            setIsOpen(true);
            requestMicPermission();

            // Center the chatbot when opened (only for non-fullscreen)
            if (typeof window !== 'undefined' && !isFullscreen) {
              const dimensions = getSizeDimensions();
              const width = parseFloat(dimensions.width);
              const height = parseFloat(dimensions.height);

              setPosition({
                x: (window.innerWidth - width) / 2,
                y: (window.innerHeight - height) / 2,
              });
            }
          }}
          className="fixed z-40 w-[220px] h-[150px] rounded-2xl overflow-hidden
                     bg-white/10 backdrop-blur-xl border border-white/40"
          style={{
            position: 'fixed',
            top: `${teaserPosition.y}px`,
            left: `${teaserPosition.x}px`,
            cursor: isTeaserDragging ? 'grabbing' : 'grab',
            bottom: 'auto',
            right: 'auto',
          }}
          onMouseDown={handleTeaserMouseDown}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              '0 0 15px rgba(99, 102, 241, 0.3)',
              '0 0 25px rgba(99, 102, 241, 0.6)',
              '0 0 15px rgba(99, 102, 241, 0.3)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={PaulImage}
            alt="AI Avatar"
            className="w-full h-full object-cover"
          />
        </motion.button>
      )}

      {/* Main modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...modalAnim}
            className="fixed inset-0 z-50"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              className={`relative rounded-3xl overflow-hidden`}
              style={{
                position: isFullscreen ? 'fixed' : 'absolute',
                top: isFullscreen ? '50%' : `${position.y}px`,
                left: isFullscreen ? '50%' : `${position.x}px`,
                transform: isFullscreen ? 'translate(-50%, -50%)' : 'none',
                width: isFullscreen ? '90vw' : getSizeDimensions().width,
                height: isFullscreen ? '85vh' : getSizeDimensions().height,
                cursor: dragging ? 'grabbing' : 'grab',
                pointerEvents: isFullscreen ? 'auto' : 'auto',
              }}
              onMouseDown={handleMouseDown}
              whileHover={{
                boxShadow: isFullscreen
                  ? '0 0 30px rgba(99, 102, 241, 0.4)'
                  : '0 0 25px rgba(99, 102, 241, 0.3)',
              }}
            >
              {/* Glass background */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/25 via-white/5 to-transparent backdrop-blur-2xl border border-white/40 shadow-[0_30px_90px_rgba(0,0,0,0.45)]" />

              <div className="relative w-full h-full flex">
                {/* Avatar side */}
                <div
                  className={`${isChatOpen ? 'w-[48%]' : 'w-full'} relative`}
                >
                  <motion.img
                    src={PaulImage}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    animate={{ scale: [1, 1.015, 1] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />

                  {/* Listening glow */}
                  <motion.div
                    className="absolute inset-6 rounded-full border-2 border-emerald-400/60 blur-lg"
                    animate={
                      micStatus === 'allowed' && !micMuted
                        ? { scale: [1, 1.12, 1], opacity: [0.3, 0.8, 0.3] }
                        : { opacity: 0 }
                    }
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />

                  {/* Top controls */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <IconBtn onClick={() => changeSize('small')}>
                      <span className="text-xs">S</span>
                    </IconBtn>
                    <IconBtn onClick={toggleSpeaker} active={isSpeakerOn}>
                      {isSpeakerOn ? (
                        <Volume2 />
                      ) : (
                        <Volume2 className="opacity-50" />
                      )}
                    </IconBtn>
                    <IconBtn onClick={() => setIsFullscreen(v => !v)}>
                      <Maximize2 />
                    </IconBtn>
                    <IconBtn danger onClick={() => setIsOpen(false)}>
                      <X />
                    </IconBtn>
                  </div>

                  {/* Bottom bar */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <div className="flex justify-between items-center">
                      <div className="text-white font-semibold">
                        Ambassador Paul
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <IconBtn
                            active={micStatus === 'allowed' && !micMuted}
                            onClick={toggleMic}
                            danger={
                              micStatus === 'denied' || micStatus === 'error'
                            }
                          >
                            <Mic />
                          </IconBtn>
                          {(micStatus === 'prompt' || isRecording) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                          )}
                          {micStatus === 'denied' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                          {micStatus === 'allowed' && !micMuted && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <IconBtn
                          onClick={() => setIsChatOpen(v => !v)}
                          active={isChatOpen}
                        >
                          <MessageSquare />
                        </IconBtn>
                      </div>
                    </div>
                    {micStatus === 'prompt' && (
                      <div className="text-xs text-yellow-300 mt-1">
                        Allow microphone access to enable voice chat
                      </div>
                    )}
                    {(micStatus === 'denied' || micStatus === 'error') && (
                      <div className="text-xs text-red-300 mt-1">
                        Microphone access denied. Please enable in browser
                        settings.
                      </div>
                    )}
                    {isRecording && (
                      <div className="text-xs text-green-300 mt-1 flex items-center">
                        <span className="flex h-2 w-2 mr-1">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Recording... Tap mic to stop
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat panel */}
                <AnimatePresence>
                  {isChatOpen && (
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 40, opacity: 0 }}
                      className="w-[52%] bg-white flex flex-col"
                    >
                      <div className="p-4 font-semibold border-b">Chat</div>
                      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                        {messages.map(message => (
                          <Bubble
                            key={message.id}
                            left={!message.isUser}
                            right={message.isUser}
                          >
                            {message.content}
                          </Bubble>
                        ))}
                        {isTyping && <TypingDots />}
                        <div ref={messagesEndRef} />
                      </div>
                      <div className="p-4 border-t flex gap-2">
                        <motion.input
                          className="flex-1 rounded-full border px-4 py-2 text-sm"
                          placeholder="Type a message..."
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleSendMessage();
                            }
                          }}
                          whileFocus={{
                            boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.5)',
                          }}
                        />
                        <motion.button
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          onClick={handleSendMessage}
                          disabled={inputValue.trim() === ''}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: 'rgb(99 102 241)',
                            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Send
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ---------- Reusable UI ---------- */

const IconBtn = ({ children, onClick, danger, active }) => (
  <motion.button
    onClick={onClick}
    className={`p-2 rounded-full backdrop-blur-md shadow-lg transition
      ${danger ? 'bg-red-500 text-white' : active ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white'}
      hover:scale-110 active:scale-95`}
    whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)' }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.button>
);

const Bubble = ({ children, left, right }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow
      ${left && 'bg-gray-200 self-start'}
      ${right && 'bg-blue-600 text-white self-end'}`}
  >
    {children}
  </motion.div>
);

const TypingDots = () => (
  <div className="flex gap-1 px-2">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 bg-gray-400 rounded-full"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
      />
    ))}
  </div>
);

export default FloatingMiniChatbot;
