import { Zap, MapPin, Music, Headphones, Home, Users, Sparkles } from 'lucide-react';

interface LibreTonightBadgeProps {
  locationValue?: string;
  updatedAt?: string;
  size?: 'sm' | 'md' | 'lg';
  preferences?: string[];
}

const PREFERENCE_LABELS: Record<string, { label: string; icon: any }> = {
  bar_dansant: { label: 'Bar Dansant', icon: Music },
  soiree_techno: { label: 'Soirée Techno', icon: Headphones },
  soiree_privee_after: { label: 'Soirée Privée / After', icon: Home },
  training_danse: { label: 'Training Danse', icon: Users },
  decouverte_spot: { label: 'Découverte / New Spot', icon: Sparkles }
};

export default function LibreTonightBadge({ locationValue, updatedAt, size = 'md', preferences = [] }: LibreTonightBadgeProps) {
  const getTimeAgo = (timestamp?: string) => {
    if (!timestamp) return '';
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Today';
  };

  const sizeClasses = {
    sm: {
      badge: 'px-2.5 py-1 text-xs',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className="inline-flex flex-col gap-2">
      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-400 border border-purple-500/30 rounded-full font-bold ${classes.badge}`}>
        <Zap className={`${classes.icon} animate-pulse`} />
        <span>Libre Tonight</span>
      </div>
      {locationValue && (
        <div className="flex items-center gap-1 text-[#888] ml-1">
          <MapPin className="w-3 h-3" />
          <span className={`${classes.text} font-medium`}>{locationValue}</span>
        </div>
      )}
      {preferences && preferences.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {preferences.map((pref) => {
            const prefData = PREFERENCE_LABELS[pref];
            if (!prefData) return null;
            const Icon = prefData.icon;
            return (
              <div
                key={pref}
                className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300 text-xs font-semibold"
              >
                <Icon className="w-3 h-3" />
                <span>{prefData.label}</span>
              </div>
            );
          })}
        </div>
      )}
      {updatedAt && (
        <span className="text-xs text-[#666] ml-1">Updated {getTimeAgo(updatedAt)}</span>
      )}
    </div>
  );
}
