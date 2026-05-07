const https = require('https');

module.exports = async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const data = await fetchAllPages(`https://games.roblox.com/v1/users/${userId}/games?accessFilter=Public&limit=50`);
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
              resolve({ data: allData });
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
