'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Send, ImagePlus, Hash, Smile, TrendingUp, Flame,
  Filter, Sparkles, X,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useStore } from '@/stores/useStore';
import { formatDistanceToNow } from 'date-fns';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const trendingTags = ['#Hackathon2026', '#DSA', '#Finals', '#TechFest', '#Placement', '#Projects'];

export default function FeedPage() {
  const { user, posts, addPost, toggleLike } = useStore();
  const [newPost, setNewPost] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const handlePost = () => {
    if (!newPost.trim()) return;
    const tags = newPost.match(/#\w+/g) || [];
    addPost(newPost, tags.map((t) => t.replace('#', '')));
    setNewPost('');
    setShowComposer(false);
  };

  const toggleBookmark = (postId: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
  };

  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags.some((t) => t.toLowerCase() === selectedTag.toLowerCase().replace('#', '')))
    : posts;

  return (
    <AppLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              Community Feed
            </h1>
            <p className="text-sm text-gray-500 mt-1">Stay connected with your campus</p>
          </div>
          <Button variant="primary" icon={<Send className="w-4 h-4" />} onClick={() => setShowComposer(!showComposer)}>
            New Post
          </Button>
        </motion.div>

        {/* Trending tags */}
        <motion.div variants={item}>
          <Card padding="sm">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 flex-shrink-0">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Trending</span>
              </div>
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0
                    ${selectedTag === tag
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08]'
                    }
                  `}
                >
                  {tag}
                </button>
              ))}
              {selectedTag && (
                <button
                  onClick={() => setSelectedTag(null)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Post Composer */}
        <AnimatePresence>
          {showComposer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card glow>
                <div className="flex gap-3">
                  <Avatar name={user?.displayName || 'User'} size="md" />
                  <div className="flex-1">
                    <textarea
                      autoFocus
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's on your mind? Share something with your campus..."
                      className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none outline-none min-h-[100px]"
                    />
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400 transition-colors">
                          <ImagePlus className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400 transition-colors">
                          <Hash className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-indigo-400 transition-colors">
                          <Smile className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowComposer(false)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          icon={<Send className="w-3.5 h-3.5" />}
                          onClick={handlePost}
                          disabled={!newPost.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post, i) => {
            const isLiked = post.likes.includes(user?.uid || '');
            const isSaved = bookmarked.has(post.id);

            return (
              <motion.div
                key={post.id}
                variants={item}
                layout
              >
                <Card hover>
                  {/* Post Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={post.authorName} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{post.authorName}</span>
                          {post.authorId === 'demo-user-5' && (
                            <Badge variant="info" size="sm">Professor</Badge>
                          )}
                          {post.authorId === 'demo-user-4' && (
                            <Badge variant="purple" size="sm">Moderator</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap mb-3">
                    {post.content}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(`#${tag}`)}
                          className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[11px] font-medium hover:bg-indigo-500/20 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Engagement stats */}
                  <div className="flex items-center gap-4 py-2 border-t border-white/[0.06] text-xs text-gray-500">
                    <span>{post.likes.length} likes</span>
                    <span>{post.commentCount} comments</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(post.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                        isLiked
                          ? 'text-pink-400 bg-pink-500/[0.06]'
                          : 'text-gray-500 hover:text-pink-400 hover:bg-pink-500/[0.04]'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span className="text-xs font-medium">Like</span>
                    </motion.button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/[0.04] transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-medium">Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-emerald-500/[0.04] transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs font-medium">Share</span>
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleBookmark(post.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-amber-400 bg-amber-500/[0.06]'
                          : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/[0.04]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Load more */}
        <motion.div variants={item} className="flex justify-center py-4">
          <Button variant="secondary" icon={<TrendingUp className="w-4 h-4" />}>
            Load more posts
          </Button>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
