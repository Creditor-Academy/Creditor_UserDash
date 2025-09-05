import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Send, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { getGroupPosts, addComment, addLike, editComment, deleteComment } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";
import { fetchAllUsers } from "@/services/userService";
import getSocket from "@/services/socketClient";

export function NewsPage() {
  const { groupId } = useParams();
  const { userProfile } = useUser();
  const [posts, setPosts] = useState([]);
  const [rawPosts, setRawPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCommentContents, setNewCommentContents] = useState({});
  const [showCommentFields, setShowCommentFields] = useState({});
  const [likeBurst, setLikeBurst] = useState({});
  const [highlightComment, setHighlightComment] = useState({});
  const [userDirectory, setUserDirectory] = useState({});
  const [videoThumbnails, setVideoThumbnails] = useState({});
  const [videoDurations, setVideoDurations] = useState({});
  const [editingComment, setEditingComment] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  // Removed lightbox; images render fully inside the post box

  // Generate video thumbnail
  const generateVideoThumbnail = (videoUrl, postId) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = 1; // Seek to 1 second for thumbnail
    
    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      try {
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        setVideoThumbnails(prev => ({
          ...prev,
          [postId]: thumbnailUrl
        }));
      } catch (error) {
        console.warn('Could not generate thumbnail for video:', error);
      }
    });
    
    video.addEventListener('error', () => {
      console.warn('Could not load video for thumbnail generation');
    });
  };

  // Get video duration
  const getVideoDuration = (videoUrl, postId) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    
    video.addEventListener('loadedmetadata', () => {
      if (video.duration && !isNaN(video.duration)) {
        const minutes = Math.floor(video.duration / 60);
        const seconds = Math.floor(video.duration % 60);
        const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        setVideoDurations(prev => ({
          ...prev,
          [postId]: duration
        }));
      }
    });
    
    video.addEventListener('error', () => {
      console.warn('Could not get duration for video');
    });
  };

  useEffect(() => {
    // Preload a user directory to resolve commenter identities on refresh
    (async () => {
      try {
        const all = await fetchAllUsers();
        const list = Array.isArray(all?.data) ? all.data : all;
        const map = {};
        (list || []).forEach(u => { map[u.id] = u; });
        setUserDirectory(map);
      } catch (e) {
        // Non-fatal; names will fall back to "User" if not resolvable
        console.warn("NewsPage: unable to preload users for comments", e);
      }
    })();
  }, []);

  // Normalizer uses the latest userDirectory to map comment authors reliably
  const normalizePosts = (list) => {
    return (list || [])
      .filter(p => (p.type || "POST") !== "ANNOUNCEMENT") // Filter out announcements
      .map((p, idx) => {
      const author = p.user || p.author || {};
      const first = author.first_name || author.firstName || "";
      const last = author.last_name || author.lastName || "";
      const name = (first || last) ? `${first} ${last}`.trim() : author.name || "Member";
      const resolveUser = (userObj, userId) => {
        if (userObj) {
          const f = userObj.first_name || userObj.firstName || "";
          const l = userObj.last_name || userObj.lastName || "";
          const n = (f || l) ? `${f} ${l}`.trim() : userObj.name || "User";
          return { name: n, avatar: userObj.image || userObj.avatar || "" };
        }
        const u = userDirectory[userId];
        if (u) {
          const f = u.first_name || "";
          const l = u.last_name || "";
          const n = (f || l) ? `${f} ${l}`.trim() : u.name || "User";
          return { name: n, avatar: u.image || "" };
        }
        return { name: "User", avatar: "" };
      };
      // derive like state
      const likesArray = Array.isArray(p.likes) ? p.likes : [];
      const currentUserId = userProfile?.id;
      const derivedLikedByMe = likesArray.some(l => (l?.user_id || l?.userId || l?.user?.id) === currentUserId);
      const derivedLikesCount = likesArray.length || (p.likes_count || 0);

      return {
        id: p.id || p.post_id || idx,
        author: {
          name,
          avatar: author.image || author.avatar || "",
          isAdmin: author.role === "ADMIN" || false,
        },
        title: p.title || "",
        content: p.content || "",
        timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : (p.created_at ? new Date(p.created_at).toLocaleString() : ""),
        likesCount: derivedLikesCount,
        likedByMe: Boolean(derivedLikedByMe),
        isAnnouncement: false, // No announcements in news feed
        comments: Array.isArray(p.comments) ? p.comments.map((c, i) => {
          const authorMeta = resolveUser(c.user || c.author, c.user_id || c.userId);
          return {
            id: c.id || i,
            userId: c.user_id || c.userId || (c.user && (c.user.id || c.user.user_id)) || null,
            author: authorMeta,
            content: c.content || "",
            timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : (c.created_at ? new Date(c.created_at).toLocaleString() : "")
          };
        }) : [],
        mediaUrl: p.media_url || "",
        pinned: Boolean(p.is_pinned),
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await getGroupPosts(groupId);
        const list = Array.isArray(res?.data) ? res.data : res;
        const normalized = normalizePosts(list || []);
        if (isMounted) {
          setRawPosts(list || []);
          setPosts(normalized);
        }
      } catch (e) {
        if (isMounted) setError("Failed to load posts");
        console.error("NewsPage: error fetching posts", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (groupId) fetchPosts();
    return () => { isMounted = false; };
  }, [groupId]);

  // Socket integration for real-time updates
  useEffect(() => {
    const socket = getSocket();
    
    // Listen for new posts
    const onNewPost = (postData) => {
      if (postData?.group_id === groupId) {
        setRawPosts(prev => [postData, ...prev]);
      }
    };
    
    // Listen for new comments
    const onCommentAdded = (data) => {
      if (data?.postId) {
        setRawPosts(prev => prev.map(post => 
          post.id === data.postId 
            ? { ...post, comments: [...(post.comments || []), data.comment] }
            : post
        ));
      }
    };
    
    // Listen for like changes
    const onLikeAdded = (data) => {
      if (data?.postId) {
        setRawPosts(prev => prev.map(post => 
          post.id === data.postId 
            ? { ...post, likes: [...(post.likes || []), data.like] }
            : post
        ));
      }
    };
    
    const onLikeRemoved = (data) => {
      if (data?.postId) {
        setRawPosts(prev => prev.map(post => 
          post.id === data.postId 
            ? { ...post, likes: (post.likes || []).filter(like => like.user_id !== data.userId) }
            : post
        ));
      }
    };
    
    socket.on('groupPostCreated', onNewPost);
    socket.on('commentAdded', onCommentAdded);
    socket.on('likeAdded', onLikeAdded);
    socket.on('likeRemoved', onLikeRemoved);
    
    return () => {
      socket.off('groupPostCreated', onNewPost);
      socket.off('commentAdded', onCommentAdded);
      socket.off('likeAdded', onLikeAdded);
      socket.off('likeRemoved', onLikeRemoved);
    };
  }, [groupId]);

  // Re-normalize when userDirectory updates to fill in names/avatars post-refresh
  useEffect(() => {
    if (rawPosts && rawPosts.length) {
      setPosts(normalizePosts(rawPosts));
    }
  }, [userDirectory]);
  
  const handleCommentSubmit = async (postId) => {
    if (!newCommentContents[postId] || !newCommentContents[postId].trim()) return;
    try {
      const payload = { content: newCommentContents[postId].trim() };
      
      // Emit socket event for real-time updates
      const socket = getSocket();
      socket.emit('addComment', { 
        postId, 
        userId: userProfile?.id, 
        content: payload.content,
        groupId 
      });
      
      const res = await addComment(postId, payload);
      const created = res?.data || res; // backend returns {code,data,...}
      const createdCommentId = created?.id || Date.now();
      const createdAt = created?.createdAt ? new Date(created.createdAt).toLocaleString() : "Just now";
      const displayName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(" ") || userProfile?.name || "You";
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: createdCommentId,
                author: { name: displayName, avatar: userProfile?.image || "" },
                content: payload.content,
                timestamp: createdAt
              }
            ]
          };
        }
        return post;
      }));
      setNewCommentContents({ ...newCommentContents, [postId]: "" });
      setShowCommentFields({ ...showCommentFields, [postId]: false });
      setHighlightComment((prev) => ({ ...prev, [createdCommentId]: true }));
      setTimeout(() => {
        setHighlightComment((prev) => ({ ...prev, [createdCommentId]: false }));
      }, 1200);
    } catch (e) {
      console.error("NewsPage: error adding comment", e);
    }
  };
  
  const handleLike = async (postId) => {
    try {
      const target = posts.find(p => p.id === postId);
      if (!target || target.likedByMe) return; // prevent multiple likes by same user
      
      // Emit socket event for real-time updates
      const socket = getSocket();
      socket.emit('addLike', { 
        postId, 
        userId: userProfile?.id,
        groupId 
      });
      
      await addLike(postId);
      setPosts(posts.map(post => post.id === postId ? { ...post, likesCount: (post.likesCount || 0) + 1, likedByMe: true } : post));
      setLikeBurst((prev) => ({ ...prev, [postId]: true }));
      setTimeout(() => {
        setLikeBurst((prev) => ({ ...prev, [postId]: false }));
      }, 250);
    } catch (e) {
      console.error("NewsPage: error liking post", e);
    }
  };
  
  const toggleCommentField = (postId) => {
    setShowCommentFields({
      ...showCommentFields,
      [postId]: !showCommentFields[postId]
    });
    if (!newCommentContents[postId]) {
      setNewCommentContents({ ...newCommentContents, [postId]: "" });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading posts...</div>;
  }
  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6 bg-gradient-to-b from-sky-50 via-white to-indigo-50 p-2 rounded-xl">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-700">Group News</h1>
          <p className="text-sm text-gray-600">Latest updates and discussions from this group</p>
        </div>
        <span className="text-xs text-gray-400">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden border border-indigo-200 bg-white/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 rounded-xl">
            <div className="h-1 w-full bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="ring-2 ring-offset-2 ring-indigo-200">
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    {post.author.avatar && <AvatarImage src={post.author.avatar} />}
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {post.title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.title}</h3>
              )}
              <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</p>
              {post.mediaUrl && (
                <div className="rounded-xl border border-indigo-200 bg-white mt-3 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-3 border-b border-indigo-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Attachment</span>
                    <a
                      href={post.mediaUrl}
                      download
                      className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      title="Download attachment"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </a>
                  </div>
                  <div className="p-3">
                    {(() => {
                      const url = post.mediaUrl;
                      const lower = url.toLowerCase();
                      const isImage = /(\.png|\.jpg|\.jpeg|\.gif|\.webp)$/i.test(lower);
                      const isVideo = /(\.mp4|\.webm|\.ogg|\.mov)$/i.test(lower);
                      const isPdf = /(\.pdf)$/i.test(lower);
                      if (isImage) {
                        return (
                          <div className="space-y-3">
                            {/* Image Preview */}
                            <div className="relative group">
                          <img
                            src={url}
                            alt="post attachment"
                                className="w-full rounded-lg object-contain bg-gray-50 shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
                            loading="lazy"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              {/* Fallback for failed images */}
                              <div className="hidden w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-sm">Image failed to load</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Image Info */}
                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Image Content
                              </span>
                              <span className="text-gray-500">
                                {url.split('/').pop()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      if (isVideo) {
                        return (
                          <div className="space-y-3">
                            {/* Video Player */}
                            <div
                              className="relative"
                              onMouseEnter={() => {
                                const video = document.querySelector(`video[src="${url}"]`);
                                if (video) {
                                  video.muted = true;
                                  video.playsInline = true;
                                  video.loop = true;
                                  // only autoplay if not already playing
                                  const playPromise = video.play();
                                  if (playPromise && typeof playPromise.catch === 'function') {
                                    playPromise.catch(() => {});
                                  }
                                }
                              }}
                              onMouseLeave={() => {
                                const video = document.querySelector(`video[src="${url}"]`);
                                if (video) {
                                  video.pause();
                                  video.currentTime = 0;
                                }
                              }}
                            >
                          <video
                            src={url}
                            controls
                                muted
                                playsInline
                                preload="metadata"
                                poster={videoThumbnails[post.id] || `data:image/svg+xml;base64,${btoa(`
                                  <svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="100%" height="100%" fill="#1f2937"/>
                                    <circle cx="200" cy="112.5" r="40" fill="#6b7280"/>
                                    <polygon points="185,95 185,130 220,112.5" fill="white"/>
                                    <text x="200" y="160" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="14">Video Preview</text>
                                  </svg>
                                `)}`}
                                className="w-full max-h-[420px] rounded-lg bg-gray-900 shadow-lg transition-opacity duration-300"
                                onLoadStart={() => {
                                  // Show loading state
                                  const video = document.querySelector(`video[src="${url}"]`);
                                  if (video) {
                                    video.style.opacity = '0.7';
                                  }
                                }}
                                onCanPlay={() => {
                                  // Hide loading state
                                  const video = document.querySelector(`video[src="${url}"]`);
                                  if (video) {
                                    video.style.opacity = '1';
                                  }
                                }}
                                onError={() => {
                                  // Handle video loading error
                                  const video = document.querySelector(`video[src="${url}"]`);
                                  if (video) {
                                    video.style.display = 'none';
                                  }
                                }}
                                onLoadedMetadata={() => {
                                  // Generate thumbnail when video metadata is loaded
                                  if (!videoThumbnails[post.id]) {
                                    generateVideoThumbnail(url, post.id);
                                  }
                                  // Get video duration
                                  if (!videoDurations[post.id]) {
                                    getVideoDuration(url, post.id);
                                  }
                                }}
                                onPlay={() => {
                                  // Hide play overlay when video starts playing
                                  const overlay = document.getElementById(`play-overlay-${post.id}`);
                                  if (overlay) {
                                    overlay.style.display = 'none';
                                  }
                                }}
                                onPause={() => {
                                  // Show play overlay when video is paused
                                  const overlay = document.getElementById(`play-overlay-${post.id}`);
                                  if (overlay) {
                                    overlay.style.display = 'flex';
                                  }
                                }}
                              />
                              
                              {/* Loading Overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg opacity-0 transition-opacity duration-300" id={`loading-${post.id}`}>
                                <div className="text-center text-white">
                                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                                  <p className="text-sm">Loading video...</p>
                                </div>
                              </div>
                              
                              {/* Play Button Overlay */}
                              <div 
                                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 cursor-pointer group" 
                                id={`play-overlay-${post.id}`}
                                onClick={() => {
                                  const video = document.querySelector(`video[src="${url}"]`);
                                  if (video) {
                                    video.play();
                                  }
                                }}
                              >
                                <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform duration-200">
                                  <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Video Info */}
                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Video Content
                              </span>
                              <div className="flex items-center gap-3">
                                {videoDurations[post.id] && (
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {videoDurations[post.id]}
                                  </span>
                                )}
                                <span className="text-gray-500">
                                  {url.split('/').pop()}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      if (isPdf) {
                        return (
                          <div className="space-y-3">
                            {/* PDF Preview */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                              <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center gap-2">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-red-700">PDF Document</span>
                              </div>
                          <iframe
                            src={`${url}#view=FitH`}
                            title="PDF document"
                                className="w-full h-[520px] rounded-b-lg"
                                onLoad={() => {
                                  // PDF loaded successfully
                                }}
                                onError={() => {
                                  // Handle PDF loading error
                                }}
                              />
                            </div>
                            
                            {/* PDF Info */}
                            <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                PDF Document
                              </span>
                              <span className="text-gray-500">
                                {url.split('/').pop()}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      // Fallback: embed inline with iframe (no download button)
                      return (
                        <div className="space-y-3">
                          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              <span className="text-sm font-medium text-gray-700">File Attachment</span>
                            </div>
                        <iframe
                          src={url}
                          title="Attachment"
                              className="w-full h-[520px] rounded-b-lg"
                            />
                          </div>
                          
                          {/* File Info */}
                          <div className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              File Content
                            </span>
                            <span className="text-gray-500">
                              {url.split('/').pop()}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col items-stretch">
              <div className="flex justify-between items-center w-full mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  disabled={post.likedByMe}
                  className={`gap-1 rounded-full ${post.likedByMe ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'} ${likeBurst[post.id] ? 'scale-105 text-blue-700' : ''}`}
                  style={{ transition: 'transform 150ms ease, color 150ms ease' }}
                  onClick={() => handleLike(post.id)}
                  title={post.likedByMe ? 'You liked this' : 'Like'}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.likedByMe ? '' : ''} ${likeBurst[post.id] ? 'animate-pulse' : ''}`} />
                  {post.likesCount > 0 && <span className={`${likeBurst[post.id] ? 'animate-pulse' : ''}`}>{post.likesCount}</span>}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors rounded-full"
                  onClick={() => toggleCommentField(post.id)}
                >
                  <MessageSquare className="h-4 w-4" />
                  {post.comments.length > 0 && <span>{post.comments.length}</span>}
                </Button>
              </div>
              
              {post.comments.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <div className="space-y-3 w-full mt-2">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className={`group flex gap-2 ${highlightComment[comment.id] ? 'animate-[pulse_1.2s_ease_1]' : ''}`}>
                        <Avatar className="h-6 w-6 ring-2 ring-indigo-200 ring-offset-2">
                          <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
                          {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                        </Avatar>
                        <div className={`relative bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-sm flex-1 shadow-sm ${highlightComment[comment.id] ? 'ring-2 ring-blue-200' : ''}`}>
                          {/* Hover actions: edit/delete for owner, delete for admin */}
                          <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 bg-white/90 border border-gray-200 rounded-full px-2 py-1 shadow-sm">
                              {(userProfile?.id === (comment.userId || comment.user_id)) && editingComment !== comment.id && (
                                <button
                                  className="p-1 hover:text-indigo-700"
                                  onClick={() => { setEditingComment(comment.id); setCommentDraft(comment.content); }}
                                  title="Edit comment"
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
                                </button>
                              )}
                              {((userProfile?.role === 'ADMIN') || (userProfile?.id === (comment.userId || comment.user_id))) && (
                                <button
                                  className="p-1 hover:text-red-700"
                                  onClick={async () => {
                                    try {
                                      await deleteComment(post.id, comment.id);
                                    } catch {}
                                    setPosts(prev => prev.map(p => p.id === post.id ? ({...p, comments: p.comments.filter(c => c.id !== comment.id)}) : p));
                                  }}
                                  title="Delete comment"
                                >
                                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="font-medium text-gray-900">{comment.author.name}</div>
                          {editingComment === comment.id ? (
                            <div className="mt-1 flex items-center gap-2">
                              <Textarea
                                className="text-sm flex-1 min-h-[48px]"
                                value={commentDraft}
                                onChange={(e) => setCommentDraft(e.target.value)}
                              />
                              <Button size="sm" onClick={async () => {
                                setEditingComment(null);
                                setPosts(prev => prev.map(p => p.id === post.id ? ({...p, comments: p.comments.map(c => c.id === comment.id ? ({...c, content: commentDraft}) : c)}) : p));
                                try {
                                  await editComment(post.id, comment.id, { content: commentDraft });
                                } catch {}
                              }}>Save</Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Cancel</Button>
                            </div>
                          ) : (
                          <p className="text-gray-800">{comment.content}</p>
                          )}
                          <div className="text-xs text-gray-500 mt-1">{comment.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {showCommentFields[post.id] && (
                <div className="flex gap-2 mt-3 w-full">
                  <Avatar className="h-6 w-6 ring-2 ring-indigo-200 ring-offset-2">
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newCommentContents[post.id] || ""}
                      onChange={(e) => setNewCommentContents({
                        ...newCommentContents,
                        [post.id]: e.target.value
                      })}
                      className="text-sm min-h-[60px] flex-1 border-indigo-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 rounded-xl bg-white/90"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!newCommentContents[post.id] || !newCommentContents[post.id].trim()}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 shadow"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default NewsPage;