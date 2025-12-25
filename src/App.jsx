import { useState, useEffect } from 'react';
import { db } from './api/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import HeroSlider from './components/layout/HeroSlider';
import VideoPlayer from './components/player/VideoPlayer';
import { Tv, Play, ChevronRight } from 'lucide-react';

function App() {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // FETCH DATA FROM FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylists(data);
      
      // Auto-select the first category if none is selected
      if (data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [selectedPlaylist]);

  if (loading) return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-green"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-green selection:text-black">
      
      {/* HEADER / CATEGORY NAV */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black italic text-brand-green tracking-tighter">E-LIVE</h1>
        
        <div className="hidden md:flex items-center gap-8">
          {playlists.map(pl => (
            <button 
              key={pl.id}
              onClick={() => {
                setSelectedPlaylist(pl);
                setCurrentChannel(null); // Reset player when changing category
              }}
              className={`text-xs font-black uppercase tracking-widest transition-all hover:text-brand-green ${
                selectedPlaylist?.id === pl.id ? 'text-brand-green scale-110' : 'text-zinc-500'
              }`}
            >
              {pl.categoryName}
            </button>
          ))}
        </div>
        
        <div className="w-10 h-10 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center">
          <Tv size={18} className="text-brand-green" />
        </div>
      </nav>

      {/* VIDEO PLAYER / HERO AREA */}
      <section className="relative h-[60vh] md:h-[70vh] bg-zinc-900 overflow-hidden shadow-2xl">
        {currentChannel ? (
          <div className="h-full w-full relative">
            <VideoPlayer url={currentChannel.url} />
            
            {/* Back Button */}
            <button 
              onClick={() => setCurrentChannel(null)}
              className="absolute top-6 left-6 z-20 bg-black/80 p-3 px-5 rounded-full text-[10px] font-black border border-zinc-700 hover:bg-brand-green hover:text-black transition-all"
            >
              ← BACK TO FEATURED
            </button>

            {/* Current Channel Info Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black via-black/80 to-transparent">
              <div className="flex items-center gap-4">
                <img src={currentChannel.logo} alt="" className="h-16 w-16 object-contain bg-white rounded-xl p-2" />
                <div>
                  <p className="text-brand-green text-xs font-bold animate-pulse">● LIVE NOW</p>
                  <h2 className="text-4xl font-black italic uppercase">{currentChannel.name}</h2>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <HeroSlider />
        )}
      </section>

      {/* CHANNEL GRID */}
      <main className="p-6 lg:px-20 py-12">
        <div className="flex items-center justify-between mb-10 border-l-4 border-brand-green pl-4">
          <div>
            <h3 className="text-2xl font-black italic uppercase leading-none">
              {selectedPlaylist?.categoryName || 'Select Category'}
            </h3>
            <p className="text-zinc-500 text-[10px] font-bold mt-1 tracking-widest uppercase">
              Browse {selectedPlaylist?.channels?.length || 0} Live Streams
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
          {selectedPlaylist?.channels?.map((channel, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentChannel(channel);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl hover:border-brand-green transition-all hover:bg-zinc-800 active:scale-95 text-left relative overflow-hidden"
            >
              <div className="aspect-video bg-black/40 rounded-xl mb-4 flex items-center justify-center p-3 relative z-10">
                <img 
                  src={channel.logo} 
                  alt={channel.name} 
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500" 
                />
              </div>
              <p className="text-[11px] font-black text-zinc-400 group-hover:text-white truncate uppercase tracking-tighter">
                {channel.name}
              </p>
              
              {/* Play Icon on Hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={14} className="text-brand-green fill-brand-green" />
              </div>
            </button>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="p-10 border-t border-zinc-900 text-center">
        <p className="text-zinc-700 text-[10px] font-bold tracking-[0.3em] uppercase">
          &copy; 2025 E-LIVE STREAMING SERVICE
        </p>
      </footer>
    </div>
  );
}

export default App;