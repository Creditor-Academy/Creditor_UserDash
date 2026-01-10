import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Mic, MessageSquare, Volume2, X } from "lucide-react";
const PaulImage = "/assets/Paulmichael.png";
const EDGE_MARGIN = 24;

const FloatingMiniChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [micStatus, setMicStatus] = useState("idle");
  const [micMuted, setMicMuted] = useState(true); // mic starts muted

  // Start with an empty conversation so only user/bot messages show
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);
  const autoSendTimerRef = useRef(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false); // Speaker off by default
  const [isSpeaking, setIsSpeaking] = useState(false); // Track if bot is currently speaking
  const [voicesReady, setVoicesReady] = useState(false);
  const hasPlayedGreetingRef = useRef(false);
  const speakerEnabledRef = useRef(false);
  const speakTextRef = useRef(null);
  const [chatSize, setChatSize] = useState("small"); // 'small', 'fullscreen'
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set initial position to bottom-right while leaving room from edges
    if (typeof window !== "undefined") {
      const defaultWidth = 600;
      const defaultHeight = 300;
      setPosition({
        x: Math.max(
          EDGE_MARGIN,
          window.innerWidth - defaultWidth - EDGE_MARGIN,
        ),
        y: Math.max(
          EDGE_MARGIN,
          window.innerHeight - defaultHeight - EDGE_MARGIN,
        ),
      });
    }

    // Load speech synthesis voices
    if ("speechSynthesis" in window) {
      // Load voices initially
      const preloadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        speechSynthesisRef.current = voices;
        if (voices && voices.length > 0) {
          setVoicesReady(true);
        }
      };

      preloadVoices();

      // Add event listener for when voices are loaded
      const handleVoicesChanged = () => {
        preloadVoices();
      };

      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Play greeting once each time the widget is opened
  useEffect(() => {
    if (isOpen && voicesReady && !hasPlayedGreetingRef.current) {
      speakerEnabledRef.current = true;
      setIsSpeakerOn(true);
      speakTextRef.current?.(
        "I'm Paul, your virtual assistant. How can I help you?",
      );
      hasPlayedGreetingRef.current = true;
    }
  }, [isOpen, voicesReady]);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isTeaserDragging, setIsTeaserDragging] = useState(false);
  const [teaserPosition, setTeaserPosition] = useState({
    x: window.innerWidth - 250,
    y: window.innerHeight - 200,
  });
  const [teaserDragOffset, setTeaserDragOffset] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false); // Prevent duplicate sends
  const streamTimersRef = useRef(new Set()); // Track streaming timers (word-by-word)
  const spokenCharRef = useRef(0); // Track how much of the current bot message has been spoken
  const speechBufferRef = useRef(""); // buffer to batch TTS chunks
  const speechFlushTimerRef = useRef(null); // timer to flush TTS buffer
  const handleClose = useCallback(() => {
    // stop any speech immediately
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsSpeakerOn(false);

    // clear streaming timers
    streamTimersRef.current.forEach((t) => clearTimeout(t));
    streamTimersRef.current.clear();

    // clear TTS buffer timer and buffer
    if (speechFlushTimerRef.current) {
      clearTimeout(speechFlushTimerRef.current);
      speechFlushTimerRef.current = null;
    }
    speechBufferRef.current = "";

    // close UI
    setIsChatOpen(false);
    setIsOpen(false);
  }, []);

  // Centralized bot response helper (fallbacks to static message on failure)
  const getBotResponse = useCallback(async (text) => {
    try {
      const response = await fetch("/api/chatbot/chatQuestion/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      // Backend wraps data in { data: { answer } } via successResponse
      return (
        data?.data?.answer || data?.answer || "I'm not sure, please try again."
      );
    } catch (err) {
      console.error("getBotResponse failed:", err);
      return "I'm sorry, I'm having trouble responding right now. Could you try again?";
    }
  }, []);

  // Stream bot response word-by-word for a more "live" feel (local, non-network)
  const streamBotResponseLocal = useCallback(
    (text) => {
      // Ensure speaker is on when a bot response starts
      speakerEnabledRef.current = true;
      setIsSpeakerOn(true);

      const words = text.split(" ");
      const msgId = Date.now() + Math.random();
      spokenCharRef.current = 0;

      // Seed empty bot message
      setMessages((prev) => [
        ...prev,
        { id: msgId, content: "", isUser: false, streaming: true },
      ]);

      let idx = 0;
      const step = () => {
        idx += 1;
        let currentContent = "";
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === msgId) {
              currentContent = words.slice(0, idx).join(" ");
              return {
                ...m,
                content: currentContent,
                streaming: idx < words.length,
              };
            }
            return m;
          }),
        );

        // Speak new portion incrementally (browser TTS) for pseudo audio streaming
        const speakDelta = () => {
          if (!isSpeakerOn || !currentContent) return;
          const delta = currentContent.slice(spokenCharRef.current);
          if (delta.trim().length === 0) return;
          spokenCharRef.current = currentContent.length;
          speakTextRef.current?.(delta);
        };

        // Speak every ~6 words and at the end
        if (idx % 6 === 0 || idx === words.length) {
          speakDelta();
        }

        if (idx < words.length) {
          const t = setTimeout(step, 100);
          streamTimersRef.current.add(t);
        } else {
          // Ensure any remaining text is spoken
          speakDelta();
        }
      };

      step();
    },
    [isSpeakerOn, speakTextRef],
  );

  // Stream bot response directly from backend streaming endpoint
  const streamBotResponseFromApi = useCallback(
    async (promptText) => {
      // Ensure speaker is on when a bot response starts
      speakerEnabledRef.current = true;
      setIsSpeakerOn(true);

      const msgId = Date.now() + Math.random();
      spokenCharRef.current = 0;

      // Seed empty bot message
      setMessages((prev) => [
        ...prev,
        { id: msgId, content: "", isUser: false, streaming: true },
      ]);

      const flushSpeechBuffer = () => {
        if (!speechBufferRef.current.trim()) return;
        const chunk = speechBufferRef.current;
        speechBufferRef.current = "";
        speakTextRef.current?.(chunk);
      };

      const handleLine = (line) => {
        if (!line || !line.trim()) return;
        try {
          const payload = JSON.parse(line);
          if (payload.error) {
            throw new Error(payload.error);
          }

          if (payload.delta) {
            const deltaText = payload.delta;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, content: m.content + deltaText } : m,
              ),
            );

            // Buffer speech chunks and flush in small batches for smoother TTS
            speechBufferRef.current += deltaText;
            if (!speechFlushTimerRef.current) {
              speechFlushTimerRef.current = setTimeout(() => {
                speechFlushTimerRef.current = null;
                flushSpeechBuffer();
              }, 250);
            }
          }

          if (payload.done) {
            if (speechFlushTimerRef.current) {
              clearTimeout(speechFlushTimerRef.current);
              speechFlushTimerRef.current = null;
            }
            flushSpeechBuffer();

            setMessages((prev) =>
              prev.map((m) =>
                m.id === msgId ? { ...m, streaming: false } : m,
              ),
            );
          }
        } catch (err) {
          console.error("Stream parse error", err);
          throw err;
        }
      };

      try {
        const response = await fetch("/api/chatbot/chatQuestion/ai/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: promptText }),
        });

        if (!response.ok || !response.body) {
          throw new Error(`Stream request failed: HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            handleLine(line);
          }
        }

        // Flush remaining buffered content
        if (buffer.trim()) {
          handleLine(buffer);
        }

        // Ensure streaming flag cleared
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, streaming: false } : m)),
        );
      } catch (err) {
        if (speechFlushTimerRef.current) {
          clearTimeout(speechFlushTimerRef.current);
          speechFlushTimerRef.current = null;
        }
        flushSpeechBuffer();
        // Mark message as failed
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId
              ? {
                  ...m,
                  streaming: false,
                  content:
                    m.content || "I'm sorry, I hit a snag answering that.",
                }
              : m,
          ),
        );
        throw err;
      }
    },
    [setMessages, speakTextRef],
  );

  // Try streaming first; fall back to non-streaming if needed
  const startBotResponse = useCallback(
    async (promptText) => {
      try {
        await streamBotResponseFromApi(promptText);
      } catch (err) {
        console.error("Streaming failed, falling back to non-streaming", err);
        const botResponseText = await getBotResponse(promptText);
        streamBotResponseLocal(botResponseText);
      }
    },
    [streamBotResponseFromApi, getBotResponse, streamBotResponseLocal],
  );

  // Cleanup any pending stream timers on unmount
  useEffect(() => {
    return () => {
      streamTimersRef.current.forEach((t) => clearTimeout(t));
      streamTimersRef.current.clear();
      if (speechFlushTimerRef.current) {
        clearTimeout(speechFlushTimerRef.current);
        speechFlushTimerRef.current = null;
      }
    };
  }, []);

  // Stop speech recognition helper (used by multiple callbacks)
  const stopSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setMicMuted(false);
  }, []);

  // Separate function for sending transcribed text automatically
  const sendTranscribedText = useCallback(
    async (transcribedText) => {
      if (sendingRef.current) return;
      if (transcribedText.trim() === "") return;
      sendingRef.current = true;

      // Add user message
      const userMessage = {
        id: Date.now(),
        content: transcribedText,
        isUser: true,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Temporarily store current input value to restore after sending
      const previousInputValue = inputValue;
      setInputValue(transcribedText);

      // Get bot response and update UI
      setIsTyping(true);

      try {
        await startBotResponse(transcribedText);
      } catch (error) {
        console.error("Error getting bot response:", error);
        // Fallback response
        streamBotResponseLocal(
          "I'm sorry, I'm having trouble responding right now. Could you try again?",
        );
      } finally {
        setIsTyping(false);

        // Restore previous input value
        setInputValue("");

        // Stop speech recognition after auto-send
        stopSpeechRecognition();
        sendingRef.current = false;
      }
    },
    [inputValue, startBotResponse, stopSpeechRecognition],
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Dragging functionality
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    // Don't allow dragging when in fullscreen mode
    if (chatSize === "fullscreen") {
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
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragging]);

  // Teaser drag functionality
  const handleTeaserMouseDown = (e) => {
    setIsTeaserDragging(true);
    setTeaserDragOffset({
      x: e.clientX - teaserPosition.x,
      y: e.clientY - teaserPosition.y,
    });
  };

  const handleTeaserMouseMove = (e) => {
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
      window.addEventListener("mousemove", handleTeaserMouseMove);
      window.addEventListener("mouseup", handleTeaserMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleTeaserMouseMove);
        window.removeEventListener("mouseup", handleTeaserMouseUp);
      };
    }
  }, [isTeaserDragging]);

  // Size adjustment functions
  const changeSize = useCallback((size) => {
    setChatSize(size);
  }, []);

  const toggleSize = useCallback(() => {
    const sizes = ["small", "fullscreen"];
    const currentIndex = sizes.indexOf(chatSize);
    const nextIndex = (currentIndex + 1) % sizes.length;
    const newSize = sizes[nextIndex];
    setChatSize(newSize);
  }, [chatSize]);

  // Get dimensions based on size
  const getSizeDimensions = useCallback(() => {
    switch (chatSize) {
      case "small":
        return {
          width: isChatOpen ? "700px" : "600px",
          height: isChatOpen ? "350px" : "300px",
        };
      case "fullscreen":
        return { width: "100vw", height: "100vh" };
      default:
        return {
          width: isChatOpen ? "700px" : "600px",
          height: isChatOpen ? "350px" : "300px",
        };
    }
  }, [chatSize, isChatOpen]);

  // Keep the widget within the viewport when sizes change
  const clampPositionToViewport = useCallback(() => {
    if (typeof window === "undefined" || chatSize === "fullscreen") return;

    const dimensions = getSizeDimensions();
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const maxX = Math.max(EDGE_MARGIN, window.innerWidth - width - EDGE_MARGIN);
    const maxY = Math.max(
      EDGE_MARGIN,
      window.innerHeight - height - EDGE_MARGIN,
    );

    setPosition((prev) => ({
      x: Math.min(Math.max(EDGE_MARGIN, prev.x), maxX),
      y: Math.min(Math.max(EDGE_MARGIN, prev.y), maxY),
    }));
  }, [chatSize, getSizeDimensions]);

  useEffect(() => {
    clampPositionToViewport();
  }, [chatSize, isChatOpen, clampPositionToViewport]);

  // Speaker functionality
  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn((prev) => {
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
  const setSpeakerState = useCallback((state) => {
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
    speakerEnabledRef.current = true;
  }, []);

  const toggleMute = useCallback(() => {
    setIsSpeakerOn((prev) => {
      const newState = !prev;
      // If turning speaker off, stop any ongoing speech
      if (prev && !newState) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      speakerEnabledRef.current = newState;
      return newState;
    });
  }, []);

  // Text-to-speech functionality for bot responses
  const speechSynthesisRef = useRef(null);

  const speakText = useCallback((text) => {
    if (!speakerEnabledRef.current || !text) return;

    const utterance = new SpeechSynthesisUtterance(text);

    // Configure speech synthesis
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    // Find and set the best voice
    const englishVoice = speechSynthesisRef.current?.find(
      (voice) =>
        voice.lang.includes("en") ||
        voice.name.includes("Google") ||
        voice.name.includes("Samantha") ||
        voice.name.includes("Daniel"),
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
  }, []);

  // Store speakText function in ref to avoid dependency issues
  useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  // Keep a simple boolean ref in sync with speaker state for quick checks
  useEffect(() => {
    speakerEnabledRef.current = isSpeakerOn;
  }, [isSpeakerOn]);

  // Function to stop speech
  const stopSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const requestMicPermission = async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      setMicStatus("unsupported");
      return;
    }

    try {
      setMicStatus("prompt");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMicStatus("allowed");
      setMicMuted(false);
    } catch (err) {
      console.error("Microphone access error:", err);
      if (err.name === "NotAllowedError") {
        setMicStatus("denied");
      } else if (err.name === "NotFoundError") {
        setMicStatus("notfound");
      } else {
        setMicStatus("error");
      }
    }
  };

  const startSpeechRecognition = useCallback(() => {
    if (!recognitionRef.current) {
      // Create recognition instance directly instead of calling init function
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        setMicStatus("unsupported");
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Changed to true to keep listening
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

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
        if (finalTranscript.trim() !== "") {
          autoSendTimerRef.current = setTimeout(() => {
            setInputValue(finalTranscript.trim());
            sendTranscribedText(finalTranscript.trim()); // Send the transcribed message automatically
          }, 1500); // 1.5 seconds delay after user stops speaking
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error);
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
      console.error("Error starting speech recognition:", error);
      setMicMuted(false);
    }
  }, [isRecording, sendTranscribedText, stopSpeechRecognition]);

  // Typed send handler (placed after startSpeechRecognition to avoid TDZ)
  const handleSendMessage = useCallback(
    async (autoSend = false) => {
      if (sendingRef.current) return;
      if (inputValue.trim() === "") return;
      sendingRef.current = true;

      // Add user message
      const userMessage = {
        id: Date.now(),
        content: inputValue,
        isUser: true,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Store the current mic state before clearing input
      const wasRecording = isRecording;
      setInputValue("");

      // Get bot response and update UI
      setIsTyping(true);

      try {
        await startBotResponse(inputValue);
      } catch (error) {
        console.error("Error getting bot response:", error);
        // Fallback response
        streamBotResponseLocal(
          "I'm sorry, I'm having trouble responding right now. Could you try again?",
        );
      } finally {
        setIsTyping(false);

        // If mic was active before sending and not auto-sending, restart speech recognition
        if (!autoSend && wasRecording && micStatus === "allowed") {
          setTimeout(() => {
            startSpeechRecognition();
          }, 500); // Small delay to allow UI to update
        }
        sendingRef.current = false;
      }
    },
    [
      inputValue,
      isRecording,
      micStatus,
      startSpeechRecognition,
      startBotResponse,
    ],
  );

  const toggleMic = useCallback(async () => {
    if (
      micStatus === "idle" ||
      micStatus === "denied" ||
      micStatus === "notfound" ||
      micStatus === "unsupported" ||
      micStatus === "error"
    ) {
      await requestMicPermission();
    } else if (micStatus === "allowed") {
      if (isRecording) {
        // Stop speech recognition
        stopSpeechRecognition();
      } else {
        // Start speech recognition
        startSpeechRecognition();
      }
    } else if (micStatus === "prompt") {
      // User is already being prompted, do nothing
      return;
    }
  }, [
    micStatus,
    isRecording,
    requestMicPermission,
    startSpeechRecognition,
    stopSpeechRecognition,
  ]);

  const modalAnim = {
    initial: { opacity: 0, scale: 0.9, y: 40 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 30 },
    transition: { type: "spring", stiffness: 260, damping: 22 },
  };

  return (
    <>
      {/* Floating teaser */}
      {!isOpen && (
        <motion.button
          onClick={() => {
            setIsOpen(true);
          }}
          className="fixed z-40 w-[220px] h-[150px] rounded-2xl overflow-hidden
                     bg-white/10 backdrop-blur-xl border border-white/40"
          style={{
            position: "fixed",
            top: `${teaserPosition.y}px`,
            left: `${teaserPosition.x}px`,
            cursor: isTeaserDragging ? "grabbing" : "grab",
            bottom: "auto",
            right: "auto",
          }}
          onMouseDown={handleTeaserMouseDown}
          whileHover={{
            scale: 1.05,
            boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)",
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.98 }}
          animate={{
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 0 15px rgba(99, 102, 241, 0.3)",
              "0 0 25px rgba(99, 102, 241, 0.6)",
              "0 0 15px rgba(99, 102, 241, 0.3)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <motion.div
              className={`relative rounded-3xl overflow-hidden`}
              style={{
                position: chatSize === "fullscreen" ? "fixed" : "absolute",
                top: chatSize === "fullscreen" ? "0" : `${position.y}px`,
                left: chatSize === "fullscreen" ? "0" : `${position.x}px`,
                transform: chatSize === "fullscreen" ? "none" : "none",
                width:
                  chatSize === "fullscreen"
                    ? "100vw"
                    : getSizeDimensions().width,
                height:
                  chatSize === "fullscreen"
                    ? "100vh"
                    : getSizeDimensions().height,
                cursor: dragging ? "grabbing" : "grab",
                pointerEvents: "auto",
              }}
              onMouseDown={handleMouseDown}
              whileHover={{
                boxShadow:
                  chatSize === "fullscreen"
                    ? "none" // No shadow when fullscreen to blend with content
                    : "0 0 25px rgba(99, 102, 241, 0.3)",
              }}
            >
              {/* Glass background - slightly stronger for readability on white pages */}
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_70px_rgba(0,0,0,0.25)]" />

              <div className="relative w-full h-full flex">
                {/* Avatar side */}
                <div
                  className={`${isChatOpen ? "w-[48%]" : "w-full"} relative`}
                >
                  {isSpeaking && (
                    <motion.div
                      className="absolute inset-6 rounded-full border-2 border-emerald-400/60"
                      animate={{
                        scale: [1, 1.08, 1],
                        opacity: [0.25, 0.7, 0.25],
                      }}
                      transition={{ duration: 1.4, repeat: Infinity }}
                    />
                  )}
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
                      micStatus === "allowed" && !micMuted
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
                    <IconBtn danger onClick={handleClose}>
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
                            active={micStatus === "allowed" && !micMuted}
                            onClick={toggleMic}
                            danger={
                              micStatus === "denied" || micStatus === "error"
                            }
                          >
                            <Mic />
                          </IconBtn>
                          {(micStatus === "prompt" || isRecording) && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"></div>
                          )}
                          {micStatus === "denied" && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                          )}
                          {micStatus === "allowed" && !micMuted && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <IconBtn
                          onClick={() => setIsChatOpen((v) => !v)}
                          active={isChatOpen}
                        >
                          <MessageSquare />
                        </IconBtn>
                      </div>
                    </div>
                    {micStatus === "prompt" && (
                      <div className="text-xs text-yellow-300 mt-1">
                        Allow microphone access to enable voice chat
                      </div>
                    )}
                    {(micStatus === "denied" || micStatus === "error") && (
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
                      className="w-[52%] bg-white/85 backdrop-blur-xl border-l border-white/40 flex flex-col text-gray-900"
                    >
                      <div className="p-4 font-semibold border-b border-white/40 text-gray-900">
                        Chat
                      </div>
                      <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-white/40 text-gray-900">
                        {messages.map((message) => (
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
                          className="flex-1 rounded-full border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 px-4 py-2 text-sm"
                          placeholder="Type a message..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSendMessage();
                            }
                          }}
                          whileFocus={{
                            boxShadow: "0 0 0 2px rgba(99, 102, 241, 0.5)",
                          }}
                        />
                        <motion.button
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          onClick={handleSendMessage}
                          disabled={inputValue.trim() === ""}
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgb(99 102 241)",
                            boxShadow: "0 0 15px rgba(99, 102, 241, 0.4)",
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
      ${danger ? "bg-red-500 text-white" : active ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white" : "bg-gradient-to-r from-gray-700 to-gray-800 text-white"}
      hover:scale-110 active:scale-95`}
    whileHover={{ scale: 1.1, boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
    whileTap={{ scale: 0.95 }}
    transition={{ type: "spring", stiffness: 400, damping: 17 }}
  >
    {children}
  </motion.button>
);

const Bubble = ({ children, left, right }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow
      ${left && "bg-white text-gray-900 self-start"}
      ${right && "bg-blue-600 text-white self-end"}`}
  >
    {children}
  </motion.div>
);

const TypingDots = () => (
  <div className="flex gap-1 px-2">
    {[0, 1, 2].map((i) => (
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
