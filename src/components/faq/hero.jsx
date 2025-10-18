import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import herofaq from '../../assets/herofaq.mp4';
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiBookOpen,
  FiMessageSquare,
  FiUsers,
  FiGlobe,
  FiLock,
  FiCreditCard,
  FiMail,
  FiCalendar,
  FiFileText,
  FiHelpCircle,
  FiExternalLink,
  FiX,
  FiThumbsUp,
  FiThumbsDown,
} from 'react-icons/fi';

// Sample FAQ data
const FaqItems = [
  {
    id: "1",
    question: "How do I create a course in Athena LMS?",
    answer: "To create a course, navigate to your instructor dashboard and click the 'Create New Course' button. You'll be guided through a step-by-step process to add content, set up assessments, and configure course settings.",
    category: "courses",
    difficulty: "beginner",
    lastUpdated: "2023-11-15",
    helpful: 42,
    notHelpful: 3,
    links: [
      { id: "1-1", title: "Course Creation Guide", href: "/guides/course-creation" },
      { id: "1-2", title: "Video Tutorial", href: "/tutorials/course-setup" },
    ],
  },
  {
    id: "2",
    question: "What are the system requirements for Athena LMS?",
    answer: "Athena LMS works on all modern browsers including Chrome, Firefox, Safari, and Edge. For the best experience, we recommend using the latest browser versions. Mobile apps are available for iOS and Android devices.",
    category: "technical",
    difficulty: "beginner",
    lastUpdated: "2023-10-28",
    helpful: 28,
    notHelpful: 2,
    links: [
      { id: "2-1", title: "System Requirements", href: "/system-requirements" },
      { id: "2-2", title: "Mobile App Download", href: "/mobile-app" },
    ],
  },
  {
    id: "3",
    question: "How do I reset my password?",
    answer: "Click on the 'Forgot Password' link on the login page. Enter your email address, and we'll send you a password reset link. If you're still having issues, contact our support team for assistance.",
    category: "account",
    difficulty: "beginner",
    lastUpdated: "2023-12-01",
    helpful: 67,
    notHelpful: 5,
    links: [{ id: "3-1", title: "Account Recovery", href: "/account/recovery" }],
  },
  {
    id: "4",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans. For enterprise customers, we also offer invoice-based billing with net-30 terms.",
    category: "billing",
    difficulty: "intermediate",
    lastUpdated: "2023-11-20",
    helpful: 31,
    notHelpful: 4,
    links: [
      { id: "4-1", title: "Billing & Payments", href: "/billing" },
      { id: "4-2", title: "Enterprise Pricing", href: "/enterprise" },
    ],
  },
  {
    id: "5",
    question: "How is my data secured?",
    answer: "We use industry-standard encryption, regular security audits, and comply with GDPR regulations. All data is stored on secure servers with 99.9% uptime guarantee and regular backups.",
    category: "security",
    difficulty: "advanced",
    lastUpdated: "2023-12-05",
    helpful: 89,
    notHelpful: 1,
    links: [
      { id: "5-1", title: "Security Overview", href: "/security" },
      { id: "5-2", title: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    id: "6",
    question: "Can I integrate with other tools?",
    answer: "Yes, Athena LMS offers integrations with popular tools like Zoom, Google Drive, Microsoft Teams, and many others through our API and pre-built connectors.",
    category: "technical",
    difficulty: "intermediate",
    lastUpdated: "2023-11-10",
    helpful: 56,
    notHelpful: 7,
    links: [
      { id: "6-1", title: "Integrations", href: "/integrations" },
      { id: "6-2", title: "API Documentation", href: "/api-docs" },
    ],
  },
];

// Difficulty badges with colors and icons
const difficultyLevels = {
  beginner: { label: "Beginner", color: { backgroundColor: '#dcfce7', color: '#166534' }, icon: "🌱" },
  intermediate: { label: "Intermediate", color: { backgroundColor: '#dbeafe', color: '#1e40af' }, icon: "🚀" },
  advanced: { label: "Advanced", color: { backgroundColor: '#f3e8ff', color: '#7e22ce' }, icon: "🏆" },
};

// Category colors for pills
const categoryColors = {
  account: { backgroundColor: '#fce7f3', color: '#be185d' },
  courses: { backgroundColor: '#dcfce7', color: '#166534' },
  technical: { backgroundColor: '#dbeafe', color: '#1e40af' },
  billing: { backgroundColor: '#fef9c3', color: '#a16207' },
  security: { backgroundColor: '#f3e8ff', color: '#7e22ce' },
};

// Main styles
const styles = {
  section: {
    width: '100%',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)',
    padding: '48px 0',
    position: 'relative',
    overflow: 'hidden',
  },
  container: {
    position: 'relative',
    width: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 16px',
    marginBottom: '64px',
  },
  videoContainer: {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    padding: '80px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heading: {
    color: 'white',
    fontSize: '48px',
    fontWeight: '800',
    lineHeight: '1.2',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    margin: 0,
  },
  subheading: {
    color: 'white',
    fontSize: '20px',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
    margin: '16px 0 0 0',
    maxWidth: '500px',
  },
  searchContainer: {
    position: 'relative',
    flexGrow: 1,
    maxWidth: '640px',
    margin: '0 auto',
  },
  searchInput: {
    width: '100%',
    padding: '16px 72px 16px 48px',
    fontSize: '18px',
    borderRadius: '16px',
    border: 'none',
    outline: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    color: '#1f2937',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    fontSize: '20px',
  },
  clearButton: {
    position: 'absolute',
    right: '52px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  voiceButton: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    color: 'white',
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    marginTop: '8px',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    zIndex: 20,
  },
  suggestionItem: {
    width: '100%',
    textAlign: 'left',
    padding: '16px',
    backgroundColor: 'white',
    border: 'none',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  categories: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '64px',
  },
  categoryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'all 0.2s',
    userSelect: 'none',
  },
  categoryCount: {
    fontSize: '12px',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  faqGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  resultsTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  sortSelect: {
    fontSize: '14px',
    backgroundColor: '#f1f5f9',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 12px',
    outline: 'none',
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  faqButton: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '24px',
    textAlign: 'left',
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  faqContent: {
    padding: '0 24px 24px 24px',
    backgroundColor: '#f8fafc',
  },
  faqAnswer: {
    color: '#374151',
    marginBottom: '16px',
  },
  feedbackSection: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  feedbackTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '12px',
  },
  feedbackButtons: {
    display: 'flex',
    gap: '12px',
  },
  feedbackButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 12px',
    backgroundColor: '#f1f5f9',
    color: '#374151',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
  },
  helpfulCount: {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#6b7280',
  },
  linksSection: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  linksTitle: {
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: '12px',
  },
  linksContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  linkButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '14px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  noResults: {
    textAlign: 'center',
    padding: '64px',
    backgroundColor: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
  },
  noResultsIcon: {
    fontSize: '48px',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  noResultsTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
  },
  noResultsText: {
    color: '#6b7280',
    marginBottom: '24px',
  },
  clearSearchButton: {
    padding: '8px 16px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  sidebar: {
    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    borderRadius: '16px',
    padding: '32px',
    color: 'white',
    position: 'sticky',
    top: '24px',
    boxShadow: '0 10px 15px rgba(37, 99, 235, 0.3)',
    overflow: 'hidden',
  },
  sidebarTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  sidebarText: {
    opacity: 0.9,
    marginBottom: '24px',
  },
  sidebarButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginBottom: '12px',
  },
  resourcesSection: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  resourcesTitle: {
    fontWeight: '500',
    marginBottom: '12px',
  },
  resourcesList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 0',
    opacity: 0.9,
  },
  resourceDot: {
    width: '8px',
    height: '8px',
    backgroundColor: 'white',
    borderRadius: '50%',
    marginRight: '12px',
  },
  statsSection: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '100%',
    maxWidth: '448px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1f2937',
    margin: 0,
  },
  modalClose: {
    color: '#6b7280',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '16px',
  },
  formLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px',
  },
  formInput: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
  },
  formTextarea: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    resize: 'vertical',
    minHeight: '96px',
  },
  formSelect: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
  },
  submitButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  helpSection: {
    marginTop: '80px',
    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
    borderRadius: '16px',
    padding: '32px',
    color: 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  helpBubble1: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '256px',
    height: '256px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  },
  helpBubble2: {
    position: 'absolute',
    bottom: '-80px',
    left: '-80px',
    width: '160px',
    height: '160px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '50%',
  },
  helpContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    maxWidth: '768px',
    margin: '0 auto',
  },
  helpTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  helpText: {
    color: '#dbeafe',
    marginBottom: '32px',
  },
  helpButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  helpButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  chatButton: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    zIndex: 40,
  },
};

export default function Hero() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    message: "",
    category: "general",
  });

  // Voice search state controls
  const [isListening, setIsListening] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 to 1
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);
  const mediaStreamRef = useRef(null);

  const placeholders = [
    "Try: 'How to reset my password?'",
    "Try: 'What are system requirements?'",
    "Try: 'How to create a course?'",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  // Toggle category multi-select
  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Filter categories and FAQs
  const allCategories = Array.from(new Set(FaqItems.map((item) => item.category)));
  const availableCategories = [
    { id: "all", title: "All FAQs", icon: <FiBookOpen />, count: FaqItems.length },
    ...allCategories.map((category) => {
      const categoryIcon =
        category === "account"
          ? <FiUsers />
          : category === "courses"
          ? <FiBookOpen />
          : category === "technical"
          ? <FiGlobe />
          : category === "billing"
          ? <FiCreditCard />
          : category === "security"
          ? <FiLock />
          : <FiHelpCircle />;
      return {
        id: category,
        title: category.charAt(0).toUpperCase() + category.slice(1),
        icon: categoryIcon,
        count: FaqItems.filter((item) => item.category === category).length,
      };
    }),
  ];

  const filteredFaqs = FaqItems.filter(
    (item) =>
      (selectedCategories.length === 0 || selectedCategories.includes(item.category)) &&
      (searchQuery === "" ||
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleHelpfulFeedback = (id, isHelpful) => {
    setHelpfulFeedback((prev) => ({ ...prev, [id]: isHelpful }));
  };

  // Voice search with recording animation using Web Audio API for volume
  const stopListening = () => {
    try {
      recognitionRef.current && recognitionRef.current.stop();
    } catch {}
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    audioContextRef.current = null;
    recognitionRef.current = null;
    setIsListening(false);
    setVolumeLevel(0);
  };

  const handleVoiceSearch = async () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Your browser does not support voice search.");
      return;
    }

    // Toggle off if already listening
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onstart = async () => {
      setIsListening(true);
      // Setup AudioContext for volume analysis
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      try {
        mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e) {
        stopListening();
        return;
      }
      const microphone = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      microphone.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      const updateVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let values = 0;
          for (let i = 0; i < dataArray.length; i++) values += dataArray[i];
          const average = values / dataArray.length;
          setVolumeLevel(Math.min(average / 128, 1));
        }
        animationIdRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    };

    recognition.onresult = (event) => {
      setSearchQuery(event.results[0][0].transcript);
    };

    recognition.onerror = () => {
      stopListening();
    };

    recognition.onend = () => {
      stopListening();
    };

    recognition.start();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    if (searchQuery) {
      setActiveFaq(null);
    }
  }, [searchQuery]);

  return (
    <section style={styles.section}>
      {/* Upper section with background video and overlay */}
      <div style={styles.container}>
        <div style={styles.videoContainer}>
          {/* Background video */}
          <video
            style={styles.video}
            src={herofaq}
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Light blue overlay */}
          <div style={styles.overlay}></div>

          {/* Content container with padding */}
          <div style={styles.content}>
            {/* Left side: Heading and subheading*/}
            <div style={{ maxWidth: '672px', textAlign: 'left', flexShrink: 0 }}>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={styles.heading}
              >
                How can we help?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={styles.subheading}
              >
                Find answers to common questions about Athena LMS. Our knowledge base is here to help you make the most of your learning experience.
              </motion.p>
            </div>

            {/* Center: Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={styles.searchContainer}
            >
              <div style={{ position: 'relative' }}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder={placeholders[placeholderIndex]}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                  aria-label="Search FAQs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={styles.clearButton}
                    aria-label="Clear search"
                  >
                    <FiX size={20} />
                  </button>
                )}

                {/* Voice Search Button with Recording Animation */}
                <button
                  onClick={handleVoiceSearch}
                  style={styles.voiceButton}
                  aria-label={isListening ? "Stop voice search" : "Start voice search"}
                  type="button"
                >
                  <motion.div
                    style={{ borderRadius: '50%', padding: '8px' }}
                    animate={{
                      scale: isListening ? 1 + volumeLevel * 0.6 : 1,
                      boxShadow: isListening
                        ? `0 0 12px ${volumeLevel * 15}px rgba(220,38,38,${volumeLevel.toFixed(2)})`
                        : "none",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        fill: isListening ? "red" : "none",
                        stroke: "currentColor",
                        strokeWidth: 2
                      }}
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 1v11m0 0a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v3a3 3" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </motion.div>
                </button>
              </div>

              {/* Search suggestions */}
              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.suggestions}
                >
                  {FaqItems.filter(
                    (item) =>
                      item.question.toLowerCase().includes(searchQuery.toLowerCase()) &&
                      !filteredFaqs.includes(item)
                  )
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setSearchQuery(item.question);
                          setSelectedCategories([item.category]);
                        }}
                        style={styles.suggestionItem}
                      >
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{item.question}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{item.category}</div>
                      </button>
                    ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Rest of the content */}
      <div style={{...styles.container, position: 'relative', zIndex: 10}}>
        {/* Category Filter Pills with Multi-select and FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={styles.categories}
        >
          {availableCategories.map((category) => (
            <div key={category.id} style={{ position: 'relative' }}>
              <motion.button
                onClick={() => {
                  if (category.id === "all") {
                    setSelectedCategories([]); // Clear all on clicking "All FAQs"
                  } else {
                    toggleCategory(category.id);
                  }
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...styles.categoryButton,
                  backgroundColor: (category.id === "all"
                    ? selectedCategories.length === 0
                    : selectedCategories.includes(category.id))
                    ? '#2563eb' : 'white',
                  color: (category.id === "all"
                    ? selectedCategories.length === 0
                    : selectedCategories.includes(category.id))
                    ? 'white' : '#374151',
                  boxShadow: (category.id === "all"
                    ? selectedCategories.length === 0
                    : selectedCategories.includes(category.id))
                    ? '0 4px 6px rgba(37, 99, 235, 0.3)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
                }}
                aria-pressed={category.id === "all" ? selectedCategories.length === 0 : selectedCategories.includes(category.id)}
                aria-label={`Filter by ${category.title}`}
                type="button"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring" }}
                  style={{ flexShrink: 0 }}
                >
                  {category.icon}
                </motion.div>
                <span
                  style={{
                    fontWeight: '500',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    ...(category.id !== "all" ? categoryColors[category.id] || { backgroundColor: '#f3f4f6', color: '#374151' } : {}),
                  }}
                >
                  {category.title}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    backgroundColor: (category.id === "all"
                      ? selectedCategories.length === 0
                      : selectedCategories.includes(category.id))
                      ? 'rgba(255, 255, 255, 0.2)' : '#f3f4f6',
                  }}
                >
                  {category.count}
                </span>
              </motion.button>
            </div>
          ))}
        </motion.div>

        {/* FAQ Content */}
        <div style={styles.faqGrid}>
          {/* FAQ List */}
          <div style={{ gridColumn: 'span 2' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={styles.resultsHeader}
            >
              <h2 style={styles.resultsTitle}>
                {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"}{" "}
                {searchQuery && `for "${searchQuery}"`}
              </h2>
              {filteredFaqs.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Sort by:</span>
                  <select style={styles.sortSelect}>
                    <option>Most relevant</option>
                    <option>Most helpful</option>
                    <option>Newest</option>
                    <option>Difficulty</option>
                  </select>
                </div>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq) => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    style={styles.faqItem}
                  >
                    <motion.button
                      onClick={() => toggleFaq(faq.id)}
                      whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                      style={styles.faqButton}
                      aria-expanded={activeFaq === faq.id}
                      aria-controls={`faq-content-${faq.id}`}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: '500',
                              padding: '4px 8px',
                              borderRadius: '9999px',
                              ...difficultyLevels[faq.difficulty]?.color,
                            }}
                          >
                            {difficultyLevels[faq.difficulty]?.icon}{" "}
                            {difficultyLevels[faq.difficulty]?.label}
                          </span>
                          <span style={{ fontSize: '12px', color: '#6b7280' }}>Updated: {faq.lastUpdated}</span>
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', paddingRight: '16px' }}>{faq.question}</h3>
                      </div>
                      {activeFaq === faq.id ? (
                        <FiChevronUp style={{ color: '#3b82f6', flexShrink: 0, marginTop: '8px' }} />
                      ) : (
                        <FiChevronDown style={{ color: '#9ca3af', flexShrink: 0, marginTop: '8px' }} />
                      )}
                    </motion.button>

                    <AnimatePresence>
                      {activeFaq === faq.id && (
                        <motion.div
                          id={`faq-content-${faq.id}`}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={styles.faqContent}
                        >
                          <p style={styles.faqAnswer}>{faq.answer}</p>
                          {/* Helpful feedback section */}
                          <div style={styles.feedbackSection}>
                            <p style={styles.feedbackTitle}>
                              Was this helpful?
                            </p>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              {helpfulFeedback[faq.id] === undefined ? (
                                <>
                                  <button
                                    onClick={() => handleHelpfulFeedback(faq.id, true)}
                                    style={styles.feedbackButton}
                                    aria-label="Yes, this was helpful"
                                  >
                                    <FiThumbsUp style={{ fontSize: '14px' }} /> Yes
                                  </button>
                                  <button
                                    onClick={() => handleHelpfulFeedback(faq.id, false)}
                                    style={styles.feedbackButton}
                                    aria-label="No, this was not helpful"
                                  >
                                    <FiThumbsDown style={{ fontSize: '14px' }} /> No
                                  </button>
                                </>
                              ) : (
                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                  {helpfulFeedback[faq.id]
                                    ? "Thank you for your feedback! 👍"
                                    : "We're sorry to hear that. Consider contacting our support for more help."}
                                </div>
                              )}

                              <div style={styles.helpfulCount}>
                                {faq.helpful} people found this helpful
                              </div>
                            </div>
                          </div>

                          {faq.links && faq.links.length > 0 && (
                            <div style={styles.linksSection}>
                              <h4 style={styles.linksTitle}>Related resources:</h4>
                              <div style={styles.linksContainer}>
                                {faq.links.map((link) => (
                                  <motion.div
                                    key={link.id}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <a
                                      href={link.href}
                                      style={styles.linkButton}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {link.title}
                                      <FiExternalLink style={{ fontSize: '12px' }} />
                                    </a>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={styles.noResults}
                >
                  <FiSearch style={styles.noResultsIcon} />
                  <h3 style={styles.noResultsTitle}>No results found</h3>
                  <p style={styles.noResultsText}>Try different keywords or browse all categories</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategories([]);
                    }}
                    style={styles.clearSearchButton}
                  >
                    Clear Search
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Contact Form Modal */}
        <AnimatePresence>
          {showContactForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
              onClick={() => setShowContactForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={styles.modalHeader}>
                  <h3 style={styles.modalTitle}>Contact Support</h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    style={styles.modalClose}
                    aria-label="Close contact form"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <form
                  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    console.log("Contact form submitted:", contactFormData);
                    setShowContactForm(false);
                    setContactFormData({ name: "", email: "", message: "", category: "general" });
                    alert("Thank you for your message! We'll get back to you soon.");
                  }}
                >
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Name</label>
                    <input
                      type="text"
                      required
                      value={contactFormData.name}
                      onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      required
                      value={contactFormData.email}
                      onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                      style={styles.formInput}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Category</label>
                    <select
                      value={contactFormData.category}
                      onChange={(e) => setContactFormData({ ...contactFormData, category: e.target.value })}
                      style={styles.formSelect}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactFormData.message}
                      onChange={(e) => setContactFormData({ ...contactFormData, message: e.target.value })}
                      style={styles.formTextarea}
                    />
                  </div>
                  <button
                    type="submit"
                    style={styles.submitButton}
                  >
                    Send Message
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Additional Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={styles.helpSection}
        >
          <div style={styles.helpBubble1}></div>
          <div style={styles.helpBubble2}></div>

          <div style={styles.helpContent}>
            <h2 style={styles.helpTitle}>Still can't find what you're looking for?</h2>
            <p style={styles.helpText}>
              Explore our documentation or get in touch with our support team for personalized assistance.
            </p>
            <div style={styles.helpButtons}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                style={{...styles.helpButton, backgroundColor: 'white', color: '#2563eb'}}
              >
                <FiFileText style={{ fontSize: '18px' }} />
                Browse Documentation
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowContactForm(true)}
                style={{...styles.helpButton, backgroundColor: '#1e40af', color: 'white'}}
              >
                <FiMail style={{ fontSize: '18px' }} />
                Submit a Ticket
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Chat Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={styles.chatButton}
        aria-label="Live chat support"
      >
        <FiMessageSquare size={24} />
      </motion.button>
    </section>
  );
}