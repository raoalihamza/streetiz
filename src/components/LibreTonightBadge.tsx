import { Zap, MapPin } from 'lucide-react';

interface LibreTonightBadgeProps {
  locationValue?: string;
  updatedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LibreTonightBadge({ locationValue, updatedAt, size = 'md' }: LibreTonightBadgeProps) {
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
    <div className="inline-flex flex-col gap-1">
      <div className={`inline-flex items-center gap-1.5 bg-streetiz-red/20 text-streetiz-red border border-streetiz-red/30 rounded-full font-bold ${classes.badge}`}>
        <Zap className={`${classes.icon} animate-pulse`} />
        <span>Libre Tonight</span>
      </div>
      {locationValue && (
        <div className="flex items-center gap-1 text-[#888] ml-1">
          <MapPin className="w-3 h-3" />
          <span className={`${classes.text} font-medium`}>{locationValue}</span>
        </div>
      )}
      {updatedAt && (
        <span className="text-xs text-[#666] ml-1">Updated {getTimeAgo(updatedAt)}</span>
      )}
    </div>
  );
}
