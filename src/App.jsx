import { useState, useEffect, useRef } from 'react';
import { db } from './api/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import HeroSlider from './components/layout/HeroSlider';
import PlayerPage from './pages/PlayerPage';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [channels, setChannels] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const channelsPerPage = 30;

  // Use a Ref for the cache to keep it fast and persistent across re-renders
  const cache = useRef({});

  // 1. GET CATEGORIES FROM FIREBASE
  useEffect(() => {
    const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) setSelectedPlaylist(data[0]);
      setLoading(false);
    });
  }, []);

  // 2. ULTRA-FAST CHANNEL LOADER (STREAMING)
  useEffect(() => {
    const targetUrl = selectedPlaylist?.m3uUrl || selectedPlaylist?.url;
    if (!targetUrl) return;

    setCurrentPage(0);
    
    // Check Cache first
    if (cache.current[targetUrl]) {
      setChannels(cache.current[targetUrl]);
      setSwitching(false);
      return;
    }

    setChannels([]);
    setSwitching(true);

    const loadStream = async () => {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let leftover = '';
        let allParsed = [];
        let hasShownFirstBatch = false;
        let current = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = (leftover + chunk).split('\n');
          leftover = lines.pop(); // Keep last incomplete line

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#EXTINF:')) {
              const name = trimmed.split(',').pop() || 'Unknown';
              const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
              current = { name: name.trim(), logo: logoMatch ? logoMatch[1] : '' };
            } else if (trimmed.startsWith('http') && current) {
              current.url = trimmed;
              allParsed.push(current);
              current = null;

              // INSTANT UI UPDATE: Show first 30 channels immediately
              if (!hasShownFirstBatch && allParsed.length >= 30) {
                setChannels([...allParsed]);
                setSwitching(false); // Stop loading spinner early
                hasShownFirstBatch = true;
              }
            }
          }
        }

        // Finalize everything
        cache.current[targetUrl] = allParsed;
        setChannels(allParsed);
        setSwitching(false);
      } catch (err) {
        console.error('Streaming Error:', err);
        setSwitching(false);
      }
    };

    loadStream();
  }, [selectedPlaylist]);

  const totalPages = Math.ceil(channels.length / channelsPerPage);
  const paginatedChannels = channels.slice(currentPage * channelsPerPage, (currentPage + 1) * channelsPerPage);

  // --- UI RENDER LOGIC ---

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
      <h1 className="text-emerald-500 font-black italic tracking-tighter text-2xl">E-LIVE SYSTEM BOOT</h1>
    </div>
  );

  if (currentChannel) return (
    <PlayerPage
      channel={currentChannel}
      playlistName={selectedPlaylist?.categoryName}
      allChannels={channels}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      onBack={() => setCurrentChannel(null)}
      onSelectChannel={(ch) => {
        setCurrentChannel(ch);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <nav className="p-4 px-8 border-b border-zinc-900 flex items-center justify-between fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl z-[100]">
        <h1 className="text-2xl font-black italic text-emerald-500 tracking-tighter uppercase">E-Live</h1>
        <div className="flex gap-6 overflow-x-auto no-scrollbar max-w-[70%] px-4">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylist(pl)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all pb-1 whitespace-nowrap ${
                selectedPlaylist?.id === pl.id ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500'
              }`}
            >
              {pl.categoryName}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-[72px]">
        <section className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden shadow-2xl">
          <HeroSlider />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
        </section>

        <main className="max-w-7xl mx-auto p-8 relative z-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">{selectedPlaylist?.categoryName}</h2>
            {switching && <Loader2 size={24} className="text-emerald-500 animate-spin" />}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {paginatedChannels.map((ch, i) => (
              <button key={i} onClick={() => setCurrentChannel(ch)} className="group flex flex-col items-center">
                <div className="aspect-square w-full mb-4 flex items-center justify-center bg-zinc-900/50 rounded-[2.5rem] p-6 border border-zinc-800/50 group-hover:border-emerald-500 transition-all duration-500 shadow-2xl">
                  <img 
                    src={ch.logo} 
                    loading="lazy" 
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=TV')} 
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform" 
                  />
                </div>
                <p className="text-[11px] font-bold truncate w-full text-zinc-500 group-hover:text-emerald-400 uppercase text-center">{ch.name}</p>
              </button>
            ))}
          </div>

          {!switching && channels.length > channelsPerPage && (
            <div className="mt-20 mb-20 flex items-center justify-center gap-10">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center hover:border-emerald-500 transition-all">
                <ChevronLeft size={28} />
              </button>
              <p className="text-white font-black text-2xl">{currentPage + 1} <span className="text-zinc-800">/</span> {totalPages}</p>
              <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center hover:border-emerald-500 transition-all">
                <ChevronRight size={28} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;