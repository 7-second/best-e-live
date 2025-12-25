import { useState, useEffect } from 'react';
import { parseM3U } from '../utils/m3uParser';

export const useChannels = (url) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchChannels = async () => {
      setLoading(true);
      try {
        // We use a CORS proxy to prevent the browser from blocking the request
        const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxy);
        const text = await response.text();
        const parsedData = parseM3U(text);
        setChannels(parsedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [url]);

  return { channels, loading, error };
};