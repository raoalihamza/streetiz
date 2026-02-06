import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Video, Music, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    videos: 0,
    music: 0,
    events: 0,
    favorites: 0,
  });

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const [videosRes, musicRes, eventsRes, favoritesRes] = await Promise.all([
        supabase
          .from('videos')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', user.id),
        supabase
          .from('music')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', user.id),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('organizer_id', user.id),
        supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
      ]);

      setStats({
        videos: videosRes.count || 0,
        music: musicRes.count || 0,
        events: eventsRes.count || 0,
        favorites: favoritesRes.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-neon-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="relative py-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg')",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="heading-hero text-white mb-4">
            <span className="text-neon-red glow-red">Dashboard</span>
          </h1>
          <p className="text-xl text-[#a0a0a0]">
            Welcome back, {profile.display_name || profile.username}
          </p>
        </div>
      </section>

      <section className="py-8 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="card-urban p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-32 h-32 bg-gradient-red rounded-full flex items-center justify-center mb-4 glow-red-box">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>

                <h2 className="heading-small text-white mb-2">
                  {profile.display_name || profile.username}
                  {profile.is_verified && (
                    <span className="inline-block w-3 h-3 bg-neon-red rounded-full ml-2 glow-red-box"></span>
                  )}
                </h2>

                <p className="text-[#a0a0a0] mb-4">@{profile.username}</p>

                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a1a1a] rounded-full">
                  <Shield className="w-4 h-4 text-neon-red" />
                  <span className="text-sm font-bold uppercase text-white">
                    {profile.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {profile.bio && (
                <div className="mb-6">
                  <h3 className="font-bold text-white mb-2">Bio</h3>
                  <p className="text-[#a0a0a0] text-sm">{profile.bio}</p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center text-[#a0a0a0]">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center text-[#a0a0a0]">
                  <Calendar className="w-4 h-4 mr-3" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="card-urban p-6">
                <div className="flex items-center justify-between mb-4">
                  <Video className="w-8 h-8 text-neon-red" />
                  <span className="heading-medium text-white">{stats.videos}</span>
                </div>
                <p className="text-[#a0a0a0] font-semibold">Videos</p>
              </div>

              <div className="card-urban p-6">
                <div className="flex items-center justify-between mb-4">
                  <Music className="w-8 h-8 text-neon-red" />
                  <span className="heading-medium text-white">{stats.music}</span>
                </div>
                <p className="text-[#a0a0a0] font-semibold">Tracks</p>
              </div>

              <div className="card-urban p-6">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-8 h-8 text-neon-red" />
                  <span className="heading-medium text-white">{stats.events}</span>
                </div>
                <p className="text-[#a0a0a0] font-semibold">Events</p>
              </div>

              <div className="card-urban p-6">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-8 h-8 text-neon-red" />
                  <span className="heading-medium text-white">{stats.favorites}</span>
                </div>
                <p className="text-[#a0a0a0] font-semibold">Favorites</p>
              </div>
            </div>

            <div className="card-urban p-8">
              <h3 className="heading-small text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="btn-primary">Upload Video</button>
                <button className="btn-secondary">Submit Music</button>
                {(profile.role === 'organizer' || profile.role === 'admin') && (
                  <>
                    <button className="btn-ghost">Create Event</button>
                    <button className="btn-ghost">View Analytics</button>
                  </>
                )}
              </div>
            </div>

            {profile.role === 'admin' && (
              <div className="card-urban p-8 mt-8 border-2 border-neon-red">
                <h3 className="heading-small text-white mb-6 flex items-center">
                  <Shield className="w-6 h-6 text-neon-red mr-2" />
                  Admin Panel
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="btn-primary">Moderate Content</button>
                  <button className="btn-primary">Manage Users</button>
                  <button className="btn-secondary">Review Events</button>
                  <button className="btn-secondary">Site Analytics</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
