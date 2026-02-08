import { useState } from 'react';
import { X, Image, Video, Music, FileText, Calendar, Package, GraduationCap, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreateContentModalProps {
  initialType?: 'post' | 'forum' | 'announcement' | 'marketplace' | 'workshop';
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateContentModal({ initialType = 'post', onClose, onSuccess }: CreateContentModalProps) {
  const { user } = useAuth();
  const [contentType, setContentType] = useState(initialType);
  const [postType, setPostType] = useState<'text' | 'photo' | 'video' | 'audio'>('text');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electro');
  const [tags, setTags] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [audioTitle, setAudioTitle] = useState('');
  const [audioArtist, setAudioArtist] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Electro', 'House', 'Techno', 'Afro House', 'Drum & Bass', 'Trance'];

  const handleSubmit = async () => {
    if (!user) {
      alert('Vous devez être connecté pour publier du contenu');
      return;
    }
    if (!content && !title) return;

    setLoading(true);
    try {
      if (contentType === 'post') {
        const postData: any = {
          user_id: user.id,
          post_type: postType,
          content,
          category,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        if (postType === 'video' && youtubeUrl) {
          postData.youtube_url = youtubeUrl;
        } else if (postType === 'audio' && audioTitle) {
          postData.audio_title = audioTitle;
          postData.audio_artist = audioArtist || 'Unknown Artist';
          postData.audio_url = mediaUrl || 'https://example.com/audio.mp3';
          postData.audio_cover_url = 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg';
        } else if (postType === 'photo' && mediaUrl) {
          postData.media_urls = [mediaUrl];
        }

        const { error } = await supabase.from('posts').insert(postData);
        if (error) throw error;

        await supabase.rpc('update_profile_stats', { target_user_id: user.id });
      } else if (contentType === 'forum') {
        const { error } = await supabase.from('forum_topics').insert({
          user_id: user.id,
          category: category,
          title,
          content,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        });
        if (error) throw error;

        await supabase.rpc('update_profile_stats', { target_user_id: user.id });
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating content:', error);
      alert('Failed to create content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] rounded-3xl border border-[#222] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#222] flex items-center justify-between sticky top-0 bg-[#111] z-10">
          <h2 className="text-2xl font-black text-white">Create Content</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-[#1a1a1a] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-[#666]" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setContentType('post')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                contentType === 'post'
                  ? 'bg-streetiz-red text-white'
                  : 'bg-[#1a1a1a] text-[#888] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Post
            </button>
            <button
              onClick={() => setContentType('forum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold whitespace-nowrap transition-colors ${
                contentType === 'forum'
                  ? 'bg-streetiz-red text-white'
                  : 'bg-[#1a1a1a] text-[#888] hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              Forum Topic
            </button>
          </div>

          {contentType === 'post' && (
            <div className="mb-4">
              <label className="text-[#888] text-sm font-semibold mb-2 block">Post Type</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPostType('text')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    postType === 'text'
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Text
                </button>
                <button
                  onClick={() => setPostType('photo')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    postType === 'photo'
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Photo
                </button>
                <button
                  onClick={() => setPostType('video')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    postType === 'video'
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
                <button
                  onClick={() => setPostType('audio')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    postType === 'audio'
                      ? 'bg-streetiz-red text-white'
                      : 'bg-[#1a1a1a] text-[#888] hover:text-white'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Audio
                </button>
              </div>
            </div>
          )}

          {contentType === 'forum' && (
            <div className="mb-4">
              <label className="text-[#888] text-sm font-semibold mb-2 block">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Topic title..."
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="text-[#888] text-sm font-semibold mb-2 block">
              {contentType === 'forum' ? 'Description' : 'Content'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red resize-none"
            />
          </div>

          {postType === 'photo' && contentType === 'post' && (
            <div className="mb-4">
              <label className="text-[#888] text-sm font-semibold mb-2 block">Photo URL</label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              />
            </div>
          )}

          {postType === 'video' && contentType === 'post' && (
            <div className="mb-4">
              <label className="text-[#888] text-sm font-semibold mb-2 block">YouTube URL</label>
              <input
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
              />
            </div>
          )}

          {postType === 'audio' && contentType === 'post' && (
            <>
              <div className="mb-4">
                <label className="text-[#888] text-sm font-semibold mb-2 block">Track Title</label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="Track title"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>
              <div className="mb-4">
                <label className="text-[#888] text-sm font-semibold mb-2 block">Artist Name</label>
                <input
                  type="text"
                  value={audioArtist}
                  onChange={(e) => setAudioArtist(e.target.value)}
                  placeholder="Artist name"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="text-[#888] text-sm font-semibold mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-streetiz-red"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="text-[#888] text-sm font-semibold mb-2 block">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="electro, dance, festival"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || (!content && !title)}
            className="w-full bg-streetiz-red hover:bg-red-600 disabled:bg-[#333] disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
