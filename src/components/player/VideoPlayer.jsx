import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { FourSquare } from "react-loading-indicators";

export default function VideoPlayer({ url }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    setLoading(true);
    setError(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video.load();
      video.onloadeddata = () => {
        setLoading(false);
        video.play().catch(() => {});
      };
    } else if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          setError(true);
          setLoading(false);
        }
      });
    } else {
      video.src = url;
      video.play().catch(() => setLoading(false));
    }

    const onPlaying = () => setLoading(false);
    const onWaiting = () => setLoading(true);
    const onError = () => {
      setError(true);
      setLoading(false);
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("error", onError);

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("error", onError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden flex justify-center">
      {/* Video */}
     <video
  ref={videoRef}
  className="w-full max-w-full h-auto"
  autoPlay
  muted
  playsInline
  preload="auto"
/>

      {/* Loading */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <FourSquare color="#32cd32" size="medium" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <span className="text-red-500 text-sm font-bold">Stream unavailable</span>
        </div>
      )}
    </div>
  );
}
