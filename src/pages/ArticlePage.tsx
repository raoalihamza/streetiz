import { useEffect, useState } from 'react';
import { X, Clock, Eye, Calendar, Play, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
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
  city?: string;
}

interface ArticlePageProps {
  article: Article;
  onNavigate: (page: string, data?: any) => void;
  onBack: () => void;
}

export default function ArticlePage({ article, onNavigate, onBack }: ArticlePageProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [topVideos, setTopVideos] = useState<Video[]>([]);
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    incrementViews();
    window.scrollTo(0, 0);
  }, [article.id]);

  const loadContent = async () => {
    try {
      const [relatedRes, videosRes, recentRes] = await Promise.all([
        supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .neq('id', article.id)
          .order('published_at', { ascending: false })
          .limit(4),
        supabase
          .from('videos')
          .select('*')
          .eq('status', 'published')
          .order('views', { ascending: false })
          .limit(5),
        supabase
          .from('news')
          .select('*')
          .eq('status', 'published')
          .neq('id', article.id)
          .order('published_at', { ascending: false })
          .limit(5),
      ]);

      if (relatedRes.data) setRelatedArticles(relatedRes.data);
      if (videosRes.data) setTopVideos(videosRes.data);
      if (recentRes.data) setRecentArticles(recentRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_views', { row_id: article.id });
    } catch (error) {
      console.error('Error incrementing views:', error);
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
    if (lowerTitle.includes('art') || lowerTitle.includes('graffiti') || lowerTitle.includes('mural')) return 'STREET ART';
    return 'CULTURE';
  };

  const formatContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, index) => {
      if (para.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-black text-white mt-8 mb-4">
            {para.replace('## ', '')}
          </h2>
        );
      }
      return (
        <p key={index} className="text-[#a0a0a0] leading-relaxed mb-4">
          {para}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-[#a0a0a0] hover:text-streetiz-red transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          <article className="space-y-6">
            <div className="space-y-4">
              <span className="badge-pill inline-flex">
                {getCategory(article.title)}
              </span>

              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                {article.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-[#a0a0a0]">
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{article.published_at && getTimeAgo(article.published_at)}</span>
                </span>
                {article.views && (
                  <span className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{article.views} vues</span>
                  </span>
                )}
              </div>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={article.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-xl text-white font-semibold leading-relaxed mb-8">
                {article.excerpt}
              </p>

              <div className="text-base">
                {formatContent(article.content)}
              </div>
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4 flex items-center">
                <Play className="w-4 h-4 text-streetiz-red mr-2" />
                Top Videos
              </h3>
              <div className="space-y-3">
                {topVideos.map((video) => (
                  <div
                    key={video.id}
                    className="group cursor-pointer"
                    onClick={() => onNavigate('videos', video)}
                  >
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
            </div>

            <div className="card-premium p-5">
              <h3 className="text-sm font-black tracking-wider uppercase mb-4">
                In case you missed it
              </h3>
              <div className="space-y-3">
                {recentArticles.map((item) => (
                  <div
                    key={item.id}
                    className="cursor-pointer group"
                    onClick={() => onNavigate('news', item)}
                  >
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-streetiz-red transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#666666] mt-1">
                      {item.published_at && getTimeAgo(item.published_at)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-black mb-8 flex items-center">
              <ArrowRight className="w-7 h-7 text-streetiz-red mr-3" />
              Articles recommandés
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <div
                  key={relatedArticle.id}
                  className="card-premium group cursor-pointer hover:border-streetiz-red/50 transition-all"
                  onClick={() => onNavigate('news', relatedArticle)}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={relatedArticle.featured_image || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg'}
                      alt={relatedArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className="badge-pill text-xs">
                        {getCategory(relatedArticle.title)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold mb-2 group-hover:text-streetiz-red transition-colors line-clamp-2">
                      {relatedArticle.title}
                    </h3>
                    <p className="text-sm text-[#a0a0a0] line-clamp-2 mb-3">
                      {relatedArticle.excerpt}
                    </p>
                    <div className="flex items-center text-xs text-[#666666]">
                      <Clock className="w-3 h-3 mr-1" />
                      {relatedArticle.published_at && getTimeAgo(relatedArticle.published_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/80 rounded-full flex items-center justify-center hover:bg-streetiz-red transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-[#a0a0a0]">
              Video Player
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
