import { useEffect, useState } from 'react';
import { Play, ArrowRight, ChevronLeft, ChevronRight, Flame, Video, TrendingUp, Clock, Eye, Calendar } from 'lucide-react';
import { NewsService } from '../services';
import { supabase } from '../lib/supabase';
import BreakingNews from '../components/BreakingNews';
import AudioPlayer from '../components/AudioPlayer';
import SidebarWidgets from '../components/SidebarWidgets';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  featured_image?: string;
  thumbnail_url?: string;
  cover_image?: string;
  category?: string;
  artist?: string;
  event_date?: string;
  views?: number;
  plays?: number;
  excerpt?: string;
  description?: string;
  location?: string;
  published_at?: string;
  tags?: string[];
  city?: string;
  country?: string;
}

interface HomePageProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredNews, setFeaturedNews] = useState<ContentItem[]>([]);
  const [latestVideos, setLatestVideos] = useState<ContentItem[]>([]);
  const [latestPosts, setLatestPosts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: 'Red Bull BC One 2024: La Finale',
      category: 'Battle',
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      views: '2.3M',
    },
    {
      id: 2,
      title: 'Boiler Room Paris: Techno Marathon',
      category: 'DJ Set',
      image: 'https://images.pexels.com/photos/3775131/pexels-photo-3775131.jpeg',
      views: '1.8M',
    },
    {
      id: 3,
      title: 'Juste Debout World Finals',
      category: 'Dance',
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
      views: '1.5M',
    },
  ];

  useEffect(() => {
    loadContent();
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadContent = async () => {
    try {
      // OPTIMIZED: Single query for all news instead of two separate queries
      const [allNews, videosRes] = await Promise.all([
        NewsService.getAll(),
        supabase
          .from('videos')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(4),
      ]);

      if (allNews) {
        // Split news into featured (first 6) and latest posts (remaining 9)
        setFeaturedNews(allNews.slice(0, 6));
        setLatestPosts(allNews.slice(6, 15));
      }
      if (videosRes.data) setLatestVideos(videosRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  const getCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('techno') || lowerTitle.includes('edm') || lowerTitle.includes('dance')) return 'MUSIC';
    if (lowerTitle.includes('battle') || lowerTitle.includes('breaking') || lowerTitle.includes('breaker')) return 'BREAKING';
    if (lowerTitle.includes('club') || lowerTitle.includes('party') || lowerTitle.includes('closing')) return 'NIGHTLIFE';
    if (lowerTitle.includes('festival') || lowerTitle.includes('event')) return 'EVENTS';
    return 'CULTURE';
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#222222] border-t-streetiz-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BreakingNews />

      <div className="relative h-[56vh] py-8 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex gap-4 h-full">
            {/* Slide principale */}
            <div className="relative w-[70%] h-full rounded-2xl overflow-hidden group">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent"></div>

                  <div className="relative h-full flex items-end">
                    <div className="w-full px-8 pb-8">
                      <div className="max-w-3xl space-y-4 animate-slide-up">
                        <span className="badge-pill inline-flex">
                          <Video className="w-3 h-3 mr-2" />
                          {slide.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                          {slide.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-[#a0a0a0]">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{slide.views} vues</span>
                          </span>
                        </div>
                        <button className="btn-primary flex items-center space-x-2 mt-6">
                          <Play className="w-5 h-5 fill-white" />
                          <span>Regarder maintenant</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Navigation buttons pour la slide principale */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-streetiz-red transition-all opacity-0 group-hover:opacity-100 border border-[#222222]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-streetiz-red transition-all opacity-0 group-hover:opacity-100 border border-[#222222]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Aperçus verticaux */}
            <div className="w-[30%] flex flex-col gap-3">
              {[1, 2, 3].map((offset) => {
                const slideIndex = (currentSlide + offset) % heroSlides.length;
                const slide = heroSlides[slideIndex];
                return (
                  <div
                    key={slideIndex}
                    onClick={() => setCurrentSlide(slideIndex)}
                    className="relative flex-1 rounded-xl overflow-hidden cursor-pointer group/preview hover:ring-2 hover:ring-streetiz-red transition-all"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover/preview:scale-110"
                      style={{ backgroundImage: `url('${slide.image}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent"></div>

                    <div className="relative h-full flex flex-col justify-end p-4">
                      <span className="text-xs text-streetiz-red font-semibold mb-1 flex items-center">
                        <Video className="w-3 h-3 mr-1" />
                        {slide.category}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                        {slide.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-[#a0a0a0] mt-2">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{slide.views}</span>
                        </span>
                      </div>
                    </div>

                    {/* Play icon au hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-streetiz-red/90 flex items-center justify-center">
                        <Play className="w-6 h-6 fill-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indicateurs en bas */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-40">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-streetiz-red w-8' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-12">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Flame className="w-7 h-7 text-streetiz-red" />
                  <h2 className="text-3xl font-black">À LA UNE</h2>
                </div>
                <button
                  onClick={() => onNavigate('news')}
                  className="text-streetiz-red hover:text-[#FF1808] font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Tout voir</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredNews.slice(0, 4).map((article, index) => (
                  <div
                    key={article.id}
                    className={`card-premium group cursor-pointer hover:border-streetiz-red/50 transition-all ${
                      index === 0 ? 'md:col-span-2' : ''
                    }`}
                    onClick={() => onNavigate('news', article)}
                  >
                    <div className={`relative ${index === 0 ? 'aspect-[21/9]' : 'aspect-video'} overflow-hidden`}>
                      <img
                        src={article.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="badge-pill text-xs">
                          {index === 0 ? 'BREAKING' : article.category || 'NEWS'}
                        </span>
                      </div>
                      {index === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-streetiz-red transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-sm text-[#a0a0a0] line-clamp-2">{article.excerpt}</p>
                        </div>
                      )}
                    </div>
                    {index !== 0 && (
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2 group-hover:text-streetiz-red transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-[#a0a0a0] line-clamp-2 mb-3">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-[#666666]">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.published_at && getTimeAgo(article.published_at)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <Video className="w-7 h-7 text-streetiz-red" />
                  <h2 className="text-3xl font-black">DERNIÈRES VIDÉOS</h2>
                </div>
                <button
                  onClick={() => onNavigate('videos')}
                  className="text-streetiz-red hover:text-[#FF1808] font-semibold flex items-center space-x-2 transition-colors"
                >
                  <span>Tout voir</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {latestVideos.map((video) => (
                  <div
                    key={video.id}
                    className="card-premium group cursor-pointer hover:border-streetiz-red/50 transition-all"
                    onClick={() => onNavigate('videos', video)}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-streetiz-red rounded-full flex items-center justify-center glow-red-box">
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </div>
                      </div>
                      {video.category && (
                        <div className="absolute top-3 left-3">
                          <span className="badge-pill text-xs">{video.category}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-streetiz-red transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-[#666666]">
                        <span>{video.views || 0} vues</span>
                        {video.city && <span>{video.city}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {latestPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-3">
                    <Flame className="w-7 h-7 text-streetiz-red" />
                    <h2 className="text-3xl font-black">DERNIERS ARTICLES</h2>
                  </div>
                  <button
                    onClick={() => onNavigate('news')}
                    className="text-streetiz-red hover:text-[#FF1808] font-semibold flex items-center space-x-2 transition-colors"
                  >
                    <span>Tout voir</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {latestPosts.map((post) => (
                  <div
                    key={post.id}
                    className="card-premium group cursor-pointer hover:border-streetiz-red/50 transition-all"
                    onClick={() => onNavigate('news', post)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={post.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      <div className="absolute top-3 left-3">
                        <span className="badge-pill text-xs">
                          {getCategory(post.title)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold mb-2 group-hover:text-streetiz-red transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#a0a0a0] line-clamp-3 mb-4 leading-relaxed">
                        {post.excerpt || 'Découvrez les dernières tendances et actualités de la culture urbaine, street art, musique électronique et bien plus encore.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-[#666666]">
                          <Clock className="w-3 h-3 mr-1" />
                          {post.published_at && getTimeAgo(post.published_at)}
                        </div>
                        <button className="text-streetiz-red text-xs font-bold hover:text-[#FF1808] transition-colors flex items-center space-x-1">
                          <span>Lire plus</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 lg:sticky lg:top-32 lg:self-start">
            <AudioPlayer />

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-streetiz-red mr-2" />
                Trending Now
              </h3>
              <div className="space-y-3">
                {featuredNews.slice(0, 5).map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 cursor-pointer group"
                    onClick={() => onNavigate('news', item)}
                  >
                    <div className="text-xl font-black text-streetiz-red/30 leading-none w-6">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#666666] mt-1">
                        {item.published_at && getTimeAgo(item.published_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SidebarWidgets onNavigate={onNavigate} />

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
                <Calendar className="w-4 h-4 text-streetiz-red mr-2" />
                Hot Events
              </h3>
              <div className="space-y-3">
                {[
                  { title: 'Red Bull BC One Cypher', date: '15 JAN', location: 'Paris' },
                  { title: 'Boiler Room x Techno', date: '20 JAN', location: 'Berlin' },
                  { title: 'House of Vans', date: '25 JAN', location: 'London' },
                ].map((event, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#1a1a1a] cursor-pointer transition-all group">
                    <div className="w-12 h-12 bg-gradient-to-br from-streetiz-red to-[#FF1808] rounded-lg flex flex-col items-center justify-center text-xs font-bold shrink-0">
                      <span>{event.date.split(' ')[0]}</span>
                      <span className="text-[10px]">{event.date.split(' ')[1]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-streetiz-red transition-colors">{event.title}</h4>
                      <p className="text-xs text-[#666666] flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onNavigate('events')}
                className="btn-primary w-full text-xs py-2 mt-4"
              >
                View All Events
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-[#222222] py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="text-2xl font-black">
                <span className="text-white">STREET</span>
                <span className="text-streetiz-red">IZ</span>
              </div>
              <p className="text-sm text-[#666666]">Connect to the Street</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <div className="space-y-2 text-sm text-[#a0a0a0]">
                <button onClick={() => onNavigate('videos')} className="block hover:text-white transition-colors">Vidéos</button>
                <button onClick={() => onNavigate('music')} className="block hover:text-white transition-colors">Music</button>
                <button onClick={() => onNavigate('events')} className="block hover:text-white transition-colors">Events</button>
                <button onClick={() => onNavigate('community')} className="block hover:text-white transition-colors">Communauté</button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">À propos</h4>
              <div className="space-y-2 text-sm text-[#a0a0a0]">
                <button onClick={() => onNavigate('contact')} className="block hover:text-white transition-colors">Contact</button>
                <a href="#" className="block hover:text-white transition-colors">Mentions légales</a>
                <a href="#" className="block hover:text-white transition-colors">CGU</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-4">Suivez-nous</h4>
              <div className="flex space-x-3">
                {['Instagram', 'TikTok', 'YouTube'].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center hover:bg-streetiz-red transition-colors text-xs font-bold"
                  >
                    {social[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#222222] text-center text-sm text-[#666666]">
            © 2024 STREETIZ. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
