import { useEffect, useState, useRef, useCallback } from 'react';
import { Clock, Eye, Calendar, Play, ChevronDown, ChevronUp, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  video_url?: string;
  status: string;
  views?: number;
  published_at?: string;
  created_at: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail_url?: string;
  views?: number;
  duration?: string;
}

interface ExpandedState {
  [key: string]: boolean;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTag, setSelectedTag] = useState('Tous');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedArticles, setExpandedArticles] = useState<ExpandedState>({});
  const [selectedVideo, setSelectedVideo] = useState<Article | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const articlesPerPage = 5;
  const maxPreviewLength = 1200;

  const categories = ['Tous', 'Clubbing', 'Street Art', 'Culture', 'Music', 'Events'];
  const tags = ['Tous', 'Electro', 'House', 'Techno', 'Dance', 'Festival'];

  useEffect(() => {
    loadContent();
  }, []);

  useEffect(() => {
    filterAndSortArticles();
  }, [articles, selectedCategory, sortBy, selectedTag]);

  useEffect(() => {
    setupInfiniteScroll();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedArticles, currentPage]);

  const loadContent = async () => {
    try {
      const [articlesRes, videosRes] = await Promise.all([
        supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
        supabase
          .from('videos')
          .select('*')
          .eq('status', 'published')
          .order('views', { ascending: false })
          .limit(4),
      ]);

      if (articlesRes.data) {
        setArticles(articlesRes.data);
        setBreakingNews(articlesRes.data.slice(0, 5));
      }
      if (videosRes.data) setTopVideos(videosRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortArticles = () => {
    let filtered = [...articles];

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter((article) =>
        getCategory(article.title).toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedTag !== 'Tous') {
      filtered = filtered.filter((article) =>
        article.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
        (article.content && article.content.toLowerCase().includes(selectedTag.toLowerCase()))
      );
    }

    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime());
        break;
      case 'popular':
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
    }

    setDisplayedArticles(filtered);
    setCurrentPage(1);
    setExpandedArticles({});
  };

  const setupInfiniteScroll = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMoreArticles()) {
          loadMoreArticles();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
  }, [loadingMore, currentPage, displayedArticles]);

  const hasMoreArticles = () => {
    return currentPage * articlesPerPage < displayedArticles.length;
  };

  const loadMoreArticles = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 500);
  };

  const getCategory = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('techno') || lowerTitle.includes('edm') || lowerTitle.includes('dance')) return 'MUSIC';
    if (lowerTitle.includes('club') || lowerTitle.includes('party') || lowerTitle.includes('closing')) return 'CLUBBING';
    if (lowerTitle.includes('art') || lowerTitle.includes('graffiti') || lowerTitle.includes('mural')) return 'STREET ART';
    if (lowerTitle.includes('festival') || lowerTitle.includes('event')) return 'EVENTS';
    if (lowerTitle.includes('culture') || lowerTitle.includes('interview')) return 'CULTURE';
    return 'NEWS';
  };

  const getTimeAgo = (date: string) => {
    const days = Math.floor((new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Hier";
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  const toggleExpanded = (articleId: string) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const shouldShowExpandButton = (content: string) => {
    return content.length > maxPreviewLength;
  };

  const getPreviewContent = (content: string) => {
    if (content.length <= maxPreviewLength) return content;
    const preview = content.substring(0, maxPreviewLength);
    const lastPeriod = preview.lastIndexOf('.');
    return lastPeriod > 0 ? preview.substring(0, lastPeriod + 1) : preview + '...';
  };

  const openVideoModal = (article: Article) => {
    setSelectedVideo(article);
    document.body.style.overflow = 'hidden';
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        closeVideoModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedVideo]);

  const paginatedArticles = displayedArticles.slice(0, currentPage * articlesPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="w-16 h-16 border-4 border-[#2a2a2a] border-t-streetiz-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-5xl font-black text-white mb-3">
            News <span className="text-streetiz-red">Feed</span>
          </h1>
          <p className="text-lg text-[#a0a0a0]">Articles complets dans votre timeline</p>
        </div>

        <div className="mb-6 rounded-xl bg-[#111] border border-[#333] overflow-hidden">
          <div className="flex items-center justify-center h-24 bg-gradient-to-r from-[#1a1a1a] via-[#222] to-[#1a1a1a]">
            <div className="text-center">
              <span className="text-xs text-white/50 uppercase tracking-wider">Sponsorisé</span>
              <p className="text-white font-bold text-lg mt-1">Votre publicité ici · 970x90</p>
            </div>
          </div>
        </div>

        <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-sm py-4 mb-6 -mx-4 px-4 border-b border-[#222]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Catégories:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/30'
                      : 'bg-[#1a1a1a] text-[#a0a0a0] hover:bg-[#222] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Trier:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1.5 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold border border-[#333] hover:border-streetiz-red focus:outline-none focus:border-streetiz-red transition-all"
                >
                  <option value="recent">Plus récents</option>
                  <option value="oldest">Plus anciens</option>
                  <option value="popular">Les plus lus</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Tags:</span>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      selectedTag === tag
                        ? 'bg-streetiz-red text-white'
                        : 'bg-[#1a1a1a] text-[#666] hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-8">
            {paginatedArticles.map((article) => {
              const isExpanded = expandedArticles[article.id];
              const showButton = shouldShowExpandButton(article.content);
              const displayContent = isExpanded || !showButton
                ? article.content
                : getPreviewContent(article.content);

              return (
                <article
                  key={article.id}
                  className="card-premium overflow-hidden"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-4">
                      <span className="badge-pill text-xs">
                        {getCategory(article.title)}
                      </span>
                      {article.views && article.views > 1000 && (
                        <span className="bg-streetiz-red px-3 py-1 rounded-full text-xs font-bold">
                          HOT
                        </span>
                      )}
                    </div>

                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                      {article.title}
                    </h2>

                    <div className="flex items-center gap-4 text-sm text-[#666] mb-6">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span className="text-streetiz-red font-semibold">Streetiz</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.published_at && getTimeAgo(article.published_at)}
                      </span>
                      {article.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {article.views.toLocaleString()} vues
                        </span>
                      )}
                    </div>

                    {article.video_url && (
                      <div
                        className="relative aspect-video mb-6 rounded-xl overflow-hidden group cursor-pointer"
                        onClick={() => openVideoModal(article)}
                      >
                        <img
                          src={article.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                          <div className="w-20 h-20 bg-streetiz-red rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-2xl">
                            <Play className="w-10 h-10 fill-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )}

                    {!article.video_url && article.featured_image && (
                      <div className="relative aspect-video mb-6 rounded-xl overflow-hidden">
                        <img
                          src={article.featured_image}
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`prose prose-invert prose-lg max-w-none transition-all duration-500 ${
                        isExpanded ? 'max-h-[10000px]' : 'max-h-[2000px]'
                      }`}
                    >
                      <div className="text-[#c0c0c0] leading-relaxed whitespace-pre-line">
                        {displayContent}
                      </div>
                    </div>

                    {showButton && (
                      <button
                        onClick={() => toggleExpanded(article.id)}
                        className="mt-6 flex items-center gap-2 text-streetiz-red font-bold hover:text-white transition-colors group"
                      >
                        <span>{isExpanded ? 'Voir moins' : 'Voir plus'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 group-hover:transform group-hover:-translate-y-1 transition-transform" />
                        ) : (
                          <ChevronDown className="w-5 h-5 group-hover:transform group-hover:translate-y-1 transition-transform" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-[#222] px-6 py-4 flex items-center justify-between bg-[#0a0a0a]">
                    <div className="flex gap-4">
                      <button className="text-sm text-[#666] hover:text-streetiz-red transition-colors font-semibold">
                        Partager
                      </button>
                      <button className="text-sm text-[#666] hover:text-streetiz-red transition-colors font-semibold">
                        Sauvegarder
                      </button>
                    </div>
                    <span className="text-xs text-[#666]">ID: #{article.id.substring(0, 8)}</span>
                  </div>
                </article>
              );
            })}

            {loadingMore && (
              <div className="space-y-8">
                {[1, 2].map((i) => (
                  <div key={i} className="card-premium animate-pulse">
                    <div className="p-8">
                      <div className="h-6 bg-[#1a1a1a] rounded w-32 mb-4"></div>
                      <div className="h-10 bg-[#1a1a1a] rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-[#1a1a1a] rounded w-1/2 mb-6"></div>
                      <div className="aspect-video bg-[#1a1a1a] rounded-xl mb-6"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-[#1a1a1a] rounded"></div>
                        <div className="h-4 bg-[#1a1a1a] rounded"></div>
                        <div className="h-4 bg-[#1a1a1a] rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
              {!loadingMore && hasMoreArticles() && (
                <div className="text-[#666] text-sm">Scroll pour charger plus...</div>
              )}
              {!hasMoreArticles() && displayedArticles.length > 0 && (
                <div className="text-[#666] text-sm">Vous avez tout vu</div>
              )}
            </div>

            {displayedArticles.length === 0 && (
              <div className="text-center py-20">
                <p className="text-[#a0a0a0] text-lg">Aucun article trouvé</p>
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl bg-[#111] border border-[#333] overflow-hidden">
              <div className="flex flex-col items-center justify-center h-[600px] bg-gradient-to-b from-[#1a1a1a] via-[#222] to-[#1a1a1a] p-6 text-center">
                <span className="text-xs text-white/50 uppercase tracking-wider mb-2">Sponsorisé</span>
                <p className="text-white font-bold">Votre publicité ici</p>
                <p className="text-xs text-[#666] mt-2">300x600</p>
              </div>
            </div>

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 text-streetiz-red flex items-center">
                <span className="w-2 h-2 bg-streetiz-red rounded-full mr-2 animate-pulse"></span>
                Breaking News
              </h3>
              <div className="space-y-4">
                {breakingNews.map((item) => (
                  <div key={item.id} className="cursor-pointer group">
                    <h4 className="text-sm font-bold line-clamp-2 group-hover:text-streetiz-red transition-colors mb-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#666666]">
                      {item.published_at && getTimeAgo(item.published_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
                <Play className="w-4 h-4 text-streetiz-red mr-2" />
                Top Streetiz Videos
              </h3>
              <div className="space-y-3">
                {topVideos.map((video) => (
                  <div key={video.id} className="group cursor-pointer">
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                      <img
                        src={video.thumbnail_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-streetiz-red rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs font-bold">
                          {video.duration}
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-[#666666] mt-1">
                      {video.views || 0} vues
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
                <Calendar className="w-4 h-4 text-streetiz-red mr-2" />
                Events à venir
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
                      <p className="text-xs text-[#666666]">{event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 btn-secondary text-sm py-2">
                Voir l'agenda complet
              </button>
            </div>

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4">
                Streetiz Radio
              </h3>
              <div className="bg-[#0D0D0D] rounded-lg p-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-streetiz-red to-[#FF1808] rounded-lg flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#666666]">En direct</p>
                    <p className="text-sm font-bold">Mix du jour</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full bg-streetiz-red w-1/3"></div>
                  </div>
                  <div className="flex justify-between text-xs text-[#666666]">
                    <span>12:34</span>
                    <span>45:00</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeVideoModal}
        >
          <button
            onClick={closeVideoModal}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div
            className="w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
              {selectedVideo.video_url?.includes('youtube.com') || selectedVideo.video_url?.includes('youtu.be') ? (
                <iframe
                  src={selectedVideo.video_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              ) : (
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h3>
              <p className="text-[#a0a0a0]">Appuyez sur ESC pour fermer</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
