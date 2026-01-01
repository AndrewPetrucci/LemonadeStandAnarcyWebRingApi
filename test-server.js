#!/usr/bin/env node
/**
 * Test script to verify API functionality with mock data
 */

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock webring URLs for testing
const mockUrls = [
  'https://andrewpetrucci.github.io/LemonadeStandAnarcyWebRing/',
  'https://example.com/site1',
  'https://example.com/site2',
  'https://example.com/site3',
  'https://example.com/site4'
];

app.get('/next', (req, res) => {
  const currentUrl = req.query.current;
  if (!currentUrl) {
    return res.status(400).json({ error: 'Missing required parameter: current' });
  }
  const currentIndex = mockUrls.findIndex(url => url === currentUrl);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % mockUrls.length;
  res.json({ url: mockUrls[nextIndex] });
});

app.get('/previous', (req, res) => {
  const currentUrl = req.query.current;
  if (!currentUrl) {
    return res.status(400).json({ error: 'Missing required parameter: current' });
  }
  const currentIndex = mockUrls.findIndex(url => url === currentUrl);
  const prevIndex = currentIndex === -1 ? mockUrls.length - 1 : (currentIndex - 1 + mockUrls.length) % mockUrls.length;
  res.json({ url: mockUrls[prevIndex] });
});

app.get('/random', (req, res) => {
  const randomIndex = Math.floor(Math.random() * mockUrls.length);
  res.json({ url: mockUrls[randomIndex] });
});

app.get('/list', (req, res) => {
  res.json({ urls: mockUrls, count: mockUrls.length });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Lemonade Stand Anarchy WebRing API (Test Mode)',
    version: '1.0.0',
    mode: 'mock',
    endpoints: {
      '/next': 'Get next webring URL (requires ?current=URL parameter)',
      '/previous': 'Get previous webring URL (requires ?current=URL parameter)',
      '/random': 'Get random webring URL',
      '/list': 'Get all webring URLs'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Mock data loaded:', mockUrls.length, 'URLs');
});
