import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, Image as ImageIcon, X } from "lucide-react";
import { getGroupPosts } from "@/services/groupService";
import { toast } from "sonner";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

export default function GroupInfo({ group, onClose }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{group?.name || "Group"}</h3>
            {group?.description && (
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Group meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {group?.memberCount ?? (group?.members?.length || 0)} members</span>
            {group?.createdAt && (
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> Created: {group.createdAt}</span>
            )}
          </div>

          {/* Posts */}
          <h4 className="text-lg font-semibold text-gray-800">Posts</h4>

          {loading ? (
            <Card className="border-gray-200">
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-600 text-sm">Loading posts...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 text-sm mb-3">{error}</p>
                <Button onClick={() => {
                  setLoading(true);
                  setError(null);
                  getGroupPosts(group.id).then((res) => {
                    const list = res?.data || [];
                    setPosts(Array.isArray(list) ? list : []);
                  }).catch((e) => setError(e?.message || 'Failed to load posts')).finally(() => setLoading(false));
                }} variant="outline" size="sm">Retry</Button>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No posts yet in this group.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => {
                const mediaUrl = post?.media_url || post?.mediaUrl || post?.media || post?.image_url || post?.imageUrl;
                return (
                <Card key={post.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium text-gray-800">
                              {post?.user?.first_name} {post?.user?.last_name}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          {post.is_pinned && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Pinned</span>
                          )}
                        </div>
                        {post.title && (
                          <h5 className="mt-1 font-semibold text-gray-800">{post.title}</h5>
                        )}
                        {post.content && (
                          <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                        )}
                        {mediaUrl && (
                          <div className="mt-3">
                            <a href={mediaUrl} target="_blank" rel="noreferrer">
                              <img
                                src={mediaUrl}
                                alt={post.title || "attachment"}
                                loading="lazy"
                                className="w-full max-h-96 rounded-lg object-cover border border-gray-200"
                              />
                            </a>
                            <div className="mt-1 text-xs text-gray-500 inline-flex items-center gap-1">
                              <ImageIcon className="h-3.5 w-3.5" /> Click image to open
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


