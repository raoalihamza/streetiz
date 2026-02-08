import { useState, useEffect } from 'react';
import { Music, Save, ExternalLink, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileMusicPlaylistProps {
  userId: string;
  isOwnProfile: boolean;
}

export default function ProfileMusicPlaylist({ userId, isOwnProfile }: ProfileMusicPlaylistProps) {
  const [musicUrl, setMusicUrl] = useState('');
  const [musicType, setMusicType] = useState('Playlist');
  const [savedMusicUrl, setSavedMusicUrl] = useState('');
  const [savedMusicType, setSavedMusicType] = useState('Playlist');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMusicData();
  }, [userId]);

  const loadMusicData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('music_url, music_type')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data?.music_url) {
        setSavedMusicUrl(data.music_url);
        setMusicUrl(data.music_url);
      }
      if (data?.music_type) {
        setSavedMusicType(data.music_type);
        setMusicType(data.music_type);
      }
    } catch (error) {
      console.error('Error loading music data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          music_url: musicUrl || null,
          music_type: musicType
        })
        .eq('id', userId);

      if (error) throw error;

      setSavedMusicUrl(musicUrl);
      setSavedMusicType(musicType);
      setIsEditing(false);
      alert('Music link saved!');
    } catch (error) {
      console.error('Error saving music:', error);
      alert('Failed to save music link');
    }
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    if (url.includes('spotify.com')) {
      const match = url.match(/spotify\.com\/(track|playlist|album)\/([a-zA-Z0-9]+)/);
      if (match) {
        return `https://open.spotify.com/embed/${match[1]}/${match[2]}`;
      }
    }

    if (url.includes('deezer.com')) {
      const match = url.match(/deezer\.com\/(track|playlist|album)\/(\d+)/);
      if (match) {
        return `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`;
      }
    }

    if (url.includes('soundcloud.com')) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`;
    }

    return null;
  };

  const getProviderName = (url: string): string => {
    if (url.includes('spotify.com')) return 'Spotify';
    if (url.includes('deezer.com')) return 'Deezer';
    if (url.includes('soundcloud.com')) return 'SoundCloud';
    return 'Music';
  };

  const embedUrl = getEmbedUrl(savedMusicUrl);
  const providerName = savedMusicUrl ? getProviderName(savedMusicUrl) : '';

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Music / Playlist</h3>
        <div className="h-32 bg-zinc-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Music / Playlist du moment</h3>
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isOwnProfile && isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Lien Spotify / Deezer / SoundCloud
            </label>
            <input
              type="url"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder="Colle ici une URL (playlist ou track)..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Type
            </label>
            <select
              value={musicType}
              onChange={(e) => setMusicType(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="Track">Track</option>
              <option value="Playlist">Playlist</option>
              <option value="Album">Album</option>
              <option value="Mix">Mix</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Save size={16} />
              Enregistrer
            </button>
            <button
              onClick={() => {
                setMusicUrl(savedMusicUrl);
                setMusicType(savedMusicType);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : savedMusicUrl && embedUrl ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Music size={16} />
            <span>{savedMusicType} from {providerName}</span>
          </div>

          {embedUrl.includes('soundcloud') ? (
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={embedUrl}
              className="rounded-lg"
            />
          ) : embedUrl.includes('deezer') ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="300"
              frameBorder="0"
              allowTransparency
              allow="encrypted-media; clipboard-write"
              className="rounded-lg"
            />
          ) : (
            <iframe
              src={embedUrl}
              width="100%"
              height="352"
              frameBorder="0"
              allowTransparency
              allow="encrypted-media"
              className="rounded-lg"
            />
          )}
        </div>
      ) : savedMusicUrl && !embedUrl ? (
        <div className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music size={24} className="text-zinc-400" />
            <div>
              <p className="text-white font-medium">{savedMusicType}</p>
              <p className="text-sm text-zinc-400">{providerName}</p>
            </div>
          </div>
          <a
            href={savedMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg text-sm transition-colors"
          >
            <ExternalLink size={16} />
            Open
          </a>
        </div>
      ) : (
        <div className="bg-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-center">
          <Music size={48} className="text-zinc-600 mb-3" />
          <p className="text-zinc-400">
            {isOwnProfile
              ? 'Add a music link to share your current playlist'
              : 'No music shared yet'
            }
          </p>
        </div>
      )}
    </div>
  );
}
