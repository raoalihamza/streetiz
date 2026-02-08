import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Search, Bell, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Navigation({ currentPage: propCurrentPage, onNavigate: propOnNavigate }: NavigationProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPage = propCurrentPage || location.pathname.split('/')[1] || 'home';

  const handleNavigate = (page: string) => {
    if (propOnNavigate) {
      propOnNavigate(page);
    } else {
      navigate(`/${page === 'home' ? '' : page}`);
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (currentPage === 'community' && user && profile?.username) {
      navigate(`/profile/${profile.username}`);
    } else {
      handleNavigate('home');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={handleLogoClick}
            className="flex items-center group"
          >
            <span className="text-2xl font-black tracking-wider">
              <span className="text-white">STREET</span>
              <span className="text-streetiz-red glow-red">IZ</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => handleNavigate('news')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'news'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              News
            </button>

            <button
              onClick={() => handleNavigate('videos')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'videos'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              Videos
            </button>

            <button
              onClick={() => handleNavigate('music')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'music'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              Music
            </button>

            <button
              onClick={() => handleNavigate('events')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'events'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              Events
            </button>

            <button
              onClick={() => handleNavigate('community')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'community'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              Community
            </button>

            <button
              onClick={() => handleNavigate('contact')}
              className={`text-sm font-semibold transition-colors py-2 ${
                currentPage === 'contact'
                  ? 'text-streetiz-red'
                  : 'text-white hover:text-streetiz-red'
              }`}
            >
              Contact
            </button>
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={() => handleNavigate('community')}
              className="bg-[#E10600] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:scale-105 hover:shadow-lg hover:shadow-[#E10600]/30 transition-all duration-200"
            >
              + Publish
            </button>
            <button
              onClick={() => handleNavigate('community')}
              className="p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            {user && (
              <button
                onClick={() => handleNavigate('dashboard')}
                className="p-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-streetiz-red rounded-full"></span>
              </button>
            )}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="w-8 h-8 bg-streetiz-red rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">{profile?.username}</span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-xl z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          handleNavigate('dashboard');
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#222] transition-colors flex items-center space-x-3 text-white"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm font-semibold">Dashboard</span>
                      </button>
                      <div className="border-t border-[#333]" />
                      <button
                        onClick={() => {
                          signOut();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-[#222] transition-colors flex items-center space-x-3 text-streetiz-red"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-semibold">Se déconnecter</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigate('login')}
                className="bg-streetiz-red text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#FF1808] transition-colors"
              >
                Connexion
              </button>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#222222] bg-[#0a0a0a]/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-6 space-y-2">
            <button
              onClick={() => handleNavigate('community')}
              className="bg-[#E10600] text-white px-5 py-3 rounded-lg font-bold text-sm w-full hover:bg-[#FF1808] transition-colors mb-4"
            >
              + Publish
            </button>

            <button
              onClick={() => handleNavigate('news')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'news'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              News
            </button>
            <button
              onClick={() => handleNavigate('videos')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'videos'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => handleNavigate('music')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'music'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Music
            </button>
            <button
              onClick={() => handleNavigate('events')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'events'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => handleNavigate('community')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'community'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Community
            </button>
            <button
              onClick={() => handleNavigate('contact')}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                currentPage === 'contact'
                  ? 'bg-streetiz-red text-white'
                  : 'text-white hover:bg-[#1a1a1a]'
              }`}
            >
              Contact
            </button>

            <div className="pt-4 border-t border-[#222222] mt-4">
              {user ? (
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="w-8 h-8 bg-streetiz-red rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm">{profile?.username}</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate('login')}
                  className="bg-streetiz-red text-white px-6 py-3 rounded-xl font-semibold text-sm w-full hover:bg-[#FF1808] transition-colors"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
