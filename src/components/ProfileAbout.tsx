import { MapPin, Users, Calendar, Instagram, Youtube, Music as MusicIcon, Globe, Hash } from 'lucide-react';

interface ProfileAboutProps {
  profile: any;
}

export default function ProfileAbout({ profile }: ProfileAboutProps) {
  const skills = Array.isArray(profile.skills) ? profile.skills : [];
  const socialLinks = profile.social_links || {};
  const memberSince = profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long'
  }) : null;

  return (
    <div className="space-y-6">
      {profile.bio && (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-3">Bio</h3>
          <p className="text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Informations</h3>
        <div className="space-y-3">
          {(profile.city || profile.country) && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-streetiz-red" />
              </div>
              <div>
                <div className="text-xs text-[#666]">Localisation</div>
                <div className="text-white font-semibold">
                  {profile.city}
                  {profile.country ? `, ${profile.country}` : ''}
                </div>
              </div>
            </div>
          )}

          {profile.team_collective && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                <Users className="w-5 h-5 text-streetiz-red" />
              </div>
              <div>
                <div className="text-xs text-[#666]">Crew / Collectif</div>
                <div className="text-white font-semibold">{profile.team_collective}</div>
              </div>
            </div>
          )}

          {memberSince && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-streetiz-red" />
              </div>
              <div>
                <div className="text-xs text-[#666]">Membre depuis</div>
                <div className="text-white font-semibold">{memberSince}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {Object.keys(socialLinks).length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4">Liens</h3>
          <div className="grid grid-cols-2 gap-3">
            {socialLinks.instagram && (
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl p-4 transition-colors"
              >
                <Instagram className="w-5 h-5 text-pink-500" />
                <span className="text-white font-semibold text-sm">Instagram</span>
              </a>
            )}
            {socialLinks.youtube && (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl p-4 transition-colors"
              >
                <Youtube className="w-5 h-5 text-red-500" />
                <span className="text-white font-semibold text-sm">YouTube</span>
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl p-4 transition-colors"
              >
                <MusicIcon className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-sm">TikTok</span>
              </a>
            )}
            {socialLinks.soundcloud && (
              <a
                href={socialLinks.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl p-4 transition-colors"
              >
                <MusicIcon className="w-5 h-5 text-orange-500" />
                <span className="text-white font-semibold text-sm">SoundCloud</span>
              </a>
            )}
            {socialLinks.website && (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] rounded-xl p-4 transition-colors"
              >
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-white font-semibold text-sm">Website</span>
              </a>
            )}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Hash className="w-5 h-5 text-streetiz-red" />
            Compétences
          </h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-gradient-to-r from-streetiz-red to-purple-600 px-4 py-2 rounded-xl text-sm font-bold text-white"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4">Statistiques</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[#1a1a1a] rounded-xl">
            <div className="text-3xl font-black text-white mb-1">{profile.followers_count || 0}</div>
            <div className="text-xs text-[#666]">Followers</div>
          </div>
          <div className="text-center p-4 bg-[#1a1a1a] rounded-xl">
            <div className="text-3xl font-black text-white mb-1">{profile.following_count || 0}</div>
            <div className="text-xs text-[#666]">Following</div>
          </div>
        </div>
      </div>
    </div>
  );
}