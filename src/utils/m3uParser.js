/* eslint-disable no-restricted-globals */
self.onmessage = async (e) => {
  const { url, limit } = e.data;
  try {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
    const text = await response.text();
    const lines = text.split('\n');
    const channels = [];
    let currentChannel = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const name = line.split(',').pop() || "Unknown";
        const logoMatch = line.match(/tvg-logo="([^"]*)"/);
        currentChannel = { name: name.trim(), logo: logoMatch ? logoMatch[1] : '' };
      } else if (line.startsWith('http') && currentChannel) {
        currentChannel.url = line;
        channels.push(currentChannel);
        currentChannel = null;
        
        // Send first 20 channels to UI immediately
        if (limit && channels.length === limit) {
          self.postMessage({ type: 'PARTIAL', channels, url });
        }
      }
    }
    // Send the final complete list
    self.postMessage({ type: 'FULL', channels, url });
  } catch (err) {
    self.postMessage({ type: 'ERROR', error: err.message });
  }
};