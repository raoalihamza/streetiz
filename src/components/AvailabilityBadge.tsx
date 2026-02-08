import { PartyPopper, Clock, MapPin } from 'lucide-react';

interface AvailabilityBadgeProps {
  freeTonight?: boolean;
  outNow?: boolean;
  outLocation?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvailabilityBadge({
  freeTonight = false,
  outNow = false,
  outLocation = '',
  size = 'sm'
}: AvailabilityBadgeProps) {
  if (!freeTonight && !outNow) return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex flex-wrap gap-2">
      {freeTonight && (
        <div className={`inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full font-bold ${sizeClasses[size]}`}>
          <PartyPopper className={iconSizes[size]} />
          <span>Libre Tonight</span>
        </div>
      )}

      {outNow && (
        <div className={`inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full font-bold ${sizeClasses[size]}`}>
          <Clock className={iconSizes[size]} />
          <span>En soirée</span>
          {outLocation && (
            <span className="flex items-center gap-0.5 text-orange-300">
              <MapPin className={`${iconSizes[size]} opacity-70`} />
              {outLocation}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
