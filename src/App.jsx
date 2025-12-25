import { useState, useEffect } from 'react';
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
  const [cache, setCache] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const channelsPerPage = 30;

  // 1. GET CATEGORIES (FIREBASE)
  useEffect(() => {
    const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) setSelectedPlaylist(data[0]);
      setLoading(false);
    });
  }, []);

  // 2. INSTANT STREAMING LOADER
  useEffect(() => {
    const targetUrl = selectedPlaylist?.m3uUrl || selectedPlaylist?.url;
    if (!targetUrl) return;

    setCurrentPage(0);
    if (cache[targetUrl]) {
      setChannels(cache[targetUrl]);
      return;
    }

    setChannels([]);
    setSwitching(true);

    const loadStream = async () => {
      try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        let partialText = '';
        let allParsedChannels = [];
        let hasShownFirstBatch = false;
        let current = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          partialText += decoder.decode(value, { stream: true });
          const lines = partialText.split('\n');
          // Keep the last incomplete line for the next chunk
          partialText = lines.pop();

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('#EXTINF:')) {
              const name = trimmed.split(',').pop() || "Unknown";
              const logoMatch = trimmed.match(/tvg-logo="([^"]*)"/);
              current = { name: name.trim(), logo: logoMatch ? logoMatch[1] : '' };
            } else if (trimmed.startsWith('http') && current) {
              current.url = trimmed;
              allParsedChannels.push(current);
              current = null;
              
              // FAST PATH: Show first 20 channels immediately without waiting for download
              if (!hasShownFirstBatch && allParsedChannels.length >= 20) {
                setChannels([...allParsedChannels]);
                setSwitching(false);
                hasShownFirstBatch = true;
              }
            }
          }
        }

        // Finalize the full list
        setCache(prev => ({ ...prev, [targetUrl]: allParsedChannels }));
        setChannels(allParsedChannels);
        setSwitching(false);
      } catch (err) {
        console.error("Stream Error:", err);
        setSwitching(false);
      }
    };

    loadStream();
  }, [selectedPlaylist]);

  const totalPages = Math.ceil(channels.length / channelsPerPage);
  const paginatedChannels = channels.slice(currentPage * channelsPerPage, (currentPage + 1) * channelsPerPage);

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center">
      <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
      <h1 className="text-emerald-500 font-black italic text-2xl tracking-tighter uppercase animate-pulse">E-Live Booting</h1>
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
      onSelectChannel={setCurrentChannel} 
    />
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <nav className="p-4 px-8 border-b border-zinc-900 flex items-center justify-between fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl z-[100]">
        <h1 className="text-2xl font-black italic text-emerald-500 tracking-tighter uppercase cursor-pointer" onClick={() => window.location.reload()}>E-Live</h1>
        <div className="flex gap-6 overflow-x-auto no-scrollbar max-w-[70%] px-4">
          {playlists.map(pl => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylist(pl)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap pb-1
                ${selectedPlaylist?.id === pl.id ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {pl.categoryName}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-[72px]"> 
        <section className="relative h-[45vh] md:h-[55vh] w-full overflow-hidden shadow-2xl">
          <HeroSlider />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
        </section>

        <main className="max-w-7xl mx-auto p-8 relative z-20 mt-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <p className="text-emerald-500 text-[10px] font-black tracking-[0.4em] uppercase mb-1">Browse Directory</p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">{selectedPlaylist?.categoryName}</h2>
            </div>
            {switching && <Loader2 size={24} className="text-emerald-500 animate-spin"/>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {paginatedChannels.map((ch, i) => (
              <button
                key={i}
                onClick={() => { setCurrentChannel(ch); window.scrollTo(0, 0); }}
                className="group flex flex-col items-center"
              >
                <div className="aspect-square w-full mb-4 flex items-center justify-center bg-zinc-900/40 rounded-[2.5rem] p-6 border border-zinc-800 group-hover:border-emerald-500 group-hover:bg-emerald-500/5 transition-all duration-500 shadow-xl">
                  <img src={ch.logo} loading="lazy" onError={(e) => e.target.src = "https://via.placeholder.com/150?text=LIVE"} className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" />
                </div>
                <p className="text-[10px] font-bold truncate w-full text-zinc-500 group-hover:text-white uppercase tracking-tighter text-center">{ch.name}</p>
              </button>
            ))}
          </div>

          {!switching && channels.length > channelsPerPage && (
            <div className="mt-20 mb-20 flex items-center justify-center gap-10">
              <button disabled={currentPage === 0} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 disabled:opacity-10 transition-all flex items-center justify-center">
                <ChevronLeft size={28} />
              </button>
              <div className="text-center min-w-[100px]">
                <p className="text-emerald-500 font-black text-2xl tracking-tighter">{currentPage + 1} <span className="text-zinc-800 mx-2">/</span> {totalPages}</p>
              </div>
              <button disabled={currentPage >= totalPages - 1} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({top: 400, behavior: 'smooth'}); }} className="w-14 h-14 bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 disabled:opacity-10 transition-all flex items-center justify-center">
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