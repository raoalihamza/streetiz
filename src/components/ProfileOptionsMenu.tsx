import { useState, useRef, useEffect } from 'react';
import { MoreVertical, UserPlus, Share2, Lock, Folder, Ban, Flag, X } from 'lucide-react';

interface ProfileOptionsMenuProps {
  targetUserId: string;
  targetUsername: string;
  isBlocked?: boolean;
  onAddContact: () => void;
  onShareProfile: () => void;
  onSendPrivateAlbum: () => void;
  onSendPortfolio: () => void;
  onBlock: () => void;
  onReport: () => void;
}

export default function ProfileOptionsMenu({
  targetUserId,
  targetUsername,
  isBlocked = false,
  onAddContact,
  onShareProfile,
  onSendPrivateAlbum,
  onSendPortfolio,
  onBlock,
  onReport
}: ProfileOptionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-[#111] hover:bg-[#222] border border-[#333] rounded-full flex items-center justify-center transition-colors"
        title="Options"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <MoreVertical className="w-5 h-5 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#111] border border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleAction(onAddContact)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-streetiz-red/20 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-streetiz-red" />
              </div>
              <span className="text-white font-semibold">Ajouter à mes contacts</span>
            </button>

            <button
              onClick={() => handleAction(onShareProfile)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Share2 className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-white font-semibold">Partager ce profil</span>
            </button>

            <div className="h-px bg-[#333] my-2" />

            <button
              onClick={() => handleAction(onSendPrivateAlbum)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Lock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Envoyer un album privé</div>
                <div className="text-xs text-[#666]">Accès limité dans le temps</div>
              </div>
            </button>

            <button
              onClick={() => handleAction(onSendPortfolio)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Folder className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Envoyer un portfolio</div>
                <div className="text-xs text-[#666]">EPK, casting, dossier</div>
              </div>
            </button>

            <div className="h-px bg-[#333] my-2" />

            <button
              onClick={() => handleAction(onBlock)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Ban className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-white font-semibold">
                {isBlocked ? 'Débloquer ce profil' : 'Bloquer ce profil'}
              </span>
            </button>

            <button
              onClick={() => handleAction(onReport)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#222] rounded-xl transition-colors text-left"
            >
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Flag className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-white font-semibold">Signaler ce profil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
