# 🛝 NYC Playground Explorer

A mobile-first web application for exploring all 1,015 playgrounds across New York City! Built with a colorful, kid-friendly design and interactive Mapbox map integration.

## Features

- 🗺️ **Interactive Map**: Explore playgrounds on a beautiful Mapbox map
- 🎯 **Smart Filtering**: Filter by borough, accessibility, spray showers, and sensory-friendly features  
- 📱 **Mobile-First**: Optimized for phones and tablets
- 🎨 **Kid-Friendly Design**: Bright colors and playful styling
- ♿ **Accessibility Info**: Shows wheelchair accessibility and accessible restrooms
- 💦 **Spray Shower Data**: Find playgrounds with water features for hot days
- 🧩 **Sensory-Friendly**: Identify sensory-friendly playground options

## Quick Start

### Local Development

1. **Clone the repository**
```bash
git clone your-repo-url
cd nycPlaygroundExplorer2
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up your Mapbox token**
   - Get a free token at [mapbox.com](https://account.mapbox.com/access-tokens/)
   - Copy `.env.example` to `.env`
   - Replace `your_mapbox_token_here` with your actual token

4. **Build and run locally**
```bash
npm run build
npm run serve
```

Visit `http://localhost:8000` to see your app!

### GitHub Pages Deployment with Secrets

For production deployment on GitHub Pages:

1. **Add your Mapbox token to GitHub Secrets**
   - Go to your repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `MAPBOX_ACCESS_TOKEN`
   - Value: Your Mapbox token

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on pushes to main

3. **Push your code**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Your site will be automatically built and deployed to `https://yourusername.github.io/your-repo-name`

## Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # Kid-friendly CSS styling  
├── script.template.js      # JavaScript template with token placeholder
├── script.js               # Built JavaScript file (generated)
├── build.js                # Build script for token injection
├── CombinedJSON01.json     # NYC playground data
├── .env                    # Local environment variables (gitignored)
├── .env.example            # Environment template
├── .github/workflows/      # GitHub Actions for deployment
│   └── deploy.yml          
└── package.json            # Node.js dependencies

```

## Build Process

The build system uses environment variables to securely inject your Mapbox token:

- **Development**: Token loaded from `.env` file
- **Production**: Token loaded from GitHub Secrets via `MAPBOX_ACCESS_TOKEN`

Run `npm run build` to generate `script.js` with your token injected.

## Data Source

Playground information sourced from NYC Open Data and combined with spray shower location data. The dataset includes:
- 1,015 total playgrounds across all 5 boroughs
- 420 playgrounds with spray showers  
- 761 total spray shower installations
- Accessibility and sensory-friendly designations

## Technical Details

- **Pure JavaScript** - No frameworks required
- **Mapbox GL JS** - Interactive mapping
- **CSS Grid & Flexbox** - Responsive layout
- **Mobile-first responsive design**
- **Environment-based builds** - Secure token management
- **GitHub Actions** - Automated deployment
