import React, { useState } from 'react';
import { 
  Video, 
  Youtube, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  ExternalLink,
  Clock,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Upload,
  Link as LinkIcon,
  FileVideo,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const VideoLinksTab = ({ videoLinks, setVideoLinks, lessons, onSave }) => {
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    type: 'youtube', // youtube, vimeo, direct, upload
    description: '',
    duration: '',
    thumbnail: '',
    autoplay: false,
    controls: true,
    startTime: 0,
    endTime: null
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedLesson = lessons.find(l => l.id === selectedLessonId);
  const currentVideos = videoLinks[selectedLessonId] || [];

  // Video type options
  const videoTypes = [
    { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" /> },
    { id: 'vimeo', label: 'Vimeo', icon: <Video className="w-4 h-4" /> },
    { id: 'direct', label: 'Direct Link', icon: <LinkIcon className="w-4 h-4" /> },
    { id: 'upload', label: 'Upload File', icon: <Upload className="w-4 h-4" /> }
  ];

  // Add new video
  const addVideo = () => {
    if (!selectedLessonId || !newVideo.title.trim() || !newVideo.url.trim()) return;

    const video = {
      id: `video-${Date.now()}-${Math.random()}`,
      ...newVideo,
      addedAt: new Date().toISOString()
    };

    setVideoLinks(prev => ({
      ...prev,
      [selectedLessonId]: [...(prev[selectedLessonId] || []), video]
    }));

    // Reset form
    setNewVideo({
      title: '',
      url: '',
      type: 'youtube',
      description: '',
      duration: '',
      thumbnail: '',
      autoplay: false,
      controls: true,
      startTime: 0,
      endTime: null
    });
    setShowAddForm(false);

    // Auto-save if enabled
    handleAutoSave();
  };

  // Update video
  const updateVideo = (videoId, updatedData) => {
    setVideoLinks(prev => ({
      ...prev,
      [selectedLessonId]: prev[selectedLessonId].map(video => 
        video.id === videoId ? { ...video, ...updatedData } : video
      )
    }));
    handleAutoSave();
  };

  // Delete video
  const deleteVideo = (videoId) => {
    if (confirm('Delete this video link?')) {
      setVideoLinks(prev => ({
        ...prev,
        [selectedLessonId]: prev[selectedLessonId].filter(video => video.id !== videoId)
      }));
      handleAutoSave();
    }
  };

  // Auto-save functionality
  const handleAutoSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Extract video ID from URL
  const extractVideoId = (url, type) => {
    switch (type) {
      case 'youtube':
        const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
        return youtubeMatch ? youtubeMatch[1] : null;
      case 'vimeo':
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        return vimeoMatch ? vimeoMatch[1] : null;
      default:
        return null;
    }
  };

  // Generate embed URL
  const generateEmbedUrl = (video) => {
    const videoId = extractVideoId(video.url, video.type);
    
    switch (video.type) {
      case 'youtube':
        if (!videoId) return video.url;
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const params = [];
        if (video.autoplay) params.push('autoplay=1');
        if (!video.controls) params.push('controls=0');
        if (video.startTime) params.push(`start=${video.startTime}`);
        if (video.endTime) params.push(`end=${video.endTime}`);
        return embedUrl + (params.length ? '?' + params.join('&') : '');
      
      case 'vimeo':
        if (!videoId) return video.url;
        return `https://player.vimeo.com/video/${videoId}`;
      
      default:
        return video.url;
    }
  };

  // Generate thumbnail URL
  const generateThumbnailUrl = (video) => {
    if (video.thumbnail) return video.thumbnail;
    
    const videoId = extractVideoId(video.url, video.type);
    
    switch (video.type) {
      case 'youtube':
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null;
      case 'vimeo':
        // Vimeo thumbnails require API call, return placeholder
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      {/* Lesson Selector Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white p-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Lesson</h3>
          <p className="text-sm text-gray-600">
            Choose a lesson to manage its video links.
          </p>
        </div>

        <div className="space-y-2">
          {lessons.map((lesson) => {
            const videoCount = videoLinks[lesson.id]?.length || 0;
            return (
              <div
                key={lesson.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedLessonId === lesson.id
                    ? 'bg-purple-100 border-purple-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedLessonId(lesson.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{lesson.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{lesson.duration}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Video className="w-3 h-3" />
                    <span>{videoCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {lessons.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No lessons available
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {!selectedLessonId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lesson Selected</h3>
              <p className="text-gray-600">
                Select a lesson from the sidebar to manage its video links.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Video Links for: {selectedLesson?.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentVideos.length} video{currentVideos.length !== 1 ? 's' : ''} added
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {isSaving && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      Saving...
                    </span>
                  )}
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add Video Form */}
              {showAddForm && (
                <Card className="mb-6 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Video
                      </CardTitle>
                      <Button
                        onClick={() => setShowAddForm(false)}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Title</label>
                        <input
                          type="text"
                          value={newVideo.title}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Enter video title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video Type</label>
                        <select
                          value={newVideo.type}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          {videoTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                      <input
                        type="url"
                        value={newVideo.url}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={
                          newVideo.type === 'youtube' ? 'https://youtube.com/watch?v=...' :
                          newVideo.type === 'vimeo' ? 'https://vimeo.com/...' :
                          'https://example.com/video.mp4'
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                      <textarea
                        value={newVideo.description}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        rows={2}
                        placeholder="Brief description of the video content"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                        <input
                          type="text"
                          value={newVideo.duration}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, duration: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="e.g., 10:30"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (sec)</label>
                        <input
                          type="number"
                          value={newVideo.startTime}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, startTime: parseInt(e.target.value) || 0 }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time (sec)</label>
                        <input
                          type="number"
                          value={newVideo.endTime || ''}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, endTime: e.target.value ? parseInt(e.target.value) : null }))}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVideo.autoplay}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, autoplay: e.target.checked }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Autoplay</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVideo.controls}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, controls: e.target.checked }))}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">Show Controls</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={addVideo}
                        disabled={!newVideo.title.trim() || !newVideo.url.trim()}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Add Video
                      </Button>
                      <Button
                        onClick={() => setShowAddForm(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Video List */}
              {currentVideos.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Videos Added</h3>
                  <p className="text-gray-600 mb-4">
                    Add video links to enhance this lesson with multimedia content.
                  </p>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Video
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {currentVideos.map((video) => {
                    const thumbnailUrl = generateThumbnailUrl(video);
                    const embedUrl = generateEmbedUrl(video);
                    
                    return (
                      <Card key={video.id} className="overflow-hidden">
                        <div className="relative">
                          {/* Video Preview */}
                          <div className="aspect-video bg-gray-100 flex items-center justify-center">
                            {thumbnailUrl ? (
                              <img 
                                src={thumbnailUrl} 
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                {videoTypes.find(t => t.id === video.type)?.icon}
                                <p className="text-sm text-gray-500 mt-2">{video.type.toUpperCase()}</p>
                              </div>
                            )}
                            
                            {/* Play Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => window.open(video.url, '_blank')}
                                className="bg-white bg-opacity-90 text-gray-900 hover:bg-opacity-100"
                              >
                                <Play className="w-5 h-5 mr-2" />
                                Play
                              </Button>
                            </div>
                          </div>
                          
                          {/* Duration Badge */}
                          {video.duration && (
                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {video.duration}
                            </div>
                          )}
                        </div>
                        
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 line-clamp-2">{video.title}</h4>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                onClick={() => setEditingVideoId(video.id)}
                                variant="ghost"
                                size="sm"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => deleteVideo(video.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {video.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              {videoTypes.find(t => t.id === video.type)?.icon}
                              <span>{videoTypes.find(t => t.id === video.type)?.label}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {video.autoplay && <Play className="w-3 h-3" />}
                              {video.controls ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                              <Button
                                onClick={() => window.open(video.url, '_blank')}
                                variant="ghost"
                                size="sm"
                                className="p-0 h-auto"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoLinksTab;
