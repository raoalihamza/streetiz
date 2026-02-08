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
      <div className="bg-[#111] rounded-2xl border border-[#222] p-6">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-streetiz-red" />
          Music / Playlist
        </h3>
        <div className="h-32 bg-[#0a0a0a] rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#111] rounded-2xl border border-[#222] p-6 shadow-lg shadow-black/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Music className="w-5 h-5 text-streetiz-red" />
          Music / Playlist du moment
        </h3>
        {isOwnProfile && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-streetiz-red/30"
          >
            Modifier
          </button>
        )}
      </div>

      {isOwnProfile && isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-[#888] mb-2">
              Lien Spotify / Deezer / SoundCloud
            </label>
            <input
              type="url"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              placeholder="Colle ici une URL (playlist, track, album ou mix)..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
            />
            <p className="text-xs text-[#666] mt-2">
              Exemple: https://open.spotify.com/playlist/... ou https://www.deezer.com/playlist/...
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#888] mb-2">
              Type
            </label>
            <select
              value={musicType}
              onChange={(e) => setMusicType(e.target.value)}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#222] rounded-xl text-white focus:outline-none focus:border-streetiz-red transition-colors"
            >
              <option value="Track">Track</option>
              <option value="Playlist">Playlist</option>
              <option value="Album">Album</option>
              <option value="Mix">Mix</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-xl font-bold transition-all shadow-lg shadow-streetiz-red/30"
            >
              <Save size={18} />
              Enregistrer
            </button>
            <button
              onClick={() => {
                setMusicUrl(savedMusicUrl);
                setMusicType(savedMusicType);
                setIsEditing(false);
              }}
              className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl font-bold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      ) : savedMusicUrl && embedUrl ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <div className="px-3 py-1 bg-streetiz-red/20 text-streetiz-red rounded-full flex items-center gap-2">
              <Music size={14} />
              <span>{savedMusicType}</span>
            </div>
            <span className="text-[#666]">•</span>
            <span className="text-white">{providerName}</span>
          </div>

          {embedUrl.includes('soundcloud') ? (
            <iframe
              width="100%"
              height="166"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={embedUrl}
              className="rounded-xl border border-[#222]"
            />
          ) : embedUrl.includes('deezer') ? (
            <iframe
              src={embedUrl}
              width="100%"
              height="300"
              frameBorder="0"
              allowTransparency
              allow="encrypted-media; clipboard-write"
              className="rounded-xl border border-[#222]"
            />
          ) : (
            <iframe
              src={embedUrl}
              width="100%"
              height="352"
              frameBorder="0"
              allowTransparency
              allow="encrypted-media"
              className="rounded-xl border border-[#222]"
            />
          )}

          {savedMusicUrl && (
            <a
              href={savedMusicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#222] hover:bg-[#333] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <ExternalLink size={16} />
              Ouvrir dans {providerName}
            </a>
          )}
        </div>
      ) : savedMusicUrl && !embedUrl ? (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222] p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-streetiz-red/20 to-red-600/20 rounded-xl flex items-center justify-center">
              <Music size={28} className="text-streetiz-red" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">{savedMusicType}</p>
              <p className="text-[#666] text-sm">{providerName}</p>
            </div>
          </div>
          <a
            href={savedMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-streetiz-red/30"
          >
            <ExternalLink size={16} />
            Écouter
          </a>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-xl border border-[#222] p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-streetiz-red/10 to-red-600/10 rounded-2xl flex items-center justify-center mb-4">
            <Music size={48} className="text-[#333]" />
          </div>
          <p className="text-white font-black text-lg mb-2">
            {isOwnProfile ? 'Aucune playlist ajoutée' : 'Aucune musique partagée'}
          </p>
          <p className="text-[#666] text-sm">
            {isOwnProfile
              ? 'Ajoute un lien Spotify, Deezer ou SoundCloud pour partager ta musique du moment'
              : 'Ce membre n\'a pas encore partagé sa musique'}
          </p>
        </div>
      )}
    </div>
  );
}
