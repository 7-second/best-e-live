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
  const [currentPage, setCurrentPage] = useState(0);
  const channelsPerPage = 30;

  // 1. GET CATEGORIES
  useEffect(() => {
    const q = query(collection(db, 'playlists'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setPlaylists(data);
        if (data.length > 0 && !selectedPlaylist) {
          setSelectedPlaylist(data[0]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Error:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // 2. CHANNEL LOADER (Progressive + Cached)
  useEffect(() => {
    const targetUrl = selectedPlaylist?.m3uUrl || selectedPlaylist?.url;
    if (!targetUrl) return;

    setCurrentPage(0);
    setSwitching(true);

    const cacheKey = `channels_${targetUrl}`;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      setChannels(JSON.parse(cachedData));
      setSwitching(false);
      return;
    }

    setChannels([]);
    const accumulated = [];
    const displayed = [];
    const batchSize = 10;
    let i = 0;

    fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`)
      .then((res) => res.text())
      .then((text) => {
        const lines = text.split('\n');
        let current = null;

        const parseNext = () => {
          if (i >= lines.length) {
            displayed.push(...accumulated);
            setChannels([...displayed]);
            localStorage.setItem(cacheKey, JSON.stringify(displayed));
            setSwitching(false);
            return;
          }

          const line = lines[i].trim();
          if (line.startsWith('#EXTINF:')) {
            const name = line.split(',').pop() || 'Unknown';
            const logoMatch = line.match(/tvg-logo="([^"]*)"/);
            current = { name: name.trim(), logo: logoMatch ? logoMatch[1] : '' };
          } else if (line.startsWith('http') && current) {
            current.url = line;
            accumulated.push(current);
            current = null;

            if (accumulated.length >= batchSize) {
              displayed.push(...accumulated);
              setChannels([...displayed]);
              accumulated.length = 0;
            }
          }

          i++;
          setTimeout(parseNext, 0);
        };

        parseNext();
      })
      .catch((err) => {
        console.error('M3U Load Error:', err);
        setSwitching(false);
      });
  }, [selectedPlaylist]);

  const totalPages = Math.ceil(channels.length / channelsPerPage);
  const paginatedChannels = channels.slice(
    currentPage * channelsPerPage,
    (currentPage + 1) * channelsPerPage
  );

  if (loading)
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center">
        <Loader2 className="text-emerald-500 animate-spin mb-4" size={40} />
        <h1 className="text-emerald-500 font-black italic tracking-tighter text-2xl">
          E-LIVE SYSTEM BOOT
        </h1>
      </div>
    );

  if (currentChannel) {
    return (
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
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="p-4 px-8 border-b border-zinc-900 flex items-center justify-between fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-xl z-[100]">
        <h1 className="text-2xl font-black italic text-emerald-500 tracking-tighter uppercase cursor-pointer">
          E-Live
        </h1>
        <div className="flex gap-6 overflow-x-auto no-scrollbar max-w-[70%] px-4">
          {playlists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => setSelectedPlaylist(pl)}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap pb-1 ${
                selectedPlaylist?.id === pl.id
                  ? 'text-emerald-500 border-b-2 border-emerald-500'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {pl.categoryName}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-[72px]">
        {/* HERO SECTION */}
        <section className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
          <HeroSlider />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
        </section>

        {/* MAIN CONTENT */}
        <main className="max-w-7xl mx-auto p-8 relative z-20 mt-8">
          <div className="flex items-center justify-between mb-12 border-l-4 border-emerald-500 pl-6">
            <div>
              <p className="text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">
                Live Directory
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
                {selectedPlaylist?.categoryName || 'Select Category'}
              </h2>
            </div>
            {switching && (
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <Loader2 size={16} className="animate-spin" /> SYNCING...
              </div>
            )}
          </div>

          {/* CHANNEL GRID */}
          {channels.length === 0 && !switching ? (
            <div className="py-40 text-center text-zinc-700 uppercase font-black text-xs tracking-[0.5em] animate-pulse">
              Empty Stream List
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
              {paginatedChannels.map((ch, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentChannel(ch);
                    window.scrollTo(0, 0);
                  }}
                  className="group flex flex-col items-center"
                >
                  <div className="aspect-square w-full mb-4 flex items-center justify-center bg-zinc-900/50 rounded-[2.5rem] p-6 border border-zinc-800/50 group-hover:border-emerald-500 group-hover:bg-emerald-500/5 transition-all duration-500 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl"></div>
                    <img
                      src={ch.logo}
                      loading="lazy"
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/300?text=TV')}
                      className="max-h-full max-w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-[11px] font-bold truncate w-full text-zinc-500 group-hover:text-emerald-400 uppercase tracking-tighter transition-colors">
                    {ch.name}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {!switching && channels.length > channelsPerPage && (
            <div className="mt-24 mb-24 flex items-center justify-center gap-10">
              <button
                disabled={currentPage === 0}
                onClick={() => {
                  setCurrentPage((p) => p - 1);
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                className="w-14 h-14 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 disabled:opacity-10 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="text-center min-w-[100px]">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mb-1">Page</p>
                <p className="text-white font-black text-2xl tracking-tighter">
                  <span className="text-emerald-500">{currentPage + 1}</span>
                  <span className="text-zinc-800 mx-2">/</span>
                  {totalPages}
                </p>
              </div>

              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => {
                  setCurrentPage((p) => p + 1);
                  window.scrollTo({ top: 500, behavior: 'smooth' });
                }}
                className="w-14 h-14 flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-2xl hover:border-emerald-500 disabled:opacity-10 transition-all hover:scale-110 active:scale-95"
              >
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
