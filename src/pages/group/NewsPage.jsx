import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Bell, Send, ThumbsUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useParams } from "react-router-dom";
import { getGroupPosts, addComment, addLike } from "@/services/groupService";
import { useUser } from "@/contexts/UserContext";
import { fetchAllUsers } from "@/services/userService";

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
  // Removed lightbox; images render fully inside the post box

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
    return (list || []).map((p, idx) => {
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
        isAnnouncement: (p.type || "POST") === "ANNOUNCEMENT",
        comments: Array.isArray(p.comments) ? p.comments.map((c, i) => {
          const authorMeta = resolveUser(c.user || c.author, c.user_id || c.userId);
          return {
            id: c.id || i,
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
          <Card key={post.id} className={`overflow-hidden border ${post.isAnnouncement ? "border-blue-300" : "border-indigo-200"} bg-white/90 backdrop-blur-sm hover:shadow-md transition-all duration-200 rounded-xl`}>
            <div className={`h-1 w-full ${post.isAnnouncement ? "bg-gradient-to-r from-sky-400 to-blue-600" : "bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-300"}`} />
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
                
                {post.isAnnouncement && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-gradient-to-r from-sky-50 to-blue-50 text-blue-700 border-blue-200">
                    <Bell className="h-3 w-3" />
                    Announcement
                  </Badge>
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
                  <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 p-3 border-b border-indigo-100">
                    <span className="text-xs font-medium text-gray-600">Attachment</span>
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
                          <img
                            src={url}
                            alt="post attachment"
                            className="w-full rounded-lg object-contain"
                            loading="lazy"
                          />
                        );
                      }
                      if (isVideo) {
                        return (
                          <video
                            src={url}
                            controls
                            className="w-full max-h-[420px] rounded-lg bg-black"
                          />
                        );
                      }
                      if (isPdf) {
                        return (
                          <iframe
                            src={`${url}#view=FitH`}
                            title="PDF document"
                            className="w-full h-[520px] rounded-lg bg-white"
                          />
                        );
                      }
                      // Fallback: embed inline with iframe (no download button)
                      return (
                        <iframe
                          src={url}
                          title="Attachment"
                          className="w-full h-[520px] rounded-lg bg-white"
                        />
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
                      <div key={comment.id} className={`flex gap-2 ${highlightComment[comment.id] ? 'animate-[pulse_1.2s_ease_1]' : ''}`}>
                        <Avatar className="h-6 w-6 ring-2 ring-indigo-200 ring-offset-2">
                          <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
                          {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                        </Avatar>
                        <div className={`bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 text-sm flex-1 shadow-sm ${highlightComment[comment.id] ? 'ring-2 ring-blue-200' : ''}`}>
                          <div className="font-medium text-gray-900">{comment.author.name}</div>
                          <p className="text-gray-800">{comment.content}</p>
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