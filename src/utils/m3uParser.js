export const parseM3U = (data) => {
  const lines = data.split('\n');
  const channels = [];
  let currentChannel = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      // Extract Logo using regex
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      // Extract Name (everything after the last comma)
      const nameParts = line.split(',');
      const name = nameParts[nameParts.length - 1].trim();

      currentChannel = {
        name: name || 'Unknown Channel',
        logo: logoMatch ? logoMatch[1] : 'https://via.placeholder.com/150?text=TV',
      };
    } else if (line.startsWith('http')) {
      currentChannel.url = line;
      // Only add if we have a name and URL
      if (currentChannel.name && currentChannel.url) {
        channels.push(currentChannel);
      }
      currentChannel = {};
    }
  }
  return channels;
};