import { useState } from 'react';
import { Clock, Eye, Video, TrendingUp, Star, Mail } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  time: string;
  views?: number;
  thumbnail?: string;
}

interface SidebarWidgetsProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function SidebarWidgets({ onNavigate }: SidebarWidgetsProps) {
  const [postFilter, setPostFilter] = useState<'recent' | 'popular'>('recent');

  const recentPosts: Post[] = [
    { id: '1', title: 'New Techno Label Launches in Berlin', time: '2h ago', views: 1234 },
    { id: '2', title: 'DJ Set: Carl Cox B2B Adam Beyer', time: '5h ago', views: 5678 },
    { id: '3', title: 'Underground Raves Making a Comeback', time: '1d ago', views: 3456 },
    { id: '4', title: 'Festival Guide: Summer 2024 Edition', time: '2d ago', views: 8901 },
  ];

  const popularPosts: Post[] = [
    { id: '1', title: 'The Evolution of Techno Music', time: '1w ago', views: 45678 },
    { id: '2', title: 'Top 10 Breakdancers of 2024', time: '3d ago', views: 34567 },
    { id: '3', title: 'Exclusive: Boiler Room Paris Recap', time: '5d ago', views: 28901 },
    { id: '4', title: 'Street Dance vs Club Dance', time: '1w ago', views: 23456 },
  ];

  const mostWatchedVideos: Post[] = [
    {
      id: '1',
      title: 'Red Bull BC One Final Battle',
      time: '2.3M views',
      thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
    },
    {
      id: '2',
      title: 'Boiler Room: Berlin Techno Night',
      time: '1.8M views',
      thumbnail: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg'
    },
    {
      id: '3',
      title: 'House of Vans: Street Sessions',
      time: '1.2M views',
      thumbnail: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'
    },
  ];

  const displayPosts = postFilter === 'recent' ? recentPosts : popularPosts;

  return (
    <>
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black tracking-wider uppercase">
            {postFilter === 'recent' ? 'Recent' : 'Popular'} Posts
          </h3>
          <div className="flex space-x-1 bg-[#1a1a1a] rounded-lg p-0.5">
            <button
              onClick={() => setPostFilter('recent')}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                postFilter === 'recent'
                  ? 'bg-streetiz-red text-white'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              NEW
            </button>
            <button
              onClick={() => setPostFilter('popular')}
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider transition-all ${
                postFilter === 'popular'
                  ? 'bg-streetiz-red text-white'
                  : 'text-[#666666] hover:text-white'
              }`}
            >
              TOP
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {displayPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => onNavigate('news')}
              className="block w-full text-left p-3 rounded-lg hover:bg-[#1a1a1a] transition-all group"
            >
              <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors mb-1.5">
                {post.title}
              </h4>
              <div className="flex items-center space-x-3 text-xs text-[#666666]">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{post.time}</span>
                </span>
                {post.views && (
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{post.views.toLocaleString()}</span>
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="card-premium p-5">
        <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
          <Video className="w-4 h-4 text-streetiz-red mr-2" />
          Most Watched
        </h3>
        <div className="space-y-3">
          {mostWatchedVideos.map((video, index) => (
            <button
              key={video.id}
              onClick={() => onNavigate('videos')}
              className="flex items-start space-x-3 w-full text-left group"
            >
              <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a]">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-streetiz-red rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                  </div>
                </div>
                <div className="absolute top-1 left-1">
                  <span className="text-[10px] font-black text-streetiz-red">#{index + 1}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors mb-1">
                  {video.title}
                </h4>
                <p className="text-[10px] text-[#666666]">{video.time}</p>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('videos')}
          className="btn-primary w-full text-xs py-2 mt-4"
        >
          View All Videos
        </button>
      </div>

      <div className="card-premium p-5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-dashed border-streetiz-red/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black tracking-wider uppercase flex items-center">
            <Star className="w-4 h-4 text-streetiz-red mr-2" />
            Sponsored
          </h3>
          <span className="text-[10px] font-bold text-[#666666] bg-[#222222] px-2 py-1 rounded">AD</span>
        </div>
        <div className="aspect-[300/250] bg-gradient-to-br from-[#222222] to-[#111111] rounded-xl flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#333333] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(225,6,0,0.05)_0%,_transparent_70%)]"></div>
          <div className="relative z-10 text-center space-y-3">
            <Star className="w-16 h-16 text-streetiz-red/40 mx-auto" />
            <div className="space-y-2">
              <p className="text-sm text-white font-bold">VOTRE PUBLICITÉ ICI</p>
              <p className="text-xs text-[#888888]">Premium Ad Space</p>
              <div className="pt-3 border-t border-[#333333] mt-3">
                <p className="text-xs text-streetiz-red font-semibold">Contact</p>
                <p className="text-xs text-[#666666]">ads@streetiz.com</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <p className="text-[10px] text-[#666666]">
            Formats disponibles: 300×250 • 300×600
          </p>
        </div>
      </div>

      <div className="card-premium p-5 bg-gradient-to-br from-streetiz-red/10 to-transparent border-streetiz-red/20">
        <h3 className="text-sm font-black tracking-wider uppercase mb-2 flex items-center">
          <Mail className="w-4 h-4 text-streetiz-red mr-2" />
          Newsletter
        </h3>
        <p className="text-xs text-[#a0a0a0] mb-4">
          Get the latest news, videos, and exclusive content delivered to your inbox.
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          className="input-urban w-full mb-3 text-sm py-2"
        />
        <button className="btn-primary w-full text-xs py-2.5">
          Subscribe Now
        </button>
      </div>
    </>
  );
}
