import { useState, useEffect } from 'react';
import { X, Zap, Music, Headphones, Home, Users, Sparkles, MapPin, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface LibreTonightSheetProps {
  onClose: () => void;
  onUpdate?: () => void;
}

const OUTING_OPTIONS = [
  { value: 'bar_dansant', label: 'Bar Dansant', icon: Music },
  { value: 'soiree_techno', label: 'Soirée Techno', icon: Headphones },
  { value: 'soiree_privee_after', label: 'Soirée Privée / After', icon: Home },
  { value: 'training_danse', label: 'Training Danse (104 / Spots)', icon: Users },
  { value: 'decouverte_spot', label: 'Découverte / New Spot', icon: Sparkles }
];

export default function LibreTonightSheet({ onClose, onUpdate }: LibreTonightSheetProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [freeTonight, setFreeTonight] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [useGPS, setUseGPS] = useState(true);
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadCurrentSettings();
  }, [user]);

  const loadCurrentSettings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('free_tonight, ltn_preferences, ltn_location')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFreeTonight(data.free_tonight || false);
        setSelectedPreferences(Array.isArray(data.ltn_preferences) ? data.ltn_preferences : []);

        if (data.ltn_location) {
          setUseGPS(data.ltn_location.use_gps !== false);
          setCity(data.ltn_location.city || '');
          setArea(data.ltn_location.area || '');
          setAddress(data.ltn_location.address || '');
        }
      }
    } catch (error) {
      console.error('Error loading LTN settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (value: string) => {
    setSelectedPreferences(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let locationText = '';
      let ltnLocation = {
        use_gps: useGPS,
        city: city.trim(),
        area: area.trim(),
        address: address.trim()
      };

      if (useGPS) {
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            ltnLocation = {
              ...ltnLocation,
              city: 'Position GPS',
              lat: position.coords.latitude,
              lng: position.coords.longitude
            } as any;
            locationText = 'Ma position actuelle';
          } catch (geoError) {
            console.log('Geolocation error:', geoError);
            locationText = 'Localisation GPS activée';
          }
        } else {
          locationText = 'Localisation GPS activée';
        }
      } else {
        const parts = [city.trim(), area.trim()].filter(Boolean);
        locationText = parts.length > 0 ? parts.join(', ') : '';
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          free_tonight: freeTonight,
          ltn_preferences: selectedPreferences,
          ltn_location: ltnLocation,
          out_now: freeTonight,
          out_location: locationText || null
        })
        .eq('id', user.id);

      if (error) throw error;

      if (onUpdate) {
        onUpdate();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error saving LTN settings:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#0a0a0a] border border-[#222] rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white">Libre Tonight</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-[#111] hover:bg-[#222] rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-white font-bold mb-3">Statut</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFreeTonight(true)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      freeTonight
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <Zap className={`w-6 h-6 mx-auto mb-2 ${freeTonight ? 'text-purple-400' : 'text-[#666]'}`} />
                    <div className={`text-sm font-bold ${freeTonight ? 'text-white' : 'text-[#666]'}`}>
                      Je suis libre ce soir
                    </div>
                  </button>
                  <button
                    onClick={() => setFreeTonight(false)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !freeTonight
                        ? 'border-[#555] bg-[#222]'
                        : 'border-[#333] bg-[#111] hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className={`w-6 h-6 mx-auto mb-2 border-2 rounded-full ${!freeTonight ? 'border-[#666]' : 'border-[#444]'}`} />
                    <div className={`text-sm font-bold ${!freeTonight ? 'text-white' : 'text-[#666]'}`}>
                      Pas dispo ce soir
                    </div>
                  </button>
                </div>
              </div>

              {freeTonight && (
                <>
                  <div>
                    <h3 className="text-white font-bold mb-3">Je cherche...</h3>
                    <div className="flex flex-wrap gap-2">
                      {OUTING_OPTIONS.map((option) => {
                        const Icon = option.icon;
                        const isSelected = selectedPreferences.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => togglePreference(option.value)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                : 'border-[#333] bg-[#111] text-[#888] hover:bg-[#1a1a1a] hover:text-white'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-400' : ''}`} />
                            <span className="text-sm font-semibold">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      Lieu
                    </h3>

                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 bg-[#111] rounded-xl border border-[#333] cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                        <input
                          type="checkbox"
                          checked={useGPS}
                          onChange={(e) => setUseGPS(e.target.checked)}
                          className="w-5 h-5 rounded border-[#333] bg-[#222] checked:bg-purple-500 checked:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
                        />
                        <span className="text-white font-semibold">Utiliser ma position actuelle</span>
                      </label>

                      {!useGPS && (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Ville (ex: Paris)"
                            className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="Arrondissement / quartier"
                            className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Adresse (optionnel)"
                            className="w-full bg-[#111] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-[#222] flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-[#111] hover:bg-[#222] text-white rounded-xl font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {freeTonight ? 'Activer LTN' : 'Désactiver LTN'}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
