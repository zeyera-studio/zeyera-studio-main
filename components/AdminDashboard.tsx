
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Users, Film, Activity, Settings, Search, UserPlus, Shield, Trash2, LogOut, Upload, Eye, Edit, CheckCircle, XCircle, Archive, Tv, List } from 'lucide-react';
import { UserProfile, Content, ContentStats } from '../types';
import UploadContentModal from './UploadContentModal';
import EpisodeManagement from './EpisodeManagement';
import { fetchContent, publishContent, unpublishContent, deleteContent, getContentStats } from '../lib/contentService';
import { getEpisodeCount } from '../lib/episodeService';

const AdminDashboard: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'movies' | 'tvseries'>('overview');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  
  // New Admin Form State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [adminCreationMsg, setAdminCreationMsg] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Content Management State
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [movies, setMovies] = useState<Content[]>([]);
  const [tvSeries, setTVSeries] = useState<Content[]>([]);
  const [episodeCounts, setEpisodeCounts] = useState<Record<string, number>>({});
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<Content | null>(null);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'movies') {
      loadMovies();
    } else if (activeTab === 'tvseries') {
      loadTVSeries();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    // In a real app with RLS, this only works if the current user is admin
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (data) {
      setUsersList(data as UserProfile[]);
    }
    setLoading(false);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminCreationMsg(null);
    
    // NOTE: In a client-only app, you cannot use 'admin' API methods like inviteUserByEmail without a service key.
    // Also, using 'signUp' here would log the current admin out.
    // Therefore, the "correct" flow for the Owner to add an admin without logging out is:
    // 1. Create a row in the database 'profiles' table with role 'admin'.
    // 2. When that user actually signs up with the matching email later, they will inherit the role (if trigger logic exists).
    // 
    // FOR THIS DEMO: We will mock the creation in the list to show the UI feedback loop,
    // as we cannot effectively execute the backend logic from the browser safely.
    
    try {
        const mockNewUser: UserProfile = {
            id: crypto.randomUUID(),
            email: newAdminEmail,
            username: newAdminUsername,
            role: 'admin',
            created_at: new Date().toISOString()
        };
        
        // Optimistic update for demo purposes
        setUsersList([...usersList, mockNewUser]);
        setAdminCreationMsg({ type: 'success', text: `Admin profile reserved for ${newAdminUsername} (${newAdminEmail}). They can now register.` });
        
        // Attempt to insert into DB if possible
        const { error } = await supabase.from('profiles').insert([
            { id: mockNewUser.id, email: newAdminEmail, username: newAdminUsername, role: 'admin' }
        ]);

        if (error) throw error;

        setNewAdminEmail('');
        setNewAdminPassword('');
        setNewAdminUsername('');
        
    } catch (error: any) {
        setAdminCreationMsg({ type: 'error', text: error.message || 'Failed to create admin placeholder.' });
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    // Optimistic update
    setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole as 'user' | 'admin' } : u));

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      // Revert if error
      fetchUsers();
    }
  };

  // Content Management Functions
  const loadMovies = async () => {
    setContentLoading(true);
    try {
      const allMovies = await fetchContent(undefined, 'Movie');
      setMovies(allMovies);
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const loadTVSeries = async () => {
    setContentLoading(true);
    try {
      const allSeries = await fetchContent(undefined, 'TV Series');
      setTVSeries(allSeries);
      
      // Load episode counts for each series
      const counts: Record<string, number> = {};
      await Promise.all(
        allSeries.map(async (series) => {
          const count = await getEpisodeCount(series.id);
          counts[series.id] = count;
        })
      );
      setEpisodeCounts(counts);
    } catch (error) {
      console.error('Error loading TV series:', error);
    } finally {
      setContentLoading(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishContent(id);
      if (activeTab === 'movies') {
        await loadMovies();
      } else if (activeTab === 'tvseries') {
        await loadTVSeries();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to publish content');
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishContent(id);
      if (activeTab === 'movies') {
        await loadMovies();
      } else if (activeTab === 'tvseries') {
        await loadTVSeries();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to unpublish content');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteContent(id);
      if (activeTab === 'movies') {
        await loadMovies();
      } else if (activeTab === 'tvseries') {
        await loadTVSeries();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to delete content');
    }
  };

  const handleUploadSuccess = () => {
    if (activeTab === 'movies') {
      loadMovies();
    } else if (activeTab === 'tvseries') {
      loadTVSeries();
    }
  };

  const handleManageEpisodes = (series: Content) => {
    setSelectedSeries(series);
  };

  if (!isAdmin) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center">
                <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-gray-400">You do not have permission to view this area.</p>
                <button onClick={signOut} className="mt-6 text-neon-green hover:underline">Sign Out</button>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex pt-20">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6">
            <h2 className="text-xl font-black tracking-wider text-white">Admin<span className="text-neon-green">Panel</span></h2>
            <p className="text-xs text-gray-500 mt-1">v2.0.1 System Active</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Activity size={18} />
                <span className="font-medium text-sm">Overview</span>
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Users size={18} />
                <span className="font-medium text-sm">User Management</span>
            </button>
            <button 
                onClick={() => setActiveTab('movies')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'movies' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Film size={18} />
                <span className="font-medium text-sm">Movies</span>
            </button>
            <button 
                onClick={() => setActiveTab('tvseries')}
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors ${activeTab === 'tvseries' ? 'bg-neon-green/10 text-neon-green border border-neon-green/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Tv size={18} />
                <span className="font-medium text-sm">TV Series</span>
            </button>
        </nav>

        <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-neon-green flex items-center justify-center text-black font-bold">
                    {profile?.username?.[0] || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{profile?.username}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
                        <p className="text-gray-400">Welcome back, Administrator.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-mono border border-green-500/30">System Online</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users size={64} />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Users</h3>
                        <p className="text-4xl font-black text-white">1,284</p>
                        <p className="text-green-500 text-xs mt-2 flex items-center gap-1">↑ 12% from last week</p>
                    </div>

                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Film size={64} />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Active Movies</h3>
                        <p className="text-4xl font-black text-white">843</p>
                        <p className="text-gray-500 text-xs mt-2">12 pending review</p>
                    </div>

                    <div className="bg-[#111] p-6 rounded-2xl border border-white/10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Activity size={64} />
                        </div>
                        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Stream Hours</h3>
                        <p className="text-4xl font-black text-white">45.2K</p>
                        <p className="text-green-500 text-xs mt-2 flex items-center gap-1">↑ 5% from last week</p>
                    </div>
                </div>
            </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
            <div className="space-y-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-gray-400">Manage access and permissions.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Admin Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 sticky top-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <UserPlus className="text-neon-green" size={20} />
                                Reserve Admin Spot
                            </h3>
                            <p className="text-xs text-gray-500 mb-6">
                                Manually register a username for a new admin. They can claim this by registering with the email below.
                            </p>
                            
                            {adminCreationMsg && (
                                <div className={`p-3 rounded-lg mb-4 text-xs ${adminCreationMsg.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {adminCreationMsg.text}
                                </div>
                            )}

                            <form onSubmit={handleCreateAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Username</label>
                                    <input 
                                        type="text" 
                                        value={newAdminUsername}
                                        onChange={(e) => setNewAdminUsername(e.target.value)}
                                        className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-sm focus:border-neon-green/50 focus:outline-none"
                                        placeholder="AdminUser"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        value={newAdminEmail}
                                        onChange={(e) => setNewAdminEmail(e.target.value)}
                                        className="w-full bg-[#050505] border border-white/10 rounded px-3 py-2 text-sm focus:border-neon-green/50 focus:outline-none"
                                        placeholder="admin@zeyera.com"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-white text-black font-bold py-2 rounded hover:bg-gray-200 transition-colors">
                                    Reserve Admin
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-bold">System Users</h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                    <input type="text" placeholder="Search users..." className="bg-[#050505] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-neon-green/50 w-64" />
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#0a0a0a] text-xs uppercase text-gray-500 border-b border-white/5">
                                            <th className="p-4 font-medium">User</th>
                                            <th className="p-4 font-medium">Role</th>
                                            <th className="p-4 font-medium">Joined</th>
                                            <th className="p-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {usersList.length === 0 && !loading && (
                                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td></tr>
                                        )}
                                        {usersList.map((u) => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role === 'admin' ? 'bg-neon-green text-black' : 'bg-gray-800 text-gray-400'}`}>
                                                            {u.username?.[0] || u.email[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{u.username || 'Unknown'}</div>
                                                            <div className="text-gray-500 text-xs">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${u.role === 'admin' ? 'bg-neon-green/20 text-neon-green border border-neon-green/20' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500 text-xs">
                                                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => toggleUserRole(u.id, u.role)}
                                                            className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white" 
                                                            title={u.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                                                        >
                                                            <Shield size={16} />
                                                        </button>
                                                        <button className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-500" title="Delete User">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Movies Management Tab */}
        {activeTab === 'movies' && (
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Movies Management</h1>
                        <p className="text-gray-400">Upload and manage movies.</p>
                    </div>
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green/80 transition-colors flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Upload Movie
                    </button>
                </header>

                {/* Unpublished Movies */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
                        Unpublished Movies ({movies.filter((m) => m.status === 'unpublished').length})
                    </h2>
                    {contentLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : movies.filter((m) => m.status === 'unpublished').length === 0 ? (
                        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            No unpublished movies.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {movies.filter((m) => m.status === 'unpublished').map((movie) => (
                                <div key={movie.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-yellow-500/50 transition-colors">
                                    <div className="relative aspect-[2/3] bg-gray-900">
                                        <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black">
                                            DRAFT
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-white truncate">{movie.title}</h3>
                                            <p className="text-xs text-gray-500">{movie.genre}</p>
                                            {movie.year && <p className="text-xs text-gray-600">{movie.year}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handlePublish(movie.id)}
                                                className="flex-1 bg-neon-green hover:bg-neon-green/80 text-black px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle size={14} />
                                                Publish
                                            </button>
                                            <button
                                                onClick={() => handleDelete(movie.id, movie.title)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Published Movies */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-neon-green rounded-full"></div>
                        Published Movies ({movies.filter((m) => m.status === 'published').length})
                    </h2>
                    {contentLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : movies.filter((m) => m.status === 'published').length === 0 ? (
                        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            No published movies yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {movies.filter((m) => m.status === 'published').map((movie) => (
                                <div key={movie.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-neon-green/50 transition-colors">
                                    <div className="relative aspect-[2/3] bg-gray-900">
                                        <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-neon-green/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black">
                                            LIVE
                                        </div>
                                        {movie.rating && (
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                                                ⭐ {movie.rating}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-white truncate">{movie.title}</h3>
                                            <p className="text-xs text-gray-500">{movie.genre}</p>
                                            {movie.published_at && (
                                                <p className="text-xs text-gray-600">Published {new Date(movie.published_at).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUnpublish(movie.id)}
                                                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <XCircle size={14} />
                                                Unpublish
                                            </button>
                                            <button
                                                onClick={() => handleDelete(movie.id, movie.title)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* TV Series Management Tab */}
        {activeTab === 'tvseries' && (
            <div className="space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">TV Series Management</h1>
                        <p className="text-gray-400">Upload and manage TV series with episodes.</p>
                    </div>
                    <button
                        onClick={() => setUploadModalOpen(true)}
                        className="bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green/80 transition-colors flex items-center gap-2"
                    >
                        <Upload size={18} />
                        Upload TV Series
                    </button>
                </header>

                {/* Unpublished TV Series */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-yellow-500 rounded-full"></div>
                        Unpublished TV Series ({tvSeries.filter((s) => s.status === 'unpublished').length})
                    </h2>
                    {contentLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : tvSeries.filter((s) => s.status === 'unpublished').length === 0 ? (
                        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            No unpublished TV series.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tvSeries.filter((s) => s.status === 'unpublished').map((series) => (
                                <div key={series.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-yellow-500/50 transition-colors">
                                    <div className="relative aspect-[2/3] bg-gray-900">
                                        <img src={series.poster_url} alt={series.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black">
                                            DRAFT
                                        </div>
                                        {episodeCounts[series.id] > 0 && (
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                                                📺 {episodeCounts[series.id]} Episodes
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-white truncate">{series.title}</h3>
                                            <p className="text-xs text-gray-500">{series.genre}</p>
                                            {series.year && <p className="text-xs text-gray-600">{series.year}</p>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleManageEpisodes(series)}
                                                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <List size={14} />
                                                Episodes
                                            </button>
                                            <button
                                                onClick={() => handlePublish(series.id)}
                                                className="bg-neon-green hover:bg-neon-green/80 text-black px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <CheckCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(series.id, series.title)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Published TV Series */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <div className="w-1 h-5 bg-neon-green rounded-full"></div>
                        Published TV Series ({tvSeries.filter((s) => s.status === 'published').length})
                    </h2>
                    {contentLoading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : tvSeries.filter((s) => s.status === 'published').length === 0 ? (
                        <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center text-gray-500">
                            No published TV series yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {tvSeries.filter((s) => s.status === 'published').map((series) => (
                                <div key={series.id} className="bg-[#111] border border-white/10 rounded-xl overflow-hidden group hover:border-neon-green/50 transition-colors">
                                    <div className="relative aspect-[2/3] bg-gray-900">
                                        <img src={series.poster_url} alt={series.title} className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 bg-neon-green/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black">
                                            LIVE
                                        </div>
                                        {episodeCounts[series.id] > 0 && (
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                                                📺 {episodeCounts[series.id]} Episodes
                                            </div>
                                        )}
                                        {series.rating && (
                                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-white">
                                                ⭐ {series.rating}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-bold text-white truncate">{series.title}</h3>
                                            <p className="text-xs text-gray-500">{series.genre}</p>
                                            {series.published_at && (
                                                <p className="text-xs text-gray-600">Published {new Date(series.published_at).toLocaleDateString()}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleManageEpisodes(series)}
                                                className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 px-3 py-2 rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                                            >
                                                <List size={14} />
                                                Episodes
                                            </button>
                                            <button
                                                onClick={() => handleUnpublish(series.id)}
                                                className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(series.id, series.title)}
                                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-2 rounded text-xs font-bold transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Upload Modal */}
        <UploadContentModal
            isOpen={isUploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            onSuccess={handleUploadSuccess}
        />

        {/* Episode Management Modal */}
        {selectedSeries && (
            <EpisodeManagement
                isOpen={selectedSeries !== null}
                onClose={() => setSelectedSeries(null)}
                series={selectedSeries}
                onUpdate={() => {
                    loadTVSeries();
                }}
            />
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
