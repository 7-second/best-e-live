import { useState, useEffect } from 'react';
import { db } from '../../api/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { Play, Tv } from 'lucide-react';

const ChannelGrid = ({ onSelectChannel }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the "channels" collection in real-time
    const q = query(collection(db, 'channels'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setChannels(channelData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading Channels...</div>;

  return (
    <div className="px-6 lg:px-20 py-10 bg-zinc-950">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Tv className="text-brand-green" /> Live Channels
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {channels.map((channel) => (
          <button
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 transition-all hover:border-brand-green hover:scale-105"
          >
            <div className="aspect-video mb-3 flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <img 
                src={channel.logo} 
                alt={channel.name} 
                className="max-h-12 object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
              />
            </div>
            <p className="text-sm font-medium text-zinc-400 group-hover:text-white truncate">
              {channel.name}
            </p>
            <div className="absolute inset-0 flex items-center justify-center bg-brand-green/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
              <Play className="text-brand-green fill-brand-green" size={32} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChannelGrid;