import { useState, useEffect } from 'react';
import { Zap, MapPin, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LibreTonightButtonProps {
  userId: string;
  isOwnProfile: boolean;
  availableTonight?: boolean;
  tonightLocationType?: string;
  tonightLocationValue?: string;
  availableTonightUpdatedAt?: string;
  onUpdate?: () => void;
}

const CLUBS = [
  'Rex Club',
  'La Bellevilloise',
  'Mazette',
  'Warehouse Paris',
  'Glazart',
  'NF-34',
  'Djoon',
  'Sacré',
  'Flow Paris'
];

export default function LibreTonightButton({
  userId,
  isOwnProfile,
  availableTonight = false,
  tonightLocationType = '',
  tonightLocationValue = '',
  availableTonightUpdatedAt,
  onUpdate
}: LibreTonightButtonProps) {
  const [isActive, setIsActive] = useState(availableTonight);
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [locationType, setLocationType] = useState<'club' | 'manual'>(tonightLocationType as 'club' | 'manual' || 'club');
  const [locationValue, setLocationValue] = useState(tonightLocationValue || '');
  const [selectedClub, setSelectedClub] = useState(tonightLocationType === 'club' ? tonightLocationValue : '');
  const [manualLocation, setManualLocation] = useState(tonightLocationType === 'manual' ? tonightLocationValue : '');

  useEffect(() => {
    setIsActive(availableTonight);
    setLocationType(tonightLocationType as 'club' | 'manual' || 'club');
    setLocationValue(tonightLocationValue || '');
    if (tonightLocationType === 'club') {
      setSelectedClub(tonightLocationValue || '');
    } else if (tonightLocationType === 'manual') {
      setManualLocation(tonightLocationValue || '');
    }
  }, [availableTonight, tonightLocationType, tonightLocationValue]);

  const handleToggleLTN = async () => {
    if (!isOwnProfile) return;

    const newValue = !isActive;

    if (newValue) {
      setShowLocationPanel(true);
      setIsActive(true);
    } else {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            available_tonight: false,
            tonight_location_type: '',
            tonight_location_value: '',
            available_tonight_updated_at: null
          })
          .eq('id', userId);

        if (error) throw error;

        setIsActive(false);
        setShowLocationPanel(false);
        setSelectedClub('');
        setManualLocation('');
        setLocationValue('');
        onUpdate?.();
      } catch (error) {
        console.error('Error updating LTN:', error);
      }
    }
  };

  const handleSaveLocation = async () => {
    if (!isOwnProfile) return;

    const finalLocationType = locationType;
    const finalLocationValue = locationType === 'club' ? selectedClub : manualLocation;

    if (!finalLocationValue.trim()) {
      alert('Please select a club or enter a location');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          available_tonight: true,
          tonight_location_type: finalLocationType,
          tonight_location_value: finalLocationValue,
          available_tonight_updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setLocationValue(finalLocationValue);
      setShowLocationPanel(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

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

  if (!isOwnProfile && !isActive) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleLTN}
        disabled={!isOwnProfile}
        className={`group relative px-4 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
          isActive
            ? 'bg-streetiz-red text-white shadow-lg shadow-streetiz-red/30 hover:shadow-streetiz-red/50'
            : 'bg-[#181818] text-white border border-[#333] hover:border-streetiz-red/50 hover:bg-[#222]'
        } ${!isOwnProfile ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <Zap className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
        <span>LTN</span>
        {isActive && <span className="text-xs opacity-80">• Active</span>}

        {isActive && isOwnProfile && (
          <div className="absolute inset-0 rounded-full bg-streetiz-red opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
        )}
      </button>

      {isActive && locationValue && (
        <div className="absolute top-full left-0 right-0 mt-3 px-4 py-3 bg-[#111] border border-streetiz-red/30 rounded-xl shadow-lg z-10 min-w-[280px]">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-4 h-4 text-streetiz-red flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{locationValue}</p>
              {availableTonightUpdatedAt && (
                <p className="text-[#666] text-xs mt-0.5">{getTimeAgo(availableTonightUpdatedAt)}</p>
              )}
            </div>
          </div>
          {!isOwnProfile && (
            <p className="text-xs text-[#888] mt-2">Available for tonight</p>
          )}
        </div>
      )}

      {showLocationPanel && isOwnProfile && (
        <div className="absolute top-full right-0 mt-3 w-[360px] bg-[#111] border border-[#333] rounded-2xl shadow-2xl z-20 p-6">
          <div className="mb-4">
            <h4 className="text-white font-bold text-lg mb-1">Where are you going tonight?</h4>
            <p className="text-[#666] text-sm">Let people know where to find you</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white text-sm font-semibold mb-2 block">Select a club</label>
              <div className="relative">
                <select
                  value={selectedClub}
                  onChange={(e) => {
                    setSelectedClub(e.target.value);
                    setLocationType('club');
                    setManualLocation('');
                  }}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-streetiz-red transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Choose a club...</option>
                  {CLUBS.map((club) => (
                    <option key={club} value={club}>{club}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-[#666]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#333]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#111] text-[#666]">OR</span>
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-semibold mb-2 block">Enter an exact place</label>
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => {
                  setManualLocation(e.target.value);
                  setLocationType('manual');
                  setSelectedClub('');
                }}
                placeholder="12 Rue Oberkampf / Mazette terrace / Canal Saint-Martin"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-xl px-4 py-3 text-white text-sm placeholder-[#666] focus:outline-none focus:border-streetiz-red transition-colors"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowLocationPanel(false);
                  if (!locationValue) {
                    setIsActive(false);
                  }
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#222] hover:bg-[#333] text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLocation}
                className="flex-1 px-4 py-2.5 rounded-xl bg-streetiz-red hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>

          {isActive && locationValue && (
            <div className="mt-4 pt-4 border-t border-[#333]">
              <p className="text-green-400 text-xs font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                You are available for tonight
              </p>
              <p className="text-[#888] text-xs mt-1">People can message you to join.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
