import React from "react";
import VideoPlayer from "../components/player/VideoPlayer";
import { ArrowLeft, ChevronLeft, ChevronRight, Tv } from "lucide-react";

const PlayerPage = ({
  channel,
  playlistName,
  onBack,
  allChannels,
  currentPage,
  setCurrentPage,
  onSelectChannel,
}) => {
  const channelsPerPage = 10;
  const totalPages = Math.ceil(allChannels.length / channelsPerPage);
  const paginatedChannels = allChannels.slice(
    currentPage * channelsPerPage,
    (currentPage + 1) * channelsPerPage
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 font-sans">
      {/* Header */}
      <div className="max-w-6xl mx-auto p-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className="group text-zinc-500 hover:text-emerald-500 flex items-center gap-2 text-[10px] font-black uppercase transition-all"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Gallery
        </button>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic">
            Live Now
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Main Player Section */}
        <VideoPlayer key={channel.url} url={channel.url} />

        {/* Currently Playing Info */}
        <div className="mt-8 flex items-center gap-6 border-b border-zinc-900 pb-8">
          <div className="h-20 w-20 bg-white p-3 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
            <img
              src={channel.logo}
              alt={channel.name}
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              className="max-h-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
              {channel.name}
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">
                {playlistName}
              </span>
            </div>
          </div>
        </div>

        {/* Channel Grid Section */}
        <div className="mt-12">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-zinc-500 font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-3 mb-1">
                <Tv size={18} className="text-emerald-500" /> More Channels
              </h3>
              <p className="text-zinc-600 text-[10px] font-bold uppercase">Discover similar content</p>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 hover:text-emerald-500 disabled:opacity-20 transition-all bg-zinc-800 rounded-xl"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[10px] font-black text-zinc-400 px-2">
                <span className="text-emerald-500">{currentPage + 1}</span> / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 hover:text-emerald-500 disabled:opacity-20 transition-all bg-zinc-800 rounded-xl"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Improved Grid with Logo Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {paginatedChannels.map((ch, i) => {
              const isActive = channel.url === ch.url;
              return (
                <button
                  key={i}
                  onClick={() => onSelectChannel(ch)}
                  className={`group p-4 rounded-[1.8rem] border flex flex-col items-center gap-4 transition-all duration-300 ${
                    isActive
                      ? "border-emerald-500 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                      : "bg-zinc-900/40 border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/60"
                  }`}
                >
                  <div className={`h-14 w-14 rounded-2xl p-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "bg-white shadow-lg" : "bg-zinc-800"
                  }`}>
                    <img
                      src={ch.logo}
                      alt=""
                      onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <p className={`text-[10px] font-black truncate w-full text-center uppercase tracking-tight ${
                    isActive ? "text-emerald-500" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}>
                    {ch.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;