import React from 'react';
import VideoPlayer from '../components/player/VideoPlayer';
import { ArrowLeft, ChevronLeft, ChevronRight, Tv } from 'lucide-react';

const PlayerPage = ({ channel, playlistName, onBack, allChannels, currentPage, setCurrentPage, onSelectChannel }) => {
  const channelsPerPage = 10;
  const totalPages = Math.ceil(allChannels.length / channelsPerPage);
  const paginatedChannels = allChannels.slice(currentPage * channelsPerPage, (currentPage + 1) * channelsPerPage);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
        <button onClick={onBack} className="text-zinc-500 hover:text-emerald-500 flex items-center gap-2 text-[10px] font-black uppercase transition-all">
          <ArrowLeft size={16} /> Back to Gallery
        </button>
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic animate-pulse">Live Streaming</p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <div className="aspect-video w-full rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl bg-black">
          <VideoPlayer key={channel.url} url={channel.url} />
        </div>

        <div className="mt-8 flex items-center gap-6 border-b border-zinc-900 pb-8">
          <div className="h-20 w-20 bg-white p-4 rounded-[1.5rem] flex items-center justify-center shadow-xl">
            <img src={channel.logo} onError={(e) => e.target.src = "https://via.placeholder.com/150"} className="max-h-full object-contain" />
          </div>
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">{channel.name}</h2>
            <p className="text-emerald-500 text-[11px] font-bold uppercase">Category: {playlistName}</p>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-zinc-500 font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3">
              <Tv size={18} className="text-emerald-500" /> Browse More
            </h3>
            <div className="flex items-center gap-4 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
              <button disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} className="p-2 hover:text-emerald-500 disabled:opacity-20 transition-all">
                <ChevronLeft size={20} />
              </button>
              <span className="text-[10px] font-black text-emerald-500">{currentPage + 1} / {totalPages}</span>
              <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} className="p-2 hover:text-emerald-500 disabled:opacity-20 transition-all">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {paginatedChannels.map((ch, i) => (
              <button key={i} onClick={() => onSelectChannel(ch)} className={`p-4 rounded-[1.5rem] border text-left transition-all ${channel.url === ch.url ? 'border-emerald-500 bg-emerald-500/5' : 'bg-zinc-900/40 border-zinc-800 hover:border-emerald-500'}`}>
                <p className="text-[10px] font-bold truncate uppercase">{ch.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlayerPage;