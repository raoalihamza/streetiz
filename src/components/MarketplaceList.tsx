import { useState, useEffect } from 'react';
import { MapPin, Eye, Tag } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  status: string;
  views_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface MarketplaceListProps {
  onItemClick: (itemId: string) => void;
  category: string;
}

export default function MarketplaceList({ onItemClick, category }: MarketplaceListProps) {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [category]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles:seller_id (
            username,
            avatar_url
          )
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: { [key: string]: string } = {
      'dj_gear': 'DJ',
      'video': 'Vidéo',
      'audio': 'Enceintes',
      'accessories': 'Accessoires',
      'lighting': 'Lumières',
      'other': 'Divers'
    };
    return labels[cat] || cat;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden animate-pulse">
            <div className="aspect-video bg-[#222]"></div>
            <div className="p-4 space-y-3">
              <div className="h-6 bg-[#222] rounded w-3/4"></div>
              <div className="h-8 bg-[#222] rounded w-1/3"></div>
              <div className="h-4 bg-[#222] rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className="bg-[#111] rounded-2xl border border-[#222] overflow-hidden hover:border-streetiz-red/50 transition-all cursor-pointer group"
        >
          <div className="aspect-video relative overflow-hidden">
            <img
              src={item.images[0] || 'https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg'}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute top-3 left-3">
              <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                {getCategoryLabel(item.category)}
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {item.views_count || 0}
              </span>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 group-hover:text-streetiz-red transition-colors">
              {item.title}
            </h3>

            <p className="text-streetiz-red font-black text-2xl mb-3">
              {formatPrice(item.price)}
            </p>

            <div className="flex items-center gap-2 text-[#666] text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <img
                src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles?.username}`}
                alt={item.profiles?.username}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-[#888]">
                {item.profiles?.username}
              </span>
            </div>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Tag className="w-16 h-16 text-[#333] mx-auto mb-4" />
          <p className="text-[#666] text-lg">Aucune annonce trouvée</p>
        </div>
      )}
    </div>
  );
}
