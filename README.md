# LemonadeStandAnarcyWebRingApi

Simple API for getting web ring endpoints from a Google Sheet.

## Features

- **Google Sheets Integration**: Automatically fetches webring URLs from a Google Sheet
- **RESTful API**: Four endpoints for navigating the webring
- **Caching**: 5-minute cache to reduce API calls to Google Sheets
- **CORS Enabled**: Can be called from any website
- **Easy Deployment**: Deploy to Vercel, Heroku, or any Node.js hosting platform

## API Endpoints

### 1. GET `/next`
Get the next webring URL in the sequence.

**Query Parameters:**
- `current` (required): The current URL

**Example:**
```bash
curl "http://localhost:3000/next?current=https://andrewpetrucci.github.io/LemonadeStandAnarcyWebRing/"
```

**Response:**
```json
{
  "url": "https://example.com/nextsite"
}
```

### 2. GET `/previous`
Get the previous webring URL in the sequence.

**Query Parameters:**
- `current` (required): The current URL

**Example:**
```bash
curl "http://localhost:3000/previous?current=https://andrewpetrucci.github.io/LemonadeStandAnarcyWebRing/"
```

**Response:**
```json
{
  "url": "https://example.com/previoussite"
}
```

### 3. GET `/random`
Get a random webring URL.

**Example:**
```bash
curl "http://localhost:3000/random"
```

**Response:**
```json
{
  "url": "https://example.com/randomsite"
}
```

### 4. GET `/list`
Get all webring URLs.

**Example:**
```bash
curl "http://localhost:3000/list"
```

**Response:**
```json
{
  "urls": [
    "https://andrewpetrucci.github.io/LemonadeStandAnarcyWebRing/",
    "https://example.com/site1",
    "https://example.com/site2"
  ],
  "count": 3
}
```

## Setup

### Prerequisites
- Node.js 14 or higher
- A Google Cloud Platform account
- A Google Sheet with webring URLs

### Google Sheets Setup

1. **Create a Google Sheet** with your webring URLs in column A (one URL per row)
   - Example: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit

2. **Make the sheet publicly readable:**
   - Click "Share" in the top-right
   - Change "Restricted" to "Anyone with the link"
   - Set permission to "Viewer"

3. **Get a Google API Key:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Create a new project (or select an existing one)
   - Click "Create Credentials" → "API Key"
   - Restrict the key to "Google Sheets API" (recommended)
   - Copy the API key

4. **Enable Google Sheets API:**
   - Go to https://console.cloud.google.com/apis/library
   - Search for "Google Sheets API"
   - Click "Enable"

### Local Development

1. **Clone the repository:**
```bash
git clone https://github.com/AndrewPetrucci/LemonadeStandAnarcyWebRingApi.git
cd LemonadeStandAnarcyWebRingApi
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```
GOOGLE_API_KEY=your-google-api-key-here
GOOGLE_SHEET_ID=your-google-sheet-id-here
SHEET_RANGE=Sheet1!A:A
PORT=3000
```

4. **Start the server:**
```bash
npm start
```

The API will be available at `http://localhost:3000`

## Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Create a `vercel.json` file** (already included in this repo):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "index.js"
    }
  ]
}
```

3. **Deploy:**
```bash
vercel
```

4. **Set environment variables in Vercel:**
```bash
vercel env add GOOGLE_API_KEY
vercel env add GOOGLE_SHEET_ID
vercel env add SHEET_RANGE
```

Or set them in the Vercel dashboard under Settings → Environment Variables.

5. **Deploy to production:**
```bash
vercel --prod
```

Your API will be available at `https://your-project.vercel.app`

### Deploy to Heroku

1. **Install Heroku CLI** and login:
```bash
heroku login
```

2. **Create a new Heroku app:**
```bash
heroku create your-webring-api
```

3. **Set environment variables:**
```bash
heroku config:set GOOGLE_API_KEY=your-google-api-key-here
heroku config:set GOOGLE_SHEET_ID=your-google-sheet-id-here
heroku config:set SHEET_RANGE=Sheet1!A:A
```

4. **Deploy:**
```bash
git push heroku main
```

Your API will be available at `https://your-webring-api.herokuapp.com`

### Deploy to Railway

1. **Create account at https://railway.app**

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select your repository**

4. **Add environment variables** in the Variables tab:
   - `GOOGLE_API_KEY`
   - `GOOGLE_SHEET_ID`
   - `SHEET_RANGE`

5. **Deploy!** Railway will automatically detect the Node.js app and deploy it.

### Deploy to any Node.js host

This API can be deployed to any platform that supports Node.js:
- DigitalOcean App Platform
- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service
- Render
- Fly.io

Just ensure you:
1. Install dependencies with `npm install`
2. Set the environment variables
3. Run `npm start`

## Usage in Your Webring

Add navigation to your webring page:

```html
<script>
  const API_URL = 'https://your-api-url.vercel.app';
  const CURRENT_URL = window.location.href;

  async function navigate(direction) {
    try {
      const response = await fetch(`${API_URL}/${direction}?current=${encodeURIComponent(CURRENT_URL)}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
</script>

<button onclick="navigate('previous')">← Previous</button>
<button onclick="navigate('random')">🎲 Random</button>
<button onclick="navigate('next')">Next →</button>
```

## License

ISC
