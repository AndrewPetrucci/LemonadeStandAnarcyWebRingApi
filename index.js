require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static pictures from the pictures directory
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

// In-memory cache for webring URLs
let webringUrls = [];
let lastFetched = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const RANGE = process.env.SHEET_RANGE || 'Sheet1!A:A'; // Default to column A

/**
 * Fetch webring URLs from Google Sheets
 */
async function fetchWebringUrls() {
  try {
    // Check if we have cached data that's still fresh
    if (webringUrls.length > 0 && lastFetched && (Date.now() - lastFetched < CACHE_DURATION)) {
      return webringUrls;
    }

    // Use API key authentication for public sheets
    const sheets = google.sheets({ version: 'v4', auth: process.env.GOOGLE_API_KEY });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      // Filter out empty rows and get first column values
      webringUrls = rows
        .map(row => row[0])
        .filter(url => url && url.trim())
        .map(url => url.trim());

      lastFetched = Date.now();
      console.log(`Fetched ${webringUrls.length} webring URLs from Google Sheets`);
    } else {
      console.log('No data found in Google Sheets');
      webringUrls = [];
    }

    return webringUrls;
  } catch (error) {
    console.error('Error fetching from Google Sheets:', error.message);
    // Return cached data if available, otherwise empty array
    return webringUrls.length > 0 ? webringUrls : [];
  }
}

/**
 * GET /next - Get the next webring URL
 * Query parameter: current (the current URL)
 */
app.get('/next', async (req, res) => {
  try {
    const currentUrl = req.query.current;

    if (!currentUrl) {
      return res.status(400).json({ error: 'Missing required parameter: current' });
    }

    const urls = await fetchWebringUrls();

    if (urls.length === 0) {
      return res.status(404).json({ error: 'No webring URLs available' });
    }

    // Find current URL in the list
    const currentIndex = urls.findIndex(url => url === currentUrl);

    if (currentIndex === -1) {
      // Current URL not found, return first URL
      return res.json({ url: urls[0] });
    }

    // Get next URL (wrap around to first if at end)
    const nextIndex = (currentIndex + 1) % urls.length;
    res.json({ url: urls[nextIndex] });
  } catch (error) {
    console.error('Error in /next endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /previous - Get the previous webring URL
 * Query parameter: current (the current URL)
 */
app.get('/previous', async (req, res) => {
  try {
    const currentUrl = req.query.current;

    if (!currentUrl) {
      return res.status(400).json({ error: 'Missing required parameter: current' });
    }

    const urls = await fetchWebringUrls();

    if (urls.length === 0) {
      return res.status(404).json({ error: 'No webring URLs available' });
    }

    // Find current URL in the list
    const currentIndex = urls.findIndex(url => url === currentUrl);

    if (currentIndex === -1) {
      // Current URL not found, return last URL
      return res.json({ url: urls[urls.length - 1] });
    }

    // Get previous URL (wrap around to last if at beginning)
    const previousIndex = (currentIndex - 1 + urls.length) % urls.length;
    res.json({ url: urls[previousIndex] });
  } catch (error) {
    console.error('Error in /previous endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /random - Get a random webring URL
 */
app.get('/random', async (req, res) => {
  try {
    const urls = await fetchWebringUrls();

    if (urls.length === 0) {
      return res.status(404).json({ error: 'No webring URLs available' });
    }

    // Get random URL
    const randomIndex = Math.floor(Math.random() * urls.length);
    res.json({ url: urls[randomIndex] });
  } catch (error) {
    console.error('Error in /random endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /list - Get all webring URLs
 */
app.get('/list', async (req, res) => {
  try {
    const urls = await fetchWebringUrls();
    res.json({ urls, count: urls.length });
  } catch (error) {
    console.error('Error in /list endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /pictures/list - Get all pictures in the pictures directory
 */
app.get('/pictures/list', (req, res) => {
  try {
    const picturesDir = path.join(__dirname, 'pictures');

    if (!fs.existsSync(picturesDir)) {
      return res.status(404).json({ error: 'Pictures directory not found' });
    }

    const files = fs.readdirSync(picturesDir);
    const pictureFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });

    const pictures = pictureFiles.map(file => ({
      filename: file,
      url: `/pictures/${file}`
    }));

    res.json({ pictures, count: pictures.length });
  } catch (error) {
    console.error('Error in /pictures/list endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET / - Health check and API info
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Lemonade Stand Anarchy WebRing API',
    version: '1.0.0',
    endpoints: {
      '/next': 'Get next webring URL (requires ?current=URL parameter)',
      '/previous': 'Get previous webring URL (requires ?current=URL parameter)',
      '/random': 'Get random webring URL',
      '/list': 'Get all webring URLs',
      '/pictures/:filename': 'Get a specific picture from the pictures directory',
      '/pictures/list': 'Get all available pictures'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`WebRing API server running on port ${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  GET /next?current=URL`);
  console.log(`  GET /previous?current=URL`);
  console.log(`  GET /random`);
  console.log(`  GET /list`);
});
