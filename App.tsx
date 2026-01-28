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

const AppContent: React.FC = () => {
  const [content, setContent] = useState<ContentItem[]>(MOCK_DATA);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'cancelled' | 'error'>('success');
  const [paymentOrderId, setPaymentOrderId] = useState<string>('');

  // Check for payment return from PayHere
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    const orderId = urlParams.get('order_id');

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
      
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
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
    }
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