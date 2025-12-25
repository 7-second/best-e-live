import { Tv, House, Trophy, Film, Search, MonitorPlay, Clapperboard, GlobeLock, Bell } from 'lucide-react';
import { useCategory } from '../../store/CategoryContext';

// Helper to map string names to Lucide Components
const IconMap = {
  Home: House,
  Sports: Trophy,
  Movies: Film,
  Cinema: Clapperboard,
  Live: MonitorPlay,
};

const Navbar = () => {
  // Pull all controls from our Global Store
  const { 
    setActiveUrl, 
    setCategoryName, 
    categoryName, 
    setIsGeoView, 
    isGeoView 
  } = useCategory();

  // Your primary categories
  const navItems = [
    { name: 'Sports', icon: 'Sports', url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
    { name: 'Movies', icon: 'Movies', url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
    { name: 'Documentary', icon: 'Live', url: "https://iptv-org.github.io/iptv/categories/documentary.m3u" },
    { name: 'Kids', icon: 'Home', url: "https://iptv-org.github.io/iptv/categories/kids.m3u" },
  ];

  const handleCategoryClick = (item) => {
    setIsGeoView(false); // Reset geo view when switching categories
    setActiveUrl(item.url);
    setCategoryName(item.name);
  };

  const handleGeoClick = () => {
    setIsGeoView(true);
    setCategoryName("Restricted");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        
        {/* LEFT SIDE: LOGO & MAIN NAV */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer group" 
            onClick={() => window.location.href = '/'}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-green shadow-[0_0_15px_rgba(34,197,94,0.4)] transition-transform group-hover:scale-110">
              <Tv className="h-5 w-5 text-black stroke-[2.5]" />
            </div>
            <span className="text-xl font-black italic tracking-tighter text-white uppercase">E-Live</span>
          </div>

          {/* DESKTOP MENU ITEMS */}
          <div className="hidden items-center gap-1 lg:flex border-l border-white/10 ml-2 pl-6">
            {navItems.map((item) => {
              const IconComponent = IconMap[item.icon] || MonitorPlay;
              const isActive = categoryName === item.name && !isGeoView;

              return (
                <button
                  key={item.name}
                  onClick={() => handleCategoryClick(item)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-brand-green text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}

            {/* GEO-BLOCKED TOGGLE BUTTON */}
            <button 
              onClick={handleGeoClick}
              className={`ml-4 flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                isGeoView 
                  ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'text-zinc-500 border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <GlobeLock className="h-4 w-4" />
              Geo-Blocked
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: UTILITIES */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
          </button>
          
          <button className="relative rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand-green ring-2 ring-black"></span>
          </button>

          {/* User Profile Dummy */}
          <div className="ml-2 h-9 w-9 rounded-full bg-gradient-to-tr from-brand-green to-emerald-400 p-[1.5px] cursor-pointer hover:scale-105 transition-transform">
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
              ADMIN
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;