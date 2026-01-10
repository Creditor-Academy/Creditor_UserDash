import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Mic, MessageSquare, Volume2, X } from 'lucide-react';
import PaulImage from './paulmichael.png';

// FAQ data organized by categories
const faqCategories = [
  {
    id: 'membership',
    name: 'Membership-related',
    questions: [
      {
        question: 'What are the different membership plans available?',
        answer:
          'We offer three membership plans: Basic (free access to limited courses), Pro ($29/month with full course library access), and Enterprise (custom pricing for teams with advanced features and dedicated support).',
      },
      {
        question: "What's included in the Basic membership?",
        answer:
          'The Basic membership includes access to selected free courses, limited progress tracking, and participation in the community forum. Advanced features and premium courses require a Pro or Enterprise subscription.',
      },
      {
        question: 'How do I upgrade from Basic to Pro or Enterprise?',
        answer:
          "To upgrade your membership, navigate to your account settings and select 'Membership Plans'. From there, you can choose your preferred plan and complete the payment process to activate your upgraded membership immediately.",
      },
      {
        question: 'Is there a free trial available before subscribing?',
        answer:
          "Yes, we offer a 7-day free trial of our Pro membership. You can access all Pro features during this period, and you won't be charged if you cancel before the trial period ends.",
      },
      {
        question: 'Can I cancel my membership anytime?',
        answer:
          'Yes, you can cancel your membership at any time through your account settings. Your access will continue until the end of your current billing period, with no additional charges afterward.',
      },
    ],
  },
  {
    id: 'navigation',
    name: 'Navigation & LMS Usage',
    questions: [
      {
        question: 'How do I access my enrolled courses?',
        answer:
          "Your enrolled courses can be accessed from the 'My Courses' section in the main dashboard. Click on any course tile to start or continue your learning journey.",
      },
      {
        question: 'Where can I view my progress or course completion status?',
        answer:
          "Your progress is available in two places: on the dashboard overview and in the detailed 'Progress' tab. You'll see completion percentages, recently accessed content, and achievements.",
      },
      {
        question: 'How do I join live sessions or webinars?',
        answer:
          "Live sessions appear in your dashboard calendar. Click on the session 15 minutes before start time to enter the waiting room. You'll receive email reminders with direct links 24 hours and 1 hour before the session.",
      },
      {
        question: 'Where do I find my certificates after course completion?',
        answer:
          "Certificates are automatically generated when you complete all required course components. Access them in your 'Profile' section under the 'Certificates & Achievements' tab.",
      },
      {
        question: 'How can I reset my LMS password or update my profile?',
        answer:
          "To reset your password, click on 'Forgot Password' on the login page. To update your profile, navigate to your account settings through the profile icon in the top-right corner.",
      },
    ],
  },
  {
    id: 'payment',
    name: 'Payment & EMI',
    questions: [
      {
        question: 'What payment methods are accepted?',
        answer:
          'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for institutional accounts.',
      },
      {
        question: 'Do you offer EMI or installment payment options?',
        answer:
          'Yes, we offer 3, 6, and 12-month EMI options for annual subscriptions with partner banks. The EMI option appears during checkout if your card is from a supported bank.',
      },
      {
        question: 'Is there a refund policy if I cancel my plan early?',
        answer:
          'Monthly subscriptions are non-refundable once started. Annual subscriptions can be refunded within 30 days of purchase, minus a processing fee and prorated for any used days.',
      },
      {
        question: 'Can I pay annually instead of monthly?',
        answer:
          'Yes, we offer annual payment options with a 20% discount compared to monthly payments. You can select this option during signup or when upgrading your membership.',
      },
    ],
  },
  {
    id: 'courses',
    name: 'Course Types & Formats',
    questions: [
      {
        question: 'What types of courses are available?',
        answer:
          'We offer various course formats including self-paced video modules, live instructor-led sessions, interactive projects, and assessment-based programs. Each course includes downloadable resources and community support.',
      },
      {
        question: 'How long do I have access to course materials?',
        answer:
          'With Pro and Enterprise memberships, you have lifetime access to all enrolled courses. Basic membership provides 6 months of access to free courses.',
      },
      {
        question: 'Are there any prerequisites for advanced courses?',
        answer:
          'Some advanced courses require completion of prerequisite modules. These requirements are clearly listed on each course page and in your learning path recommendations.',
      },
      {
        question: 'Can I download course videos for offline viewing?',
        answer:
          'Yes, enrolled students can download videos for offline viewing through our mobile app. Downloaded content remains available for 30 days and requires periodic re-authentication.',
      },
    ],
  },
];

const FloatingMiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [micStatus, setMicStatus] = useState('idle');
  const [micMuted, setMicMuted] = useState(false);

  const [messages, setMessages] = useState([
    { id: 1, content: "Hi, I'm Paul. How can I help you?", isUser: false },
    { id: 2, content: 'Tell me about the courses', isUser: true },
    { id: 3, content: 'I can guide you through all programs.', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const autoSendTimerRef = useRef(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true); // Speaker state
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if bot is currently speaking
  const speakTextRef = useRef(null);
  const [chatSize, setChatSize] = useState('small'); // 'small', 'fullscreen'
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState(null);
  const [showCategories, setShowCategories] = useState(true);

  useEffect(() => {
    // Set initial position after component mounts
    if (typeof window !== 'undefined') {
      setPosition({
        x: (window.innerWidth - 1200) / 2, // Center horizontally (assuming 1200px width for full screen feel)
        y: (window.innerHeight - 800) / 2, // Center vertically (assuming 800px height for full screen feel)
      });
    }

    // Load speech synthesis voices
    if ('speechSynthesis' in window) {
      // Load voices initially
      speechSynthesisRef.current = window.speechSynthesis.getVoices();

      // Add event listener for when voices are loaded
      const handleVoicesChanged = () => {
        speechSynthesisRef.current = window.speechSynthesis.getVoices();
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
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

  // Separate function for sending transcribed text automatically
  const sendTranscribedText = useCallback(
    async transcribedText => {
      if (transcribedText.trim() === '') return;

      // Add user message
      const userMessage = {
        id: Date.now(),
        content: transcribedText,
        isUser: true,
      };

      setMessages(prev => [...prev, userMessage]);

      // Temporarily store current input value to restore after sending
      const previousInputValue = inputValue;
      setInputValue(transcribedText);

      // Get bot response and update UI
      setIsTyping(true);

      try {
        const botResponseText = await getBotResponse(transcribedText);
        const botResponse = {
          id: Date.now() + 1,
          content: botResponseText,
          isUser: false,
        };
        setMessages(prev => [...prev, botResponse]);
        // Speak the bot's response if speaker is on
        if (isSpeakerOn) {
          speakTextRef.current?.(botResponse.content);
        }
      } catch (error) {
        console.error('Error getting bot response:', error);
        // Fallback response
        const botResponse = {
          id: Date.now() + 1,
          content:
            "I'm sorry, I'm having trouble responding right now. Could you try again?",
          isUser: false,
        };
        setMessages(prev => [...prev, botResponse]);
        // Speak the fallback response if speaker is on
        if (isSpeakerOn) {
          speakTextRef.current?.(botResponse.content);
        }
      } finally {
        setIsTyping(false);

        // Restore previous input value
        setInputValue('');

        // Stop speech recognition after auto-send
        stopSpeechRecognition();
      }
    },
    [inputValue, speakTextRef]
  );

  const handleSendMessage = useCallback(
    async (autoSend = false) => {
      if (inputValue.trim() === '') return;

      // Add user message
      const userMessage = {
        id: Date.now(),
        content: inputValue,
        isUser: true,
      };

      setMessages(prev => [...prev, userMessage]);

      // Store the current mic state before clearing input
      const wasRecording = isRecording;
      setInputValue('');

      // Get bot response and update UI
      setIsTyping(true);

      try {
        const botResponseText = await getBotResponse(inputValue);
        const botResponse = {
          id: Date.now() + 1,
          content: botResponseText,
          isUser: false,
        };
        setMessages(prev => [...prev, botResponse]);
        // Speak the bot's response if speaker is on
        if (isSpeakerOn) {
          speakTextRef.current?.(botResponse.content);
        }
      } catch (error) {
        console.error('Error getting bot response:', error);
        // Fallback response
        const botResponse = {
          id: Date.now() + 1,
          content:
            "I'm sorry, I'm having trouble responding right now. Could you try again?",
          isUser: false,
        };
        setMessages(prev => [...prev, botResponse]);
        // Speak the fallback response if speaker is on
        if (isSpeakerOn) {
          speakTextRef.current?.(botResponse.content);
        }
      } finally {
        setIsTyping(false);

        // If mic was active before sending and not auto-sending, restart speech recognition
        if (!autoSend && wasRecording && micStatus === 'allowed') {
          setTimeout(() => {
            startSpeechRecognition();
          }, 500); // Small delay to allow UI to update
        }
      }
    },
    [inputValue, isRecording, micStatus]
  );

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

    // Don't allow dragging when in fullscreen mode
    if (chatSize === 'fullscreen') {
      return;
    }

    // Calculate new position with boundaries
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;

    // Keep within screen boundaries
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Get current dimensions based on size and chat panel state
    const currentDimensions = getSizeDimensions();
    const elementWidth = parseFloat(currentDimensions.width);
    const elementHeight = parseFloat(currentDimensions.height);

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
  const changeSize = useCallback(size => {
    setChatSize(size);

    // Center the chatbot when size changes (only for non-fullscreen)
    if (typeof window !== 'undefined' && size !== 'fullscreen') {
      const dimensions = getSizeDimensions();
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);

      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      });
    }
  }, []);

  const toggleSize = useCallback(() => {
    const sizes = ['small', 'fullscreen'];
    const currentIndex = sizes.indexOf(chatSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    setChatSize(newSize);

    // Center the chatbot when size changes (only for non-fullscreen)
    if (typeof window !== 'undefined' && newSize !== 'fullscreen') {
      const dimensions = getSizeDimensions();
      const width = parseFloat(dimensions.width);
      const height = parseFloat(dimensions.height);

      setPosition({
        x: (window.innerWidth - width) / 2,
        y: (window.innerHeight - height) / 2,
      });
    }
  }, [chatSize]);

  // Get dimensions based on size
  const getSizeDimensions = useCallback(() => {
    switch (chatSize) {
      case 'small':
        return {
          width: isChatOpen ? '700px' : '600px',
          height: isChatOpen ? '350px' : '300px',
        };
      case 'fullscreen':
        return { width: '100vw', height: '100vh' };
      default:
        return {
          width: isChatOpen ? '700px' : '600px',
          height: isChatOpen ? '350px' : '300px',
        };
    }
  }, [chatSize, isChatOpen]);

  // Speaker functionality
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(prev => {
      const newState = !prev;
      // If turning speaker off, stop any ongoing speech
      if (prev && !newState) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return newState;
    });
  }, []);

  // Function to set speaker state directly
  const setSpeakerState = useCallback(state => {
    setIsSpeakerOn(state);
  }, []);

  // Mute/unmute functionality
  const muteBotResponses = useCallback(() => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsSpeakerOn(false);
  }, []);

  const unmuteBotResponses = useCallback(() => {
    setIsSpeakerOn(true);
  }, []);

  const toggleMute = useCallback(() => {
    setIsSpeakerOn(prev => {
      const newState = !prev;
      // If turning speaker off, stop any ongoing speech
      if (prev && !newState) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return newState;
    });
  }, []);

  // Text-to-speech functionality for bot responses
  const speechSynthesisRef = useRef(null);

  const speakText = useCallback(
    text => {
      if (!isSpeakerOn || !text) return;

      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure speech synthesis
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Find and set the best voice
      const englishVoice = speechSynthesisRef.current?.find(
        voice =>
          voice.lang.includes('en') ||
          voice.name.includes('Google') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Daniel')
      );

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Set speaking state
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    [isSpeakerOn]
  );

  // Store speakText function in ref to avoid dependency issues
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  // Function to stop speech
  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // FAQ functionality
  const handleCategorySelect = useCallback(categoryId => {
    setActiveCategory(categoryId);
  }, []);

  const handleQuestionSelect = useCallback(
    (question, answer) => {
      // Add the question as a user message
      const userMessage = {
        id: Date.now(),
        content: question,
        isUser: true,
      };

      setMessages(prev => [...prev, userMessage]);

      // Add the answer as a bot message
      const botResponse = {
        id: Date.now() + 1,
        content: answer,
        isUser: false,
      };

      setMessages(prev => [...prev, botResponse]);

      // Speak the FAQ response if speaker is on
      speakTextRef.current?.(answer);

      // Hide categories after selection
      setShowCategories(false);
    },
    [speakText]
  );

  const handleBackToCategories = useCallback(() => {
    setActiveCategory(null);
    setShowCategories(true);
  }, []);

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

  const toggleMic = useCallback(async () => {
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
        // Stop speech recognition
        stopSpeechRecognition();
      } else {
        // Start speech recognition
        startSpeechRecognition();
      }
    } else if (micStatus === 'prompt') {
      // User is already being prompted, do nothing
      return;
    }
  }, [micStatus, isRecording]);

  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setMicMuted(false);
  }, []);

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      // Create recognition instance directly instead of calling init function
      if (
        !('webkitSpeechRecognition' in window) &&
        !('SpeechRecognition' in window)
      ) {
        setMicStatus('unsupported');
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Changed to true to keep listening
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = event => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the input field with the recognized text
        setInputValue(finalTranscript + interimTranscript);

        // Clear any existing timer
        if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
        }

        // Set a new timer to send the message after 1.5 seconds of user stopping speaking
        if (finalTranscript.trim() !== '') {
          autoSendTimerRef.current = setTimeout(() => {
            setInputValue(finalTranscript.trim());
            sendTranscribedText(finalTranscript.trim()); // Send the transcribed message automatically
          }, 1500); // 1.5 seconds delay after user stops speaking
        }
      };

      recognitionRef.current.onerror = event => {
        console.error('Speech recognition error', event.error);
        stopSpeechRecognition();
      };

      recognitionRef.current.onend = () => {
        // When recognition ends naturally, update state
        if (isRecording) {
          setIsRecording(false);
          setMicMuted(false);
        }

        // Clear timer when recognition ends
        if (autoSendTimerRef.current) {
          clearTimeout(autoSendTimerRef.current);
        }
      };
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setMicMuted(true); // Show that mic is active for speech recognition
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setMicMuted(false);
    }
  }, []);

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
            if (typeof window !== 'undefined' && chatSize !== 'fullscreen') {
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

      {/* Main modal - no overlay version */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...modalAnim}
            className="fixed inset-0 z-50 pointer-events-none"
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
                position: chatSize === 'fullscreen' ? 'fixed' : 'absolute',
                top: chatSize === 'fullscreen' ? '0' : `${position.y}px`,
                left: chatSize === 'fullscreen' ? '0' : `${position.x}px`,
                transform: chatSize === 'fullscreen' ? 'none' : 'none',
                width:
                  chatSize === 'fullscreen'
                    ? '100vw'
                    : getSizeDimensions().width,
                height:
                  chatSize === 'fullscreen'
                    ? '100vh'
                    : getSizeDimensions().height,
                cursor: dragging ? 'grabbing' : 'grab',
                pointerEvents: 'auto',
              }}
              onMouseDown={handleMouseDown}
              whileHover={{
                boxShadow:
                  chatSize === 'fullscreen'
                    ? 'none' // No shadow when fullscreen to blend with content
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
                    <IconBtn onClick={toggleSpeaker} active={isSpeakerOn}>
                      {isSpeakerOn ? (
                        <Volume2 />
                      ) : (
                        <Volume2 className="opacity-50" />
                      )}
                    </IconBtn>
                    <IconBtn onClick={toggleSize}>
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

                        {/* FAQ Categories Section */}
                        {showCategories && !isTyping && (
                          <div className="mt-4 space-y-4">
                            {activeCategory === null ? (
                              <>
                                <div className="text-sm font-medium mb-2 text-gray-700">
                                  Browse by category:
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {faqCategories.map(category => (
                                    <button
                                      key={category.id}
                                      className="px-3 py-1.5 text-xs rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors border border-blue-200"
                                      onClick={() =>
                                        handleCategorySelect(category.id)
                                      }
                                    >
                                      {category.name}
                                    </button>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-medium text-gray-700">
                                    {
                                      faqCategories.find(
                                        c => c.id === activeCategory
                                      )?.name
                                    }
                                  </div>
                                  <button
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    onClick={handleBackToCategories}
                                  >
                                    Back to categories
                                  </button>
                                </div>
                                <div className="space-y-1">
                                  {faqCategories
                                    .find(c => c.id === activeCategory)
                                    ?.questions.map((q, i) => (
                                      <button
                                        key={i}
                                        className="w-full text-left p-2 text-sm rounded hover:bg-gray-100 text-gray-700 truncate"
                                        onClick={() =>
                                          handleQuestionSelect(
                                            q.question,
                                            q.answer
                                          )
                                        }
                                      >
                                        <span className="text-blue-600">
                                          →{' '}
                                        </span>
                                        {q.question}
                                      </button>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
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
