import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Image as ImageIcon, 
  X, 
  Heart, 
  MessageCircle, 
  MoreVertical,
  Pin
} from "lucide-react";
import { getGroupPosts } from "@/services/groupService";
import { fetchAllUsers, isInstructorOrAdmin } from "@/services/userService";
import { toast } from "sonner";

const formatDate = (iso) => {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  } catch {
    return iso;
  }
};

export default function GroupInfo({ group, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const adminView = isInstructorOrAdmin();

  useEffect(() => {
    const fetch = async () => {
      if (!group?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await getGroupPosts(group.id);
        if (res?.success && Array.isArray(res.data)) {
          const sorted = [...res.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setPosts(sorted);
        } else if (Array.isArray(res?.data)) {
          setPosts(res.data);
        } else {
          throw new Error(res?.message || "Failed to load posts");
        }
      } catch (e) {
        setError(e?.message || "Failed to load posts");
        toast.error(e?.response?.data?.message || e?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [group?.id]);

  // Load all users (for resolving comment author names)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        const users = await fetchAllUsers();
        setAllUsers(Array.isArray(users) ? users : []);
      } catch (e) {
        // Non-blocking; comments will still render with fallback
      } finally {
        setLoadingUsers(false);
      }
    };
    loadUsers();
  }, []);

  const userIdToUser = React.useMemo(() => {
    const map = new Map();
    allUsers.forEach((u) => {
      if (u?.id) map.set(u.id, u);
    });
    return map;
  }, [allUsers]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{group?.name || "Group"}</h3>
              {group?.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">{group.description}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Group meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{group?.memberCount ?? (group?.members?.length || 0)}</p>
              <p className="text-xs text-gray-500">Members</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mb-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">{posts.length}</p>
              <p className="text-xs text-gray-500">Posts</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 rounded-full mb-2">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Created</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2">
                <Pin className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {posts.filter(post => post.is_pinned).length}
              </p>
              <p className="text-xs text-gray-500">Pinned</p>
            </div>
          </div>

          {/* Posts section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Group Posts</h4>
              <span className="text-sm text-gray-500">{posts.length} posts</span>
            </div>

            {loading ? (
              <Card className="border-gray-200 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-600 text-sm">Loading posts...</p>
                </CardContent>
              </Card>
            ) : error ? (
              <Card className="border-red-200 bg-red-50 overflow-hidden">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 text-sm mb-3">{error}</p>
                  <Button 
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      getGroupPosts(group.id)
                        .then((res) => {
                          const list = res?.data || [];
                          setPosts(Array.isArray(list) ? list : []);
                        })
                        .catch((e) => setError(e?.message || 'Failed to load posts'))
                        .finally(() => setLoading(false));
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-300 bg-gray-50 overflow-hidden">
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm">No posts yet in this group.</p>
                  <p className="text-xs text-gray-500 mt-1">Be the first to share something!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => {
                  const mediaUrl = post?.media_url || post?.mediaUrl || post?.media || post?.image_url || post?.imageUrl;
                  return (
                    <Card key={post.id} className="border-gray-200 overflow-hidden transition-all hover:shadow-md">
                      <CardContent className="p-0">
                        <div className="p-4 pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                    {post?.user?.first_name?.[0]}{post?.user?.last_name?.[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {post?.user?.first_name} {post?.user?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {post.is_pinned && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                      <Pin className="h-3 w-3" /> Pinned
                                    </span>
                                  )}
                                  <button className="p-1 hover:bg-gray-100 rounded">
                                    <MoreVertical className="h-4 w-4 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                              
                              {post.title && (
                                <h5 className="mt-3 font-semibold text-gray-900 text-lg">{post.title}</h5>
                              )}
                              
                              {post.content && (
                                <p className="mt-2 text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {mediaUrl && (
                          <div className="px-4 pb-3">
                            <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center w-full overflow-hidden">
                              {(() => {
                                const url = String(mediaUrl);
                                const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);
                                const isVideo = /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
                                const isPdf = /\.(pdf)$/i.test(url);
                                if (isImage) {
                                  return (
                                    <a href={url} target="_blank" rel="noreferrer" className="block">
                                      <img
                                        src={url}
                                        alt={post.title || "attachment"}
                                        loading="lazy"
                                        className="max-w-full max-h-[70vh] w-auto h-auto object-contain block mx-auto hover:opacity-95 transition-opacity"
                                      />
                                    </a>
                                  );
                                }
                                if (isVideo) {
                                  return (
                                    <video
                                      src={url}
                                      controls
                                      className="w-full max-h-96"
                                    />
                                  );
                                }
                                if (isPdf) {
                                  return (
                                    <iframe
                                      src={url}
                                      title={post.title || "PDF attachment"}
                                      className="w-full h-96 bg-white"
                                    />
                                  );
                                }
                                return (
                                  <iframe
                                    src={url}
                                    title={post.title || "attachment"}
                                    className="w-full h-96 bg-white"
                                  />
                                );
                              })()}
                            </div>
                            <div className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                              <ImageIcon className="h-3.5 w-3.5" /> Inline preview
                            </div>
                          </div>
                        )}
                        
                        {/* Engagement metrics */}
                        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <Heart className="h-4 w-4" />
                              <span>{(post.likes_count != null ? post.likes_count : (Array.isArray(post.likes) ? post.likes.length : 0))}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              <span>{(post.comments_count != null ? post.comments_count : (Array.isArray(post.comments) ? post.comments.length : 0))}</span>
                            </button>
                          </div>
                          
                          <div className="text-xs text-gray-400">
                            {post.edited && "Edited • "}{formatDate(post.createdAt)}
                          </div>
                        </div>

                        {/* Admin-only: who liked */}
                        {adminView && Array.isArray(post.likes) && post.likes.length > 0 && (
                          <div className="px-4 py-3 border-t border-gray-100">
                            <details className="group">
                              <summary className="text-sm font-medium text-gray-900 cursor-pointer select-none">View likes ({post.likes.length})</summary>
                              <div className="mt-2 space-y-2">
                                {post.likes.map((like) => {
                                  const liker = userIdToUser.get(like.user_id) || {};
                                  const name = [liker.first_name, liker.last_name].filter(Boolean).join(' ') || liker.name || liker.email || `User ${like.user_id?.slice(0,6) || ''}`;
                                  const email = liker.email;
                                  const letter = (liker.first_name?.[0] || liker.name?.[0] || liker.email?.[0] || 'U').toUpperCase();
                                  return (
                                    <div key={like.id} className="flex items-center gap-3">
                                      <div className="w-7 h-7 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center text-[11px] font-medium">
                                        {letter}
                                      </div>
                                      <div className="flex items-center gap-2 text-sm text-gray-800">
                                        <span className="font-medium">{name}</span>
                                        {email && <span className="text-xs text-gray-500">• {email}</span>}
                                      </div>
                                      <div className="ml-auto text-[11px] text-gray-400">{formatDate(like.createdAt)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </div>
                        )}

                        {/* Comments */}
                        {Array.isArray(post.comments) && post.comments.length > 0 && (
                          <div className="px-4 py-3 border-t border-gray-100">
                            <h6 className="text-sm font-medium text-gray-900">Comments</h6>
                            <div className="mt-2 space-y-3">
                              {post.comments.map((comment) => {
                                const fromDirectory = userIdToUser.get(comment.user_id);
                                const commenter = comment.user || fromDirectory || {};
                                const displayName = [commenter.first_name, commenter.last_name].filter(Boolean).join(' ') || commenter.name || commenter.email || `User ${comment.user_id?.slice(0, 6) || ''}`;
                                const avatarLetter = (commenter.first_name?.[0] || commenter.name?.[0] || commenter.email?.[0] || 'U').toUpperCase();
                                return (
                                  <div key={comment.id} className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                                      {avatarLetter}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-2">
                                          <span>{displayName}</span>
                                          {adminView && commenter.email && (
                                            <span className="text-xs text-gray-500">• {commenter.email}</span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-400 ml-3 flex-shrink-0">
                                          {formatDate(comment.createdAt)}
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                        {comment.content}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}