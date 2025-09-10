import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Send, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { getGroupPosts, addComment, addLike, editComment, deleteComment, deleteGroupPost, isUserGroupAdmin } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";
import { fetchAllUsers, fetchDetailedUserProfile } from "@/services/userService";
import getSocket from "@/services/socketClient";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

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
  const [editingComment, setEditingComment] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [commentSending, setCommentSending] = useState({});
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [deleteTargetPostId, setDeleteTargetPostId] = useState(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoModalMessage, setInfoModalMessage] = useState("");
  // Removed lightbox; images render fully inside the post box

  useEffect(() => {
    // Determine if current user is group admin (controls post delete capability)
    (async () => {
      try {
        if (groupId) {
          const admin = await isUserGroupAdmin(groupId);
          setIsGroupAdmin(Boolean(admin));
        } else {
          setIsGroupAdmin(false);
        }
      } catch {
        setIsGroupAdmin(false);
      }
    })();
    
    // Preload a user directory to resolve commenter identities on refresh
    const loadUserDirectory = async () => {
      try {
        // Try to load from localStorage first
        const cached = localStorage.getItem('userDirectory');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && typeof parsed === 'object') {
              setUserDirectory(parsed);
              console.log('User directory loaded from cache with', Object.keys(parsed).length, 'users');
            }
          } catch (e) {
            console.warn('Failed to parse cached user directory:', e);
          }
        }
        
        // Always fetch fresh data
        const all = await fetchAllUsers();
        const list = Array.isArray(all?.data) ? all.data : all;
        const map = {};
        (list || []).forEach(u => {
          if (!u) return;
          const key = (u.id !== undefined && u.id !== null) ? u.id : ((u._id !== undefined && u._id !== null) ? u._id : undefined);
          if (key !== undefined && key !== null) {
            map[String(key)] = u;
          }
        });
        
        // Update state and cache
        setUserDirectory(map);
        localStorage.setItem('userDirectory', JSON.stringify(map));
        console.log('User directory loaded with', Object.keys(map).length, 'users');
      } catch (e) {
        // Non-fatal; names will fall back to "User" if not resolvable
        console.warn("NewsPage: unable to preload users for comments", e);
      }
    };
    
    loadUserDirectory();
    
    // Cleanup function to clear cache when groupId changes
    return () => {
      // Optionally clear cache on unmount (uncomment if needed)
      // localStorage.removeItem('userDirectory');
    };
  }, [groupId]);

  // Normalizer uses the latest userDirectory to map comment authors reliably
  const normalizePosts = (list) => {
    return (list || [])
      .filter(p => (p.type || "POST") !== "ANNOUNCEMENT") // Filter out announcements
      .map((p, idx) => {
      const author = p.user || p.author || {};
      const first = author.first_name || author.firstName || "";
      const last = author.last_name || author.lastName || "";
      const name = (first || last) ? `${first} ${last}`.trim() : author.name || "Member";
      const authorId = author.id || author.user?.id || author.user_id || author.userId || author._id || p.user_id || p.author_id || p.userId || p.authorId;
      const authorAvatarCandidate = 
        author.image || author.avatar || author.photo || author.picture ||
        author.image_url || author.avatar_url || author.profile_image || author.profile_picture || "";
      const fallbackUserFromDirectory = (authorId !== undefined && authorId !== null) ? userDirectory[String(authorId)] : undefined;
      const fallbackUserFlat = fallbackUserFromDirectory && (fallbackUserFromDirectory.user ? fallbackUserFromDirectory.user : fallbackUserFromDirectory);
      const resolvedAuthorAvatar = authorAvatarCandidate 
        || fallbackUserFlat?.image 
        || fallbackUserFlat?.avatar 
        || fallbackUserFlat?.profile_picture 
        || fallbackUserFlat?.image_url 
        || fallbackUserFlat?.avatar_url 
        || "";
      const resolveUser = (userObj, userId) => {
        const dirUserRaw = (userId !== undefined && userId !== null) ? userDirectory[String(userId)] : undefined;
        const dirUser = dirUserRaw && (dirUserRaw.user ? dirUserRaw.user : dirUserRaw);
        
        // Try to get name from userObj first, then directory
        const first = (userObj && (userObj.first_name || userObj.firstName || userObj.given_name)) || (dirUser && (dirUser.first_name || dirUser.firstName || dirUser.given_name)) || "";
        const last = (userObj && (userObj.last_name || userObj.lastName || userObj.family_name)) || (dirUser && (dirUser.last_name || dirUser.lastName || dirUser.family_name)) || "";
        
        // Fallback name sources
        const fallbackName = (userObj && (userObj.name || userObj.display_name || userObj.full_name || userObj.username || [userObj.first_name, userObj.last_name].filter(Boolean).join(" "))) 
          || (dirUser && (dirUser.name || dirUser.display_name || dirUser.full_name || dirUser.username || [dirUser.first_name, dirUser.last_name].filter(Boolean).join(" "))) 
          || `User ${userId || 'Unknown'}`;
        
        const name = (first || last) ? `${first} ${last}`.trim() : fallbackName;
        
        // Try to get avatar from userObj first, then directory
        const avatar = (userObj && (userObj.image || userObj.avatar || userObj.photo || userObj.picture || userObj.profile_picture || userObj.image_url || userObj.avatar_url || userObj.avatarUrl || userObj.photoURL)) 
                       || (dirUser && (dirUser.image || dirUser.avatar || dirUser.photo || dirUser.picture || dirUser.profile_picture || dirUser.image_url || dirUser.avatar_url || dirUser.avatarUrl || dirUser.photoURL)) 
                       || "";
        
        return { name, avatar };
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
          avatar: resolvedAuthorAvatar,
          isAdmin: author.role === "ADMIN" || false,
        },
        title: p.title || "",
        content: p.content || "",
        timestamp: p.createdAt ? new Date(p.createdAt).toLocaleString() : (p.created_at ? new Date(p.created_at).toLocaleString() : ""),
        likesCount: derivedLikesCount,
        likedByMe: Boolean(derivedLikedByMe),
        isAnnouncement: false, // No announcements in news feed
        comments: Array.isArray(p.comments) ? p.comments.map((c, i) => {
          const commentUserId = c.user_id || c.userId || c.author_id || c.authorId || (c.user && (c.user.id || c.user.user_id || c.user.userId || c.user._id)) || (c.author && (c.author.id || c.author.user_id || c.author.userId || c.author._id)) || null;
          const authorMeta = resolveUser(c.user || c.author, commentUserId);
          return {
            id: c.id || i,
            userId: commentUserId,
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
    if (rawPosts && rawPosts.length && Object.keys(userDirectory).length > 0) {
      setPosts(normalizePosts(rawPosts));
    }
  }, [userDirectory, rawPosts]);
 
  // Realtime socket listeners for posts, likes, and comments
  useEffect(() => {
    let offFns = [];
    try {
      const socket = getSocket();
      if (!socket) return;

      // Optionally join group room if backend supports
      if (groupId) {
        try { socket.emit('group:join', { groupId }); } catch {}
      }

      const onPostNew = (payload) => {
        if (!payload) return;
        if (groupId && String(payload.group_id || payload.groupId) !== String(groupId)) return;
        const normalized = normalizePosts([payload])[0];
        setRawPosts(prev => [payload, ...(prev || [])]);
        setPosts(prev => [normalized, ...(prev || [])]);
      };

      const onPostLike = (payload) => {
        if (!payload) return;
        const pid = payload.post_id || payload.postId || payload.id;
        if (!pid) return;
        setPosts(prev => prev.map(p => {
          if (String(p.id) !== String(pid)) return p;
          const newCount = (payload.likes_count !== undefined && payload.likes_count !== null)
            ? payload.likes_count
            : (p.likesCount || 0) + 1;
          return { ...p, likesCount: newCount };
        }));
      };

      const onPostComment = (payload) => {
        if (!payload) return;
        const pid = payload.post_id || payload.postId || (payload.post && (payload.post.id || payload.post.post_id));
        if (!pid) return;
        if (groupId && String(payload.group_id || payload.groupId) !== String(groupId)) {
          // If event carries group identifier, enforce it
          // Otherwise allow since posts belong to current feed
        }
        const comment = payload.comment || payload;
        const commentUserId = comment.user_id || comment.userId || (comment.user && (comment.user.id || comment.user.user_id || comment.user._id));
        const dirUserRaw = (commentUserId !== undefined && commentUserId !== null) ? userDirectory[String(commentUserId)] : undefined;
        const dirUser = dirUserRaw && (dirUserRaw.user ? dirUserRaw.user : dirUserRaw);
        const first = (comment.user && (comment.user.first_name || comment.user.firstName)) || (dirUser && (dirUser.first_name || dirUser.firstName)) || "";
        const last = (comment.user && (comment.user.last_name || comment.user.lastName)) || (dirUser && (dirUser.last_name || dirUser.lastName)) || "";
        const fallbackName = (comment.user && (comment.user.name || [comment.user.first_name, comment.user.last_name].filter(Boolean).join(" "))) || (dirUser && (dirUser.name || [dirUser.first_name, dirUser.last_name].filter(Boolean).join(" "))) || "User";
        const name = (first || last) ? `${first} ${last}`.trim() : fallbackName;
        const avatar = (comment.user && (comment.user.image || comment.user.avatar || comment.user.profile_picture || comment.user.image_url || comment.user.avatar_url)) || (dirUser && (dirUser.image || dirUser.avatar || dirUser.profile_picture || dirUser.image_url || dirUser.avatar_url)) || "";
        const ts = comment.createdAt ? new Date(comment.createdAt).toLocaleString() : (comment.created_at ? new Date(comment.created_at).toLocaleString() : "Just now");

        const newComment = {
          id: comment.id || Date.now(),
          userId: commentUserId || null,
          author: { name, avatar },
          content: comment.content || "",
          timestamp: ts,
        };

        setPosts(prev => prev.map(p => {
          if (String(p.id) !== String(pid)) return p;
          return { ...p, comments: [...p.comments, newComment] };
        }));
      };

      socket.on('post:new', onPostNew);
      socket.on('post:like', onPostLike);
      socket.on('post:comment', onPostComment);

      offFns = [
        () => socket.off('post:new', onPostNew),
        () => socket.off('post:like', onPostLike),
        () => socket.off('post:comment', onPostComment),
      ];

      return () => {
        try { offFns.forEach(fn => fn && fn()); } catch {}
        if (groupId) { try { socket.emit('group:leave', { groupId }); } catch {} }
      };
    } catch {}
  }, [groupId, userDirectory]);

  // Backfill missing user profiles (names/avatars) for post authors and commenters after refresh
  useEffect(() => {
    if (!rawPosts || !rawPosts.length) return;
    const idsToFetch = [];
    const seen = new Set();
    try {
      rawPosts.forEach((p) => {
        const authorId = p?.user?.id || p?.author?.id || p?.user_id || p?.author_id || p?.userId;
        if (authorId !== undefined && authorId !== null) {
          const key = String(authorId);
          // Only fetch if we truly don't have a usable user object
          const cached = userDirectory[key];
          const cachedFlat = cached && (cached.user ? cached.user : cached);
          const hasName = cachedFlat && (cachedFlat.first_name || cachedFlat.firstName || cachedFlat.name);
          const hasAvatar = cachedFlat && (cachedFlat.image || cachedFlat.avatar || cachedFlat.profile_picture || cachedFlat.image_url || cachedFlat.avatar_url);
          if ((!cached || (!hasName && !hasAvatar)) && !seen.has(key)) { idsToFetch.push(key); seen.add(key); }
        }
        const comments = Array.isArray(p?.comments) ? p.comments : [];
        comments.forEach((c) => {
          const uid = c?.user_id || c?.userId || c?.user?.id || c?.user?.user_id;
          if (uid !== undefined && uid !== null) {
            const key = String(uid);
            const cached = userDirectory[key];
            const cachedFlat = cached && (cached.user ? cached.user : cached);
            const hasName = cachedFlat && (cachedFlat.first_name || cachedFlat.firstName || cachedFlat.name);
            const hasAvatar = cachedFlat && (cachedFlat.image || cachedFlat.avatar || cachedFlat.profile_picture || cachedFlat.image_url || cachedFlat.avatar_url);
            if ((!cached || (!hasName && !hasAvatar)) && !seen.has(key)) { idsToFetch.push(key); seen.add(key); }
          }
        });
      });
    } catch {}
    if (!idsToFetch.length) return;
    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.allSettled(idsToFetch.map((id) => fetchDetailedUserProfile(id)));
        const additions = {};
        results.forEach((res, index) => {
          if (res.status === 'fulfilled' && res.value) {
            const u = res.value;
            const key = idsToFetch[index];
            additions[key] = u;
          }
        });
        if (!cancelled && Object.keys(additions).length) {
          setUserDirectory((prev) => {
            const updated = { ...prev, ...additions };
            // Update cache with new user data
            localStorage.setItem('userDirectory', JSON.stringify(updated));
            return updated;
          });
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [rawPosts]);
 
  // Safety net: auto-refresh posts every 2 seconds
  useEffect(() => {
    if (!groupId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await getGroupPosts(groupId);
        if (cancelled) return;
        const list = Array.isArray(res?.data) ? res.data : res;
        setRawPosts(list || []);
        // Only normalize if we have user directory data
        if (Object.keys(userDirectory).length > 0) {
          setPosts(normalizePosts(list || []));
        }
      } catch {}
    };
    const intervalId = setInterval(tick, 2000);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [groupId, userDirectory]);
  
  const handleCommentSubmit = async (postId) => {
    if (!newCommentContents[postId] || !newCommentContents[postId].trim()) return;
    try {
      setCommentSending((prev) => ({ ...prev, [postId]: true }));
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
    } finally {
      setCommentSending((prev) => ({ ...prev, [postId]: false }));
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
                    {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                </div>
                {isGroupAdmin && (
                  <button
                    className="text-gray-500 hover:text-red-600 transition-colors p-1"
                    title="Delete post"
                    onClick={() => setDeleteTargetPostId(post.id)}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                )}
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
                            <video
                              src={url}
                              autoPlay
                              muted
                              playsInline
                              loop
                              controls
                              className="w-full max-h-[420px] rounded-lg bg-black shadow-lg"
                            />
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
                          <AvatarFallback className="text-xs">{(comment.author?.name && comment.author.name[0]) ? comment.author.name[0] : 'U'}</AvatarFallback>
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
                                      await deleteComment(comment.id);
                                    } catch {}
                                    setPosts(prev => prev.map(p => p.id === post.id ? ({...p, comments: p.comments.filter(c => c.id !== comment.id)}) : p));
                                    setInfoModalMessage("Comment deleted successfully");
                                    setInfoModalOpen(true);
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
                                  await editComment(comment.id, { content: commentDraft });
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
                      disabled={commentSending[post.id] || !newCommentContents[post.id] || !newCommentContents[post.id].trim()}
                      className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-sky-700 shadow disabled:opacity-60"
                    >
                      {commentSending[post.id] ? 'Sending...' : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <ConfirmationDialog
        isOpen={Boolean(deleteTargetPostId)}
        onClose={() => { if (!isDeletingPost) setDeleteTargetPostId(null); }}
        onConfirm={async () => {
          if (!deleteTargetPostId) return;
          try {
            setIsDeletingPost(true);
            await deleteGroupPost(deleteTargetPostId);
          } catch (err) {
            if (err?.response?.status === 404) {
              console.warn('Post not found on server, removing locally.');
            } else if (err?.response?.status === 403) {
              console.warn('Forbidden: insufficient permissions to delete this post');
            }
          } finally {
            setIsDeletingPost(false);
            setPosts(prev => prev.filter(p => p.id !== deleteTargetPostId));
            setRawPosts(prev => (prev || []).filter(p => (p.id || p.post_id) !== deleteTargetPostId));
            setDeleteTargetPostId(null);
          }
        }}
        title="Delete post?"
        message="This action cannot be undone. The post and its comments will be permanently removed for all members."
        confirmText={isDeletingPost ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        type="danger"
      />

      <ConfirmationDialog
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        onConfirm={() => setInfoModalOpen(false)}
        title="Success"
        message={infoModalMessage || "Comment deleted successfully"}
        confirmText="OK"
        cancelText="Close"
        type="info"
      />
    </div>
  );
}

export default NewsPage;