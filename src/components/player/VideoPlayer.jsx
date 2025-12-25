import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { FourSquare } from "react-loading-indicators";

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = AUTO

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setLoading(true);
    setError(false);
    setLevels([]);
    setCurrentLevel(-1);

    if (Hls.isSupported()) {
      const hls = new Hls({ 
        enableWorker: true, 
        lowLatencyMode: true,
        backBufferLength: 60 
      });
      
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels || []);
        setLoading(false);
        video.play().catch(() => {
          console.log("Autoplay prevented; user interaction required.");
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(true);
          setLoading(false);
        }
      });

      return () => {
        if (hlsRef.current) hlsRef.current.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.addEventListener("loadeddata", () => setLoading(false));
      video.addEventListener("error", () => setError(true));
    }
  }, [url]);

  const changeQuality = (levelIndex) => {
    setCurrentLevel(levelIndex);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">
      {/* VIDEO ELEMENT */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
      />

      {/* QUALITY SELECTOR - Always Visible */}
      {levels.length > 0 && (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-1">
          <span className="text-[10px] font-black text-zinc-400 uppercase">Quality:</span>
          <select
            className="bg-zinc-900/90 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl border border-emerald-500/50 outline-none cursor-pointer hover:border-emerald-500 transition-colors"
            value={currentLevel}
            onChange={(e) => changeQuality(Number(e.target.value))}
          >
            <option value={-1}>⚡ Auto</option>
            {levels.map((level, index) => (
              <option key={index} value={index}>
                {level.height ? `${level.height}p` : `Level ${index}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* LOADING STATE */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-40">
          <FourSquare color="#10b981" size="medium" />
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-40 gap-4">
          <div className="p-4 rounded-full bg-red-500/10">
            <span className="text-red-500 text-sm font-black uppercase tracking-widest">
              Stream Offline
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
