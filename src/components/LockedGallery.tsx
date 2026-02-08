import { Lock, Clock, CheckCircle } from 'lucide-react';

interface LockedGalleryProps {
  ownerUsername: string;
  onRequestAccess: (duration: '5m' | '1h' | 'always') => void;
  isPending?: boolean;
}

export default function LockedGallery({ ownerUsername, onRequestAccess, isPending }: LockedGalleryProps) {
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-orange-400" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Demande en attente</h3>
          <p className="text-[#888] text-sm mb-6">
            Votre demande d'accès à la galerie de {ownerUsername} est en attente de validation.
          </p>
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
            <p className="text-orange-400 text-sm">
              Vous serez notifié dès que {ownerUsername} répondra à votre demande.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-streetiz-red/10 border-2 border-streetiz-red/20 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-streetiz-red" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Galerie verrouillée</h3>
        <p className="text-[#888] text-sm mb-6">
          La galerie de {ownerUsername} est privée. Demandez un accès temporaire pour voir les photos et vidéos.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onRequestAccess('5m')}
            className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Demander accès (5 minutes)</span>
            </div>
          </button>

          <button
            onClick={() => onRequestAccess('1h')}
            className="w-full bg-[#111] hover:bg-[#1a1a1a] border border-[#222] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Demander accès (1 heure)</span>
            </div>
          </button>

          <button
            onClick={() => onRequestAccess('always')}
            className="w-full bg-streetiz-red hover:bg-streetiz-red/80 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Demander accès permanent</span>
            </div>
          </button>
        </div>

        <div className="mt-6 bg-[#111] border border-[#222] rounded-xl p-4">
          <p className="text-[#666] text-xs">
            L'utilisateur sera notifié de votre demande et pourra l'accepter ou la refuser.
          </p>
        </div>
      </div>
    </div>
  );
}