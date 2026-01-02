# Quick Start Guide

## 1. Set Up Your Google Sheet

1. Create a new Google Sheet
2. Add webring URLs in column A (one per row):
   ```
   https://andrewpetrucci.github.io/LemonadeStandAnarcyWebRing/
   https://example.com/site1
   https://example.com/site2
   ```
3. Click "Share" → "Anyone with the link" → "Viewer"
4. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`

## 2. Get Google API Key

1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new project (or select existing)
3. Click "Create Credentials" → "API Key"
4. Copy the key
5. Enable Google Sheets API at https://console.cloud.google.com/apis/library

## 3. Deploy

### Option A: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables
vercel env add GOOGLE_API_KEY
vercel env add GOOGLE_SHEET_ID

# Deploy to production
vercel --prod
```

### Option B: Heroku

```bash
# Create app
heroku create your-app-name

# Set environment variables
heroku config:set GOOGLE_API_KEY=your-key
heroku config:set GOOGLE_SHEET_ID=your-sheet-id

# Deploy
git push heroku main
```

### Option C: Local Development

```bash
# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Edit .env with your credentials
# Then start the server
npm start
```

## 4. Use the API

Your API will be available at the deployment URL. Test it:

```bash
# List all URLs
curl https://your-api.vercel.app/list

# Get next URL
curl "https://your-api.vercel.app/next?current=YOUR_CURRENT_URL"

# Get random URL
curl https://your-api.vercel.app/random
```

## 5. Add to Your Website

```html
<script>
  const API_URL = 'https://your-api.vercel.app';
  const CURRENT_URL = window.location.href;
  
  async function next() {
    const res = await fetch(`${API_URL}/next?current=${encodeURIComponent(CURRENT_URL)}`);
    const data = await res.json();
    window.location.href = data.url;
  }
</script>

<button onclick="next()">Next Site →</button>
```

Done! 🎉
