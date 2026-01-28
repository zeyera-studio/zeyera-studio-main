
import React, { useState } from 'react';
import { Search, User, Menu, X, LogOut, LayoutDashboard, Settings, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

interface NavbarProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  onNavigate: (page: 'home' | 'movies' | 'tv' | 'admin' | 'myPurchases') => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, isSearching, onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth State
  const { user, profile, signOut, isAdmin } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleNav = (page: 'home' | 'movies' | 'tv' | 'admin' | 'myPurchases') => {
    onNavigate(page);
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const openAuth = (view: 'signin' | 'signup') => {
    setAuthView(view);
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    onNavigate('home');
  };

  const getLinkClass = (page: string) => {
    return currentPage === page
      ? "text-neon-green px-3 py-2 rounded-md text-sm font-medium transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:bg-neon-green after:shadow-[0_0_10px_#39ff14]"
      : "text-gray-300 hover:text-neon-green px-3 py-2 rounded-md text-sm font-medium transition-colors";
  };

  if (currentPage === 'admin') {
      return null; // Don't show main navbar on admin dashboard usually, or show a simplified one. AdminDashboard has its own sidebar.
  }

  return (
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer"
            onClick={() => handleNav('home')}
          >
            <div className="w-10 h-10 rounded-full border-2 border-neon-green flex items-center justify-center shadow-[0_0_10px_rgba(57,255,20,0.5)]">
              <span className="text-neon-green font-bold text-xl">Z</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wider hidden sm:block">Zeyera <span className="font-light text-gray-400">Studio</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => handleNav('home')} className={getLinkClass('home')}>Home</button>
              <button onClick={() => handleNav('movies')} className={getLinkClass('movies')}>Movies</button>
              <button onClick={() => handleNav('tv')} className={getLinkClass('tv')}>TV Series</button>
            </div>
          </div>

          {/* Search & Auth */}
          <div className="hidden md:flex items-center gap-4">
            {currentPage === 'home' && (
              <form onSubmit={handleSearchSubmit} className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className={`h-4 w-4 ${isSearching ? 'text-neon-green animate-pulse' : 'text-gray-400'}`} />
                </div>
                <input
                  type="text"
                  placeholder={isSearching ? "AI is thinking..." : "Ask AI for movies..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSearching}
                  className="bg-white/10 text-white text-sm rounded-full block w-64 pl-10 p-2.5 focus:ring-2 focus:ring-neon-green focus:outline-none transition-all border border-transparent hover:border-white/20"
                />
              </form>
            )}
            
            {user ? (
                <div className="relative">
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 text-white hover:text-neon-green transition-colors"
                    >
                        <span className="text-sm font-medium hidden lg:block">{profile?.username || user.email?.split('@')[0]}</span>
                        <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center border border-gray-600 ring-2 ring-transparent hover:ring-neon-green transition-all">
                             <User className="h-5 w-5 text-gray-300" />
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50">
                            <div className="px-4 py-3 border-b border-white/5">
                                <p className="text-sm text-white font-bold">{profile?.username || 'User'}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            
                            <button 
                                onClick={() => handleNav('myPurchases')}
                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                            >
                                <ShoppingBag size={14} /> My Purchases
                            </button>

                            {isAdmin && (
                                <button 
                                    onClick={() => handleNav('admin')}
                                    className="w-full text-left px-4 py-2 text-sm text-neon-green hover:bg-white/5 flex items-center gap-2"
                                >
                                    <LayoutDashboard size={14} /> Admin Dashboard
                                </button>
                            )}
                            
                            <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2">
                                <Settings size={14} /> Settings
                            </button>
                            
                            <button 
                                onClick={handleSignOut}
                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2 border-t border-white/5"
                            >
                                <LogOut size={14} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <button 
                        onClick={() => openAuth('signup')}
                        className="bg-neon-green text-black hover:bg-[#2eb812] px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:shadow-[0_0_20px_rgba(57,255,20,0.6)]"
                    >
                        Sign Up
                    </button>
                    <button 
                        onClick={() => openAuth('signin')}
                        className="text-white hover:text-neon-green font-medium text-sm"
                    >
                        Sign in
                    </button>
                </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-900 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNav('home')} className="text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10">Home</button>
            <button onClick={() => handleNav('movies')} className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10">Movies</button>
            <button onClick={() => handleNav('tv')} className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10">TV Series</button>
            
            {user && (
                <button onClick={() => handleNav('myPurchases')} className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10">My Purchases</button>
            )}

            {isAdmin && (
                <button onClick={() => handleNav('admin')} className="text-neon-green block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10">Admin Dashboard</button>
            )}

            {!user ? (
                <div className="pt-4 border-t border-white/10 mt-2">
                    <button onClick={() => { openAuth('signup'); setIsOpen(false); }} className="w-full text-center bg-neon-green text-black font-bold py-2 rounded-md mb-2">Sign Up</button>
                    <button onClick={() => { openAuth('signin'); setIsOpen(false); }} className="w-full text-center text-white font-medium py-2">Sign In</button>
                </div>
            ) : (
                <div className="pt-4 border-t border-white/10 mt-2">
                     <p className="px-3 text-sm text-gray-500 mb-2">Logged in as {profile?.username || 'User'}</p>
                     <button onClick={handleSignOut} className="w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-md">Sign Out</button>
                </div>
            )}
          </div>
        </div>
      )}
    </nav>
    <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} initialView={authView} />
    </>
  );
};

export default Navbar;
