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

export function NewsPage() {
  const { groupId } = useParams();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCommentContents, setNewCommentContents] = useState({});
  const [showCommentFields, setShowCommentFields] = useState({});
  const [likeBurst, setLikeBurst] = useState({});
  const [highlightComment, setHighlightComment] = useState({});

  useEffect(() => {
    let isMounted = true;
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const res = await getGroupPosts(groupId);
        const list = Array.isArray(res?.data) ? res.data : res;
        const normalized = (list || []).map((p, idx) => {
          const author = p.user || p.author || {};
          const first = author.first_name || author.firstName || "";
          const last = author.last_name || author.lastName || "";
          const name = (first || last) ? `${first} ${last}`.trim() : author.name || "Member";
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
            likes: Array.isArray(p.likes) ? p.likes.length : (p.likes_count || 0),
            isAnnouncement: (p.type || "POST") === "ANNOUNCEMENT",
            comments: Array.isArray(p.comments) ? p.comments.map((c, i) => ({
              id: c.id || i,
              author: { name: `${(c.user?.first_name||"")} ${(c.user?.last_name||"")}`.trim() || "User", avatar: c.user?.image || "" },
              content: c.content || "",
              timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString() : ""
            })) : [],
            mediaUrl: p.media_url || "",
            pinned: Boolean(p.is_pinned),
          };
        });
        if (isMounted) {
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
  
  const handleCommentSubmit = async (postId) => {
    if (!newCommentContents[postId] || !newCommentContents[postId].trim()) return;
    try {
      await addComment(postId, { content: newCommentContents[postId] });
      const createdCommentId = Date.now();
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: createdCommentId,
                author: {
                  name: "You",
                  avatar: ""
                },
                content: newCommentContents[postId],
                timestamp: "Just now"
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
      await addLike(postId);
      setPosts(posts.map(post => post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post));
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Group News</h1>
          <p className="text-sm text-gray-500">Latest updates and discussions from this group</p>
        </div>
        <span className="text-xs text-gray-400">{posts.length} post{posts.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post.id} className={`overflow-hidden border ${post.isAnnouncement ? "border-blue-300" : "border-gray-200"} hover:shadow-sm transition-shadow`}>
            <div className={`h-1 w-full ${post.isAnnouncement ? "bg-blue-500" : "bg-gray-200"}`} />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    {post.author.avatar && <AvatarImage src={post.author.avatar} />}
                  </Avatar>
                  <div>
                    <div className="font-semibold">{post.author.name}</div>
                    <div className="text-sm text-muted-foreground">{post.timestamp}</div>
                  </div>
                </div>
                
                {post.isAnnouncement && (
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
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
                <div className="rounded-xl border border-gray-200 bg-white mt-3 overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">Attachment</span>
                  </div>
                  <div className="p-3">
                    {/* Render image when media url present - per backend response */}
                    <img
                      src={post.mediaUrl}
                      alt="post attachment"
                      className="w-full max-h-[420px] object-contain rounded-lg bg-gray-50"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col items-stretch">
              <div className="flex justify-between items-center w-full mb-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-1 text-gray-600 hover:text-blue-700 hover:bg-blue-50 ${likeBurst[post.id] ? 'scale-105 text-blue-700' : ''}`}
                  style={{ transition: 'transform 150ms ease, color 150ms ease' }}
                  onClick={() => handleLike(post.id)}
                >
                  <ThumbsUp className={`h-4 w-4 ${likeBurst[post.id] ? 'animate-pulse' : ''}`} />
                  {post.likes > 0 && <span className={`${likeBurst[post.id] ? 'animate-pulse' : ''}`}>{post.likes}</span>}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-1 text-gray-600 hover:text-blue-700 hover:bg-blue-50"
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
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">{comment.author.name[0]}</AvatarFallback>
                          {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
                        </Avatar>
                        <div className={`bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 ${highlightComment[comment.id] ? 'ring-2 ring-blue-200' : ''}`}>
                          <div className="font-medium">{comment.author.name}</div>
                          <p>{comment.content}</p>
                          <div className="text-xs text-gray-500 mt-1">{comment.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {showCommentFields[post.id] && (
                <div className="flex gap-2 mt-3 w-full">
                  <Avatar className="h-6 w-6">
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
                      className="text-sm min-h-[60px] flex-1 border-gray-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleCommentSubmit(post.id)}
                      disabled={!newCommentContents[post.id] || !newCommentContents[post.id].trim()}
                      className="bg-blue-600 text-white hover:bg-blue-700"
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