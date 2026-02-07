import { useState, useEffect } from 'react';
import { X, MapPin, Eye, MessageCircle, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MarketplaceItemModalProps {
  itemId: string;
  onClose: () => void;
}

interface Item {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  contact_info: string;
  status: string;
  views_count: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function MarketplaceItemModal({ itemId, onClose }: MarketplaceItemModalProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItem();
    incrementViews();
  }, [itemId]);

  const loadItem = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          profiles:seller_id (
            username,
            avatar_url
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ views_count: supabase.sql`views_count + 1` })
        .eq('id', itemId);

      if (error) console.error('Error incrementing views:', error);
    } catch (error) {
      console.error('Error incrementing views:', error);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading || !item) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] p-8 w-full max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-96 bg-[#222] rounded"></div>
            <div className="h-8 bg-[#222] rounded w-3/4"></div>
            <div className="h-4 bg-[#222] rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.pexels.com/photos/1649693/pexels-photo-1649693.jpeg'];

  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold px-3 py-1 rounded-full">
                {getCategoryLabel(item.category)}
              </span>
              <span className="flex items-center gap-2 text-sm text-[#666]">
                <Eye className="w-4 h-4" />
                {item.views_count || 0} vues
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#666] hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div>
                <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-black">
                  <img
                    src={images[currentImageIndex]}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                </div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-streetiz-red'
                            : 'border-[#222] hover:border-[#333]'
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-4">
                    {item.title}
                  </h2>
                  <p className="text-streetiz-red font-black text-4xl mb-4">
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex items-center gap-2 text-[#888] mb-4">
                    <MapPin className="w-5 h-5" />
                    <span className="text-lg">{item.location}</span>
                  </div>
                </div>

                <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
                  <h3 className="text-white font-bold mb-2">Description</h3>
                  <p className="text-[#ddd] whitespace-pre-wrap">{item.description}</p>
                </div>

                <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
                  <h3 className="text-white font-bold mb-3">Vendeur</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={item.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.profiles?.username}`}
                      alt={item.profiles?.username}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="text-white font-bold">{item.profiles?.username}</p>
                      <p className="text-sm text-[#666]">
                        Publié le {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-streetiz-red to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-streetiz-red/30 transition-all flex items-center justify-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Contacter le vendeur
                </button>

                {item.contact_info && (
                  <div className="bg-[#111] rounded-2xl border border-[#222] p-4">
                    <h3 className="text-white font-bold mb-2">Informations de contact</h3>
                    <p className="text-[#ddd] text-sm">{item.contact_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
