const https = require('https');

module.exports = async (req, res) => {
  const { universeId } = req.query;
  
  if (!universeId) {
    return res.status(400).json({ error: 'universeId is required' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const data = await fetchAllPages(`https://games.roblox.com/v1/games/${universeId}/game-passes?limit=100`);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

function fetchAllPages(url) {
  return new Promise((resolve, reject) => {
    const allData = [];
    let nextCursor = '';

    function fetchPage() {
      let pageUrl = url;
      if (nextCursor) {
        pageUrl += `&cursor=${encodeURIComponent(nextCursor)}`;
      }

      https.get(pageUrl, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.data) {
              allData.push(...parsed.data);
            }
            if (parsed.nextPageCursor) {
              nextCursor = parsed.nextPageCursor;
              fetchPage();
            } else {
              resolve({ data: allData, nextPageCursor: null });
            }
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    }

    fetchPage();
  });
}
