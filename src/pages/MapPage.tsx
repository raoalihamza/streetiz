import { useEffect, useState } from 'react';
import { MapPin, Play, X, Filter, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import VideoPlayer from '../components/VideoPlayer';

interface Video {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string;
  video_type: 'youtube' | 'vimeo';
  thumbnail_url: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  year: number | null;
  video_subtype: string | null;
  views: number;
}

export default function MapPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [videos, selectedCountry, selectedYear, selectedType]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('status', 'published')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = [...videos];

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(v => v.country === selectedCountry);
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(v => v.year?.toString() === selectedYear);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(v => v.video_subtype === selectedType);
    }

    setFilteredVideos(filtered);
  };

  const countries = Array.from(new Set(videos.map(v => v.country).filter(Boolean)));
  const years = Array.from(new Set(videos.map(v => v.year).filter(Boolean))).sort().reverse();
  const types = Array.from(new Set(videos.map(v => v.video_subtype).filter(Boolean)));

  const convertToMapPosition = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-neon-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <section className="relative py-16 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage: "url('https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg')",
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <h1 className="heading-hero text-white mb-4">
            <span className="text-neon-red glow-red">World Map</span>
          </h1>
          <p className="text-xl text-[#a0a0a0] max-w-2xl">
            Explore videos from events around the globe. Click markers to watch.
          </p>
        </div>
      </section>

      <section className="px-4 max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-[#a0a0a0]" />
            <span className="text-white font-semibold">Filters:</span>
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input-urban px-4 py-2"
          >
            <option value="all">All Countries</option>
            {countries.map((country) => (
              <option key={country} value={country!}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="input-urban px-4 py-2"
          >
            <option value="all">All Years</option>
            {years.map((year) => (
              <option key={year} value={year!.toString()}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-urban px-4 py-2"
          >
            <option value="all">All Types</option>
            {types.map((type) => (
              <option key={type} value={type!}>
                {type}
              </option>
            ))}
          </select>

          <span className="text-[#a0a0a0] ml-auto">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
          </span>
        </div>
      </section>

      <section className="px-4 max-w-7xl mx-auto">
        <div className="card-urban relative overflow-hidden" style={{ height: '600px' }}>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgNTAiPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTAiIGZpbGw9IiMxYTFhMWEiLz48cGF0aCBkPSJNMjAsMTBoMTB2NWgtMTB6bTMwLDVoMTV2N2gtMTV6bTIwLDJoMTJ2NmgtMTJ6bTEwLDE1aDh2NWgtOHptLTUwLDVoMTB2OGgtMTB6IiBmaWxsPSIjMmEyYTJhIi8+PC9zdmc+')",
            }}
          ></div>

          <div className="absolute inset-0">
            {filteredVideos.map((video) => {
              if (!video.latitude || !video.longitude) return null;
              const pos = convertToMapPosition(video.latitude, video.longitude);

              return (
                <div
                  key={video.id}
                  className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  onMouseEnter={() => setHoveredVideo(video)}
                  onMouseLeave={() => setHoveredVideo(null)}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-neon-red rounded-full animate-pulse group-hover:scale-150 transition-transform glow-red-box"></div>
                    <div className="absolute top-0 left-0 w-4 h-4 bg-neon-red rounded-full opacity-50 animate-ping"></div>
                  </div>

                  {hoveredVideo?.id === video.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 card-urban p-3 animate-fade-in z-50 pointer-events-none">
                      <div className="flex items-start space-x-3">
                        <div className="w-20 h-12 bg-[#0a0a0a] rounded overflow-hidden flex-shrink-0">
                          <img
                            src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white line-clamp-2 mb-1">
                            {video.title}
                          </h4>
                          <div className="flex items-center text-xs text-[#a0a0a0] space-x-2">
                            <span>{video.city}</span>
                            {video.year && <span>• {video.year}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 left-4 card-urban p-3">
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-neon-red" />
                <span className="text-white font-semibold">Video Location</span>
              </div>
              <div className="text-[#a0a0a0]">Click markers to watch</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="heading-medium text-white mb-8">All Videos on Map</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="card-dynamic group cursor-pointer"
              onClick={() => setSelectedVideo(video)}
            >
              <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden">
                <img
                  src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 bg-neon-red rounded-full flex items-center justify-center glow-red-box">
                    <Play className="w-7 h-7 text-white fill-white ml-1" />
                  </div>
                </div>
                {video.video_subtype && (
                  <div className="absolute top-2 left-2">
                    <span className="badge-red text-xs">{video.video_subtype}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-2 line-clamp-2 group-hover:text-neon-red transition-colors">
                  {video.title}
                </h3>
                <div className="flex items-center text-xs text-[#a0a0a0] space-x-2 mb-1">
                  <MapPin className="w-3 h-3" />
                  <span>{video.city}, {video.country}</span>
                </div>
                {video.year && (
                  <div className="flex items-center text-xs text-[#a0a0a0] space-x-2">
                    <Calendar className="w-3 h-3" />
                    <span>{video.year}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.video_url}
          videoType={selectedVideo.video_type}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
