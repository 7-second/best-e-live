import { useState, useEffect } from 'react';

export const useGeoCheck = (channels) => {
  const [validChannels, setValidChannels] = useState([]);
  const [blockedChannels, setBlockedChannels] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!channels || channels.length === 0) return;

    const checkStreams = async () => {
      setIsChecking(true);
      const valid = [];
      const blocked = [];

      // We only check the first 20 channels to save performance, 
      // or you can check all if the list is small.
      const listToCheck = channels.slice(0, 50); 

      await Promise.all(
        listToCheck.map(async (channel) => {
          try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000); // 3 second timeout

            const response = await fetch(channel.url, { 
              method: 'HEAD', 
              mode: 'no-cors',
              signal: controller.signal 
            });
            
            valid.push(channel);
          } catch (error) {
            blocked.push({ ...channel, reason: "Geo-Blocked or Offline" });
          }
        })
      );

      setValidChannels(valid);
      setBlockedChannels(blocked);
      setIsChecking(false);
    };

    checkStreams();
  }, [channels]);

  return { validChannels, blockedChannels, isChecking };
};