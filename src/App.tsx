import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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
import ProfilePage from './pages/ProfilePage';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_image: string | null;
  audio_url: string;
  duration: number;
}

function AppContent() {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [pageData, setPageData] = useState<any>(null);
  const navigate = useNavigate();

  const handleNavigate = (page: string, data?: any) => {
    if (data && page === 'news') {
      setPageData(data);
      navigate('/article');
    } else {
      setPageData(data);
      navigate(`/${page === 'home' ? '' : page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handlePlayTrack = (track: Track, trackPlaylist: Track[]) => {
    setCurrentTrack(track);
    setPlaylist(trackPlaylist);
  };

  const handleTrackChange = (track: Track) => {
    setCurrentTrack(track);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation onNavigate={handleNavigate} />
      <Routes>
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />
        <Route path="/login" element={<LoginPage onNavigate={handleNavigate} />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/events" element={<EventsPage onNavigate={handleNavigate} />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/article" element={pageData ? <ArticlePage article={pageData} onNavigate={handleNavigate} onBack={handleBack} /> : <HomePage onNavigate={handleNavigate} />} />
        <Route path="/community" element={<CommunityPage onNavigate={handleNavigate} />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>

      {currentTrack && (
        <MusicPlayer
          currentTrack={currentTrack}
          playlist={playlist}
          onTrackChange={handleTrackChange}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
