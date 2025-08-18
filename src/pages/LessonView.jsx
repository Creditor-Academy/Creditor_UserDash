import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize2, ChevronLeft, ChevronRight, Bookmark, BookOpen } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

const LessonView = () => {
  const { moduleId, lessonId } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [progress, setProgress] = useState(30); // Example progress
  const videoRef = useRef(null);
  const { toast } = useToast();

  // Mock data - replace with actual API call
  const lessonData = {
    "1": {
      "1": {
        id: "1",
        moduleId: "1",
        title: "What is Business Trust?",
        description: "Learn the basic definition and key concepts of business trust structures.",
        type: "video",
        duration: "15:30",
        completed: true,
        locked: false,
        thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        content: `
          <h2>Understanding Business Trust</h2>
          <p>A business trust is a legal entity created to hold and manage business assets. Unlike corporations or partnerships, business trusts offer unique advantages in terms of flexibility and tax treatment.</p>
          
          <h3>Key Characteristics</h3>
          <ul>
            <li>Separation of ownership and management</li>
            <li>Flexible governance structure</li>
            <li>Pass-through taxation benefits</li>
            <li>Limited liability protection</li>
          </ul>
          
          <h3>Common Use Cases</h3>
          <p>Business trusts are commonly used in real estate investment, asset management, and succession planning. They provide a robust framework for managing complex business relationships while maintaining operational flexibility.</p>
        `,
        transcript: [
          { time: '00:00', text: 'Welcome to the introduction of business trust.' },
          { time: '01:30', text: 'In this lesson, we will cover the basics of business trust.' },
          { time: '03:45', text: 'Understanding the legal structure is crucial for any business owner.' },
          // Add more transcript entries as needed
        ]
      },
      "2": {
        id: "2",
        moduleId: "1", 
        title: "Types of Business Trusts",
        description: "Explore different types of business trusts and their specific use cases.",
        type: "text",
        duration: "8 min read",
        completed: false,
        locked: false,
        thumbnail: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1000",
        videoUrl: "",
        content: `
          <h2>Types of Business Trusts</h2>
          <p>There are several types of business trusts, each designed for specific purposes and circumstances. Understanding these variations is crucial for selecting the right structure for your business needs.</p>
          
          <h3>1. Statutory Business Trusts</h3>
          <p>These are trusts created under specific state statutes that govern their formation and operation. They offer standardized structures with well-defined legal frameworks.</p>
          
          <h3>2. Common  Law Business Trusts</h3>
          <p>Also known as Massachusetts Trusts, these are created under common law principles without specific statutory authorization. They offer greater flexibility but may face more legal uncertainty.</p>
          
          <h3>3. Real Estate Investment Trusts (REITs)</h3>
          <p>Specialized business trusts that focus on real estate investments. REITs must meet specific requirements to qualify for favorable tax treatment.</p>
          
          <h3>4. Asset Protection Trusts</h3>
          <p>Designed primarily to protect assets from creditors while maintaining some level of beneficial interest for the settlor.</p>
          
          <h3>Choosing the Right Type</h3>
          <p>The choice of business trust type depends on factors such as the nature of assets, tax objectives, liability concerns, and regulatory requirements in your jurisdiction.</p>
        `,
        transcript: []
      }
    },
    "2": {
      "1": {
        id: "1",
        moduleId: "2",
        title: "Introduction to Context API",
        description: "Learn about the React Context API and its use cases",
        type: "text",
        duration: "8 min read",
        completed: true,
        locked: false,
        thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000",
        videoUrl: "",
        content: `
          <h2>Introduction to React Context API</h2>
          <p>The React Context API provides a way to pass data through the component tree without having to pass props down manually at every level. This is particularly useful for data that can be considered "global" for a tree of React components.</p>
          
          <h3>When to Use Context</h3>
          <ul>
            <li>Theme data (dark mode, light mode)</li>
            <li>User authentication state</li>
            <li>Language/locale settings</li>
            <li>Application-wide settings</li>
          </ul>
          
          <h3>Benefits of Context API</h3>
          <p>Context helps avoid prop drilling - the process of passing data through many components that don't actually need the data themselves. It creates a more maintainable and cleaner component structure.</p>
          
          <h3>When NOT to Use Context</h3>
          <p>Context is not a replacement for all prop passing. It should be used sparingly because it makes components less reusable. If you only want to avoid passing some props through many levels, component composition is often a simpler solution than context.</p>
        `,
        transcript: []
      },
      "2": {
        id: "2",
        moduleId: "2",
        title: "Creating a Context",
        description: "Learn how to create a context and provide it to your component tree.",
        type: "video",
        duration: "18:45",
        completed: true,
        locked: false,
        thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        content: `
          <h2>Creating a Context in React</h2>
          <p>React's Context API provides a way to share values like themes, user data, or any other application state between components without having to explicitly pass props through every level of the component tree.</p>
          
          <h3>Step 1: Create a Context</h3>
          <p>The first step is to create a context using the <code>createContext</code> function.</p>
          
          <pre><code>
import React, { createContext } from 'react';

const ThemeContext = createContext('light');
export default ThemeContext;
          </code></pre>
          
          <h3>Step 2: Create a Provider Component</h3>
          <p>Next, create a provider component that uses the Context.Provider to pass the value down the component tree.</p>
          
          <pre><code>
import React, { useState } from 'react';
import ThemeContext from './ThemeContext';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
          </code></pre>
        `,
        transcript: [
          { time: '00:00', text: 'Welcome to the introduction of React Context API.' },
          { time: '01:30', text: 'In this lesson, we will cover the basics of React Context API.' },
          { time: '03:45', text: 'Understanding the Context API is crucial for any React developer.' },
          // Add more transcript entries as needed
        ]
      }
    }
  };

  const lesson = lessonData[moduleId]?.[lessonId] || lessonData["2"]["2"];

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value[0] / 100;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleBookmark = () => {
    toast({
      title: 'Bookmark added',
      description: 'This lesson has been bookmarked.',
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/courses/module/${moduleId}/lessons`} className="flex items-center text-gray-600 hover:text-gray-900">
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Lessons</span>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Module {moduleId}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleBookmark}>
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmark
            </Button>
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              View Notes
            </Button>
          </div>
        </div>
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime(currentTime)} / {lesson.duration}</span>
            <span>{progress}% Complete</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h2>
          <p className="text-gray-600 mb-6">{lesson.description}</p>
          
          {/* Video Player */}
          {lesson.type === "video" && lesson.videoUrl && (
            <div className="bg-black rounded-lg overflow-hidden mb-8 shadow-lg">
              <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={(e) => setDuration(e.target.duration)}
                  onEnded={() => setIsPlaying(false)}
                  src={lesson.videoUrl}
                />
                
                {/* Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </Button>
                    
                    <div className="flex-1 flex items-center space-x-2">
                      <span className="text-xs text-white">{formatTime(currentTime)}</span>
                      <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="flex-1"
                      />
                      <span className="text-xs text-white">{formatTime(duration)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                        onClick={handleMuteToggle}
                      >
                        {isMuted || volume[0] === 0 ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </Button>
                      <Slider
                        value={volume}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Maximize2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Transcript Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Transcript</h3>
              <div className="space-y-4">
                {lesson.transcript.map((item, index) => (
                  <div key={index} className="flex">
                    <span className="text-sm font-medium text-gray-500 w-16 flex-shrink-0">
                      {item.time}
                    </span>
                    <p className="text-sm text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link to={`/courses/module/${moduleId}/lesson/${parseInt(lessonId) - 1}`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/courses/module/${moduleId}/lesson/${parseInt(lessonId) + 1}`}>
                Next Lesson
                <ChevronRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LessonView;