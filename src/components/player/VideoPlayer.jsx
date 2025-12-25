import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ url, poster }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;
    if (videoRef.current) {
      const video = videoRef.current;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
      } else if (Hls.isSupported()) {
        // Hls.js support (Chrome, Firefox, etc.)
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/5 bg-black shadow-2xl">
      <video
        ref={videoRef}
        poster={poster}
        controls
        autoPlay
        className="h-full w-full object-contain"
      />
    </div>
  );
};

export default VideoPlayer;