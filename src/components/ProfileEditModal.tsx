import { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, Trash2, Plus, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileEditModalProps {
  onClose: () => void;
  onSave: () => void;
}

interface ProfileData {
  username: string;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  nationality: string | null;
  team_collective: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  roles: string[];
  styles: string[];
  social_links: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    soundcloud?: string;
    spotify?: string;
    other?: string;
  };
}

interface MediaItem {
  id?: string;
  media_type: 'photo' | 'video';
  media_url?: string;
  external_url?: string;
  external_platform?: string;
  title?: string;
  description?: string;
  display_order: number;
  isNew?: boolean;
}

const availableRoles = [
  'Dancer', 'DJ', 'Clubber', 'Clubbeuse', 'Organizer',
  'Workshop Host', 'Photographer', 'Videographer', 'Creator'
];

const availableStyles = [
  'Techno', 'House', 'Afro House', 'Melodic Techno', 'Electro',
  'Hardstyle', 'Hip Hop', 'Electro Dance', 'Popping', 'House Dance',
  'Underground', 'Rave', 'Festival', 'Chic'
];

export default function ProfileEditModal({ onClose, onSave }: ProfileEditModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    display_name: '',
    bio: '',
    city: '',
    country: '',
    nationality: '',
    team_collective: '',
    avatar_url: '',
    banner_url: '',
    roles: [],
    styles: [],
    social_links: {}
  });
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  const [videos, setVideos] = useState<MediaItem[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoPlatform, setNewVideoPlatform] = useState<'youtube' | 'tiktok'>('youtube');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMedia();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfileData({
          username: data.username || '',
          display_name: data.display_name || '',
          bio: data.bio || '',
          city: data.city || '',
          country: data.country || '',
          nationality: data.nationality || '',
          team_collective: data.team_collective || '',
          avatar_url: data.avatar_url || '',
          banner_url: data.banner_url || '',
          roles: Array.isArray(data.roles) ? data.roles : [],
          styles: Array.isArray(data.styles) ? data.styles : [],
          social_links: data.social_links || {}
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profile_media')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order');

      if (error) throw error;
      if (data) {
        setPhotos(data.filter(m => m.media_type === 'photo').map((m, i) => ({ ...m, display_order: i })));
        setVideos(data.filter(m => m.media_type === 'video').map((m, i) => ({ ...m, display_order: i })));
      }
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo trop grande. Max 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProfileData(prev => ({ ...prev, avatar_url: dataUrl }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Photo trop grande. Max 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setProfileData(prev => ({ ...prev, banner_url: dataUrl }));
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || photos.length >= 9) return;

    setUploadingPhoto(true);
    try {
      for (let i = 0; i < Math.min(files.length, 9 - photos.length); i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert(`Photo "${file.name}" est trop grande. Max 5MB.`);
          continue;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          setPhotos(prev => [...prev, {
            media_type: 'photo',
            media_url: dataUrl,
            display_order: prev.length,
            isNew: true
          }]);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Erreur lors du chargement de la photo');
    } finally {
      setUploadingPhoto(false);
      event.target.value = '';
    }
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim() || photos.length >= 9) return;
    setPhotos([...photos, {
      media_type: 'photo',
      media_url: newPhotoUrl.trim(),
      display_order: photos.length,
      isNew: true
    }]);
    setNewPhotoUrl('');
  };

  const handleAddVideo = () => {
    if (!newVideoUrl.trim() || videos.length >= 3) return;
    setVideos([...videos, {
      media_type: 'video',
      external_url: newVideoUrl.trim(),
      external_platform: newVideoPlatform,
      display_order: videos.length,
      isNew: true
    }]);
    setNewVideoUrl('');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const toggleRole = (role: string) => {
    setProfileData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const toggleStyle = (style: string) => {
    setProfileData(prev => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter(s => s !== style)
        : [...prev.styles, style]
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          display_name: profileData.display_name,
          bio: profileData.bio,
          city: profileData.city,
          country: profileData.country,
          nationality: profileData.nationality,
          team_collective: profileData.team_collective,
          avatar_url: profileData.avatar_url,
          banner_url: profileData.banner_url,
          roles: profileData.roles,
          styles: profileData.styles,
          social_links: profileData.social_links,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: deleteError } = await supabase
        .from('profile_media')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      const allMedia = [
        ...photos.map((p, i) => ({
          user_id: user.id,
          media_type: 'photo' as const,
          media_url: p.media_url,
          display_order: i
        })),
        ...videos.map((v, i) => ({
          user_id: user.id,
          media_type: 'video' as const,
          external_url: v.external_url,
          external_platform: v.external_platform,
          display_order: i
        }))
      ];

      if (allMedia.length > 0) {
        const { error: mediaError } = await supabase
          .from('profile_media')
          .insert(allMedia);

        if (mediaError) throw mediaError;
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-streetiz-red/20 border-t-streetiz-red rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-full max-w-4xl bg-[#0a0a0a] rounded-3xl border border-[#222] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#222]">
            <h2 className="text-2xl font-black text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#111] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <h3 className="text-white font-black text-lg">Basic Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">Photo de Profil</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-[#111] border-2 border-[#222] flex-shrink-0">
                      {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#666]">
                          <Upload className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="block w-full px-4 py-2 bg-[#222] hover:bg-[#333] text-white text-center rounded-xl font-semibold transition-colors cursor-pointer text-sm"
                      >
                        Changer
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">Image de Couverture</label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-20 rounded-xl overflow-hidden bg-[#111] border-2 border-[#222] flex-shrink-0">
                      {profileData.banner_url ? (
                        <img src={profileData.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#666]">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="block w-full px-4 py-2 bg-[#222] hover:bg-[#333] text-white text-center rounded-xl font-semibold transition-colors cursor-pointer text-sm"
                      >
                        Changer
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#888] text-sm font-semibold mb-2">Display Name</label>
                <input
                  type="text"
                  value={profileData.display_name || ''}
                  onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-[#888] text-sm font-semibold mb-2">Bio (max 500 characters)</label>
                <textarea
                  value={profileData.bio || ''}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  maxLength={500}
                  rows={4}
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
                <div className="text-[#666] text-sm mt-1 text-right">
                  {(profileData.bio || '').length}/500
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">City</label>
                  <input
                    type="text"
                    value={profileData.city || ''}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">Country</label>
                  <input
                    type="text"
                    value={profileData.country || ''}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    placeholder="France"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">Nationality</label>
                  <input
                    type="text"
                    value={profileData.nationality || ''}
                    onChange={(e) => setProfileData({ ...profileData, nationality: e.target.value })}
                    className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    placeholder="French"
                  />
                </div>
                <div>
                  <label className="block text-[#888] text-sm font-semibold mb-2">Crew / Collective</label>
                  <input
                    type="text"
                    value={profileData.team_collective || ''}
                    onChange={(e) => setProfileData({ ...profileData, team_collective: e.target.value })}
                    className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    placeholder="Your crew name"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg">Roles</h3>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      profileData.roles.includes(role)
                        ? 'bg-streetiz-red text-white'
                        : 'bg-[#222] text-[#888] hover:bg-[#333] hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg">Styles & Vibes</h3>
              <div className="flex flex-wrap gap-2">
                {availableStyles.map(style => (
                  <button
                    key={style}
                    onClick={() => toggleStyle(style)}
                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                      profileData.styles.includes(style)
                        ? 'bg-streetiz-red text-white'
                        : 'bg-[#222] text-[#888] hover:bg-[#333] hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-streetiz-red" />
                Photos ({photos.length}/9)
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[#111] group">
                    <img src={photo.media_url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              {photos.length < 9 && (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className={`w-full px-6 py-4 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingPhoto ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload Photos (Max 5MB chacune)
                        </>
                      )}
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#222]"></div>
                    <span className="text-[#666] text-sm font-semibold">OU</span>
                    <div className="flex-1 h-px bg-[#222]"></div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="URL de la photo (ex: Pexels, Unsplash)"
                      className="flex-1 bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    />
                    <button
                      onClick={handleAddPhoto}
                      className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-streetiz-red" />
                Videos ({videos.length}/3)
              </h3>
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div key={index} className="relative bg-[#111] rounded-xl p-4 border border-[#222] group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold">{video.external_platform || 'Video'}</p>
                        <p className="text-[#666] text-sm truncate">{video.external_url}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveVideo(index)}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {videos.length < 3 && (
                <div className="space-y-2">
                  <select
                    value={newVideoPlatform}
                    onChange={(e) => setNewVideoPlatform(e.target.value as 'youtube' | 'tiktok')}
                    className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="Video URL"
                      className="flex-1 bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                    />
                    <button
                      onClick={handleAddVideo}
                      className="px-6 py-3 bg-streetiz-red hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-streetiz-red" />
                Social Links
              </h3>
              <div className="space-y-3">
                <input
                  type="url"
                  value={profileData.social_links.instagram || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, instagram: e.target.value }
                  })}
                  placeholder="Instagram URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
                <input
                  type="url"
                  value={profileData.social_links.tiktok || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, tiktok: e.target.value }
                  })}
                  placeholder="TikTok URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
                <input
                  type="url"
                  value={profileData.social_links.youtube || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, youtube: e.target.value }
                  })}
                  placeholder="YouTube URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
                <input
                  type="url"
                  value={profileData.social_links.soundcloud || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, soundcloud: e.target.value }
                  })}
                  placeholder="SoundCloud URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
                <input
                  type="url"
                  value={profileData.social_links.spotify || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, spotify: e.target.value }
                  })}
                  placeholder="Spotify URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
                <input
                  type="url"
                  value={profileData.social_links.other || ''}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    social_links: { ...profileData.social_links, other: e.target.value }
                  })}
                  placeholder="Other Website URL"
                  className="w-full bg-[#111] text-white px-4 py-3 rounded-xl border border-[#222] focus:border-streetiz-red outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-[#222]">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 bg-[#222] hover:bg-[#333] text-white rounded-xl font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-streetiz-red to-red-600 hover:from-red-600 hover:to-streetiz-red text-white rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
