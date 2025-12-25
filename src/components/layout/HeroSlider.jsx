import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { Play, Info, Loader2, MonitorPlay } from 'lucide-react';
import { db } from '../../api/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import VideoPlayer from '../player/VideoPlayer';

// Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const HeroSlider = () => {
  const [ads, setAds] = useState([]);
  const [fallbackVideo, setFallbackVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Try to fetch Ads
        const adSnapshot = await getDocs(collection(db, "advertisements"));
        const adsData = adSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (adsData.length > 0) {
          setAds(adsData);
        } else {
          // 2. If no ads, fetch the Fallback Video from 'config' collection
          const fallbackRef = doc(db, "config", "fallback");
          const fallbackSnap = await getDoc(fallbackRef);
          if (fallbackSnap.exists()) {
            setFallbackVideo(fallbackSnap.data());
          }
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-[70vh] w-full flex items-center justify-center bg-zinc-900">
        <Loader2 className="h-10 w-10 text-brand-green animate-spin" />
      </div>
    );
  }

  // --- FALLBACK MODE: Play Default Video ---
  if (ads.length === 0 && fallbackVideo) {
    return (
      <section className="relative h-[70vh] w-full bg-black overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-dark-bg via-transparent to-transparent pointer-events-none" />
        <div className="h-full w-full">
            <VideoPlayer url={fallbackVideo.videoUrl} poster="" />
        </div>
        <div className="absolute bottom-12 left-6 lg:left-20 z-20">
            <div className="flex items-center gap-2 text-brand-green mb-2">
                <MonitorPlay className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Direct Broadcast</span>
            </div>
            <h2 className="text-4xl font-black uppercase italic text-white tracking-tighter">
                {fallbackVideo.title || "E-Live Promo"}
            </h2>
        </div>
      </section>
    );
  }

  // --- ADVERTISER MODE: Show Swiper ---
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 6000 }}
        pagination={{ clickable: true }}
        className="h-full w-full"
      >
        {ads.map((ad) => (
          <SwiperSlide key={ad.id}>
            <div className="relative h-full w-full">
              <img src={ad.image} className="h-full w-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-20 max-w-3xl">
                <span className="mb-4 inline-block bg-brand-green/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-brand-green border border-brand-green/30 rounded-full w-fit">
                  {ad.tag}
                </span>
                <h2 className="text-5xl lg:text-7xl font-black italic uppercase tracking-tighter text-white">
                  {ad.title}
                </h2>
                <p className="mt-4 text-lg text-zinc-300 font-medium leading-relaxed max-w-xl">
                  {ad.desc}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroSlider;