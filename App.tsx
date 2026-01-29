import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import SplitShowcase from './components/SplitShowcase';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import MoviesPage from './components/MoviesPage';
import TVSeriesPage from './components/TVSeriesPage';
import MovieDetailPage from './components/MovieDetailPage';
import TVSeriesDetailPage from './components/TVSeriesDetailPage';
import AdminDashboard from './components/AdminDashboard';
import MyPurchasesPage from './components/MyPurchasesPage';
import PaymentResultPage from './components/PaymentResultPage';
import { AuthProvider } from './contexts/AuthContext';
import { ContentItem } from './types';
import { getAIRecommendations } from './services/geminiService';

const MOCK_DATA: ContentItem[] = [
  { id: '1', title: 'The Midnight Rider', description: 'Action', category: 'Movie', imageUrl: 'https://picsum.photos/seed/rider/300/450', year: '2023' },
  { id: '2', title: 'Neon City Chronicles', description: 'Sci-Fi', category: 'Movie', imageUrl: 'https://picsum.photos/seed/neon/300/450', year: '2024' },
  { id: '3', title: 'Last Stand', description: 'Drama', category: 'Movie', imageUrl: 'https://picsum.photos/seed/stand/300/450', year: '2022' },
  { id: '4', title: 'Adventure Time', description: 'Adventure', category: 'Movie', imageUrl: 'https://picsum.photos/seed/adv/300/450', year: '2023' },
  { id: '5', title: 'Quantum Rift', description: 'Sci-Fi', category: 'TV Series', imageUrl: 'https://picsum.photos/seed/quant/300/450', year: '2024' },
  { id: '6', title: 'Desert Wind', description: 'Western', category: 'TV Series', imageUrl: 'https://picsum.photos/seed/des/300/450', year: '2021' },
  { id: '7', title: 'Whispering Woods', description: 'Horror', category: 'TV Series', imageUrl: 'https://picsum.photos/seed/wood/300/450', year: '2023' },
  { id: '8', title: 'Fallen Kingdom', description: 'Fantasy', category: 'TV Series', imageUrl: 'https://picsum.photos/seed/fall/300/450', year: '2022' },
  { id: '9', title: 'Cyber Soul', description: 'Sci-Fi', category: 'Movie', imageUrl: 'https://picsum.photos/seed/cyber/300/450', year: '2025' },
  { id: '10', title: 'Lost Signal', description: 'Thriller', category: 'TV Series', imageUrl: 'https://picsum.photos/seed/lost/300/450', year: '2024' }
];

type PageType = 'home' | 'movies' | 'tv' | 'admin' | 'movieDetail' | 'tvDetail' | 'myPurchases' | 'paymentResult';

// URL path mapping
const PAGE_PATHS: Record<PageType, string> = {
  home: '/',
  movies: '/movies',
  tv: '/tv-series',
  admin: '/admin',
  movieDetail: '/movie',
  tvDetail: '/tv-series',
  myPurchases: '/my-purchases',
  paymentResult: '/payment',
};

// Parse URL to get page and content ID
const parseURL = (): { page: PageType; contentId: string | null } => {
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('id');
  
  if (path.startsWith('/movie') && contentId) {
    return { page: 'movieDetail', contentId };
  }
  if (path.startsWith('/tv-series') && contentId) {
    return { page: 'tvDetail', contentId };
  }
  if (path === '/movies') return { page: 'movies', contentId: null };
  if (path === '/tv-series') return { page: 'tv', contentId: null };
  if (path === '/admin') return { page: 'admin', contentId: null };
  if (path === '/my-purchases') return { page: 'myPurchases', contentId: null };
  
  return { page: 'home', contentId: null };
};

const AppContent: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>(MOCK_DATA);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'error'>('success');
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');

  // Initialize from URL on first load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderId = urlParams.get('order_id');

    // Check for payment return from PayHere
    if (payment && orderId) {
      setPaymentOrderId(orderId);
      if (payment === 'success') {
        setPaymentStatus('success');
      } else if (payment === 'cancelled') {
        setPaymentStatus('cancelled');
      } else {
        setPaymentStatus('error');
      }
      setCurrentPage('paymentResult');
      // Clean up URL but keep in history
      window.history.replaceState({ page: 'paymentResult' }, '', '/payment');
      return;
    }

    // Parse URL for initial page
    const { page, contentId } = parseURL();
    setCurrentPage(page);
    setSelectedContentId(contentId);
    
    // Replace current history entry with state
    window.history.replaceState({ page, contentId }, '', window.location.pathname + window.location.search);
  }, []);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        const { page, contentId } = event.state;
        setCurrentPage(page || 'home');
        setSelectedContentId(contentId || null);
      } else {
        // No state - parse from URL
        const { page, contentId } = parseURL();
        setCurrentPage(page);
        setSelectedContentId(contentId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    // If the API key isn't set, this will likely fail silently and return empty array or log error.
    try {
      const recommendations = await getAIRecommendations(query);
      if (recommendations.length > 0) {
        setContent(recommendations);
        // Ensure we are on home to see results in the showcase
        if (currentPage !== 'home') setCurrentPage('home');
      } else {
        console.warn("No recommendations returned from AI");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigate = (page: PageType, contentId?: string) => {
    setCurrentPage(page);
    if (contentId) {
      setSelectedContentId(contentId);
    } else if (page !== 'movieDetail' && page !== 'tvDetail') {
      setSelectedContentId(null);
    }
    
    // Build URL for the new page
    let url = PAGE_PATHS[page] || '/';
    if (contentId && (page === 'movieDetail' || page === 'tvDetail')) {
      url = `${page === 'movieDetail' ? '/movie' : '/tv-series'}?id=${contentId}`;
    }
    
    // Push to browser history
    window.history.pushState({ page, contentId: contentId || null }, '', url);
    
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-green selection:text-black">
      <Navbar 
        onSearch={handleSearch} 
        isSearching={isSearching} 
        onNavigate={(page) => handleNavigate(page)} 
        currentPage={currentPage}
      />
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero />
            
            {/* Visual separation for the split section */}
            <div className="relative">
              <SplitShowcase items={content} />
            </div>

            {/* Contact Section */}
            <ContactSection />
          </>
        )}

        {currentPage === 'movies' && (
          <MoviesPage onSelectMovie={(id) => handleNavigate('movieDetail', id)} />
        )}
        
        {currentPage === 'tv' && (
           <TVSeriesPage onSelectSeries={(id) => handleNavigate('tvDetail', id)} />
        )}

        {currentPage === 'movieDetail' && selectedContentId && (
          <MovieDetailPage 
            movieId={selectedContentId} 
            onBack={() => handleNavigate('movies')} 
          />
        )}

        {currentPage === 'tvDetail' && selectedContentId && (
          <TVSeriesDetailPage 
            seriesId={selectedContentId} 
            onBack={() => handleNavigate('tv')} 
          />
        )}

        {currentPage === 'admin' && (
           <AdminDashboard />
        )}

        {currentPage === 'myPurchases' && (
          <MyPurchasesPage onNavigate={(page, contentId) => handleNavigate(page as PageType, contentId)} />
        )}

        {currentPage === 'paymentResult' && paymentOrderId && (
          <PaymentResultPage 
            status={paymentStatus}
            orderId={paymentOrderId}
            onNavigate={(page, contentId) => handleNavigate(page as PageType, contentId)}
          />
        )}
      </main>

      {currentPage !== 'admin' && currentPage !== 'movieDetail' && currentPage !== 'tvDetail' && currentPage !== 'paymentResult' && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;