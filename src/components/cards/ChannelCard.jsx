import { PlayCircle } from 'lucide-react';

const ChannelCard = ({ channel }) => {
  return (
    <div className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10 hover:border-brand-green/30">
      
      <div className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center">
        <img 
          src={channel.logo} 
          alt="" 
          className="h-1/2 w-1/2 object-contain transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=111&color=22c55e&bold=true`;
          }}
        />
        
        {/* Play Icon that appears on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
           <PlayCircle className="h-10 w-10 text-brand-green" />
        </div>
      </div>

      <div className="mt-3">
        <h4 className="truncate text-[11px] font-black uppercase tracking-tight text-white group-hover:text-brand-green transition-colors">
          {channel.name}
        </h4>
        <div className="mt-1 flex items-center gap-2">
           <span className="h-1 w-1 rounded-full bg-brand-green animate-pulse" />
           <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Live Stream</p>
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;