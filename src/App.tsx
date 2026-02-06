import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import MusicPlayer from './components/MusicPlayer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import VideosPage from './pages/VideosPage';
import MusicPage from './pages/MusicPage';
import EventsPage from './pages/EventsPage';
import NewsPage from './pages/NewsPage';
import CommunityPage from './pages/CommunityPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import ContactPage from './pages/ContactPage';
import ArticlePage from './pages/ArticlePage';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_image: string | null;
  audio_url: string;
  duration: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{page: string, data?: any}>>([]);

  const handleNavigate = (page: string, data?: any) => {
    if (data && page === 'news') {
      setNavigationHistory([...navigationHistory, { page: currentPage, data: pageData }]);
      setCurrentPage('article');
      setPageData(data);
    } else {
      setCurrentPage(page);
      setPageData(data);
      setNavigationHistory([]);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setCurrentPage(previous.page);
      setPageData(previous.data);
      setNavigationHistory(navigationHistory.slice(0, -1));
    } else {
      setCurrentPage('home');
      setPageData(null);
    }
  };

  const handlePlayTrack = (track: Track, trackPlaylist: Track[]) => {
    setCurrentTrack(track);
    setPlaylist(trackPlaylist);
  };

  const handleTrackChange = (track: Track) => {
    setCurrentTrack(track);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'map':
        return <MapPage />;
      case 'videos':
        return <VideosPage />;
      case 'music':
        return <MusicPage />;
      case 'events':
        return <EventsPage onNavigate={handleNavigate} />;
      case 'news':
        return <NewsPage />;
      case 'article':
        return pageData ? <ArticlePage article={pageData} onNavigate={handleNavigate} onBack={handleBack} /> : <HomePage onNavigate={handleNavigate} />;
      case 'community':
        return <CommunityPage onNavigate={handleNavigate} />;
      case 'contact':
        return <ContactPage />;
      case 'dashboard':
        return <DashboardPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />

        <main className="pt-20">
          {renderPage()}
        </main>

        {currentTrack && (
          <MusicPlayer
            currentTrack={currentTrack}
            playlist={playlist}
            onTrackChange={handleTrackChange}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;
