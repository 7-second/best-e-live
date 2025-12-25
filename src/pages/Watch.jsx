import { ArrowLeft, Share2, Info } from 'lucide-react';
import VideoPlayer from '../components/player/VideoPlayer';

const Watch = ({ channel, onBack }) => {
  // Sample Sidebar Channels
  const sidebarChannels = [
    { id: 2, name: "HBO HD", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/1200px-HBO_logo.svg.png" },
    { id: 3, name: "CNN International", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/CNN.svg/1200px-CNN.svg.png" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* MAIN PLAYER AREA (LEFT) */}
      <div className="flex-1">
        <button 
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </button>

        <VideoPlayer 
          url={channel.url || "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"} 
          poster={channel.logo} 
        />

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {channel.name}
            </h1>
            <div className="flex gap-2">
              <button className="rounded-full bg-white/5 p-3 text-white hover:bg-white/10"><Share2 className="h-5 w-5" /></button>
              <button className="rounded-full bg-white/5 p-3 text-white hover:bg-white/10"><Info className="h-5 w-5" /></button>
            </div>
          </div>
          <p className="mt-2 text-sm font-bold text-brand-green uppercase tracking-widest">
            Live • 1080p • {channel.category}
          </p>
        </div>
      </div>

      {/* SIDEBAR (RIGHT) */}
      <aside className="w-full lg:w-80 shrink-0">
        <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
          Up Next / Trending
        </h3>
        <div className="flex flex-col gap-3">
          {sidebarChannels.map((c) => (
            <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-all">
              <img src={c.logo} className="h-10 w-10 object-contain rounded-lg bg-zinc-900 p-1" alt="" />
              <span className="text-xs font-black uppercase text-white truncate">{c.name}</span>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default Watch;