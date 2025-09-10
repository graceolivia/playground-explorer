# 🛝 NYC Playground Explorer

A mobile-first web application for exploring all 1,015 playgrounds across New York City! Built with a colorful, kid-friendly design and interactive OpenStreetMap integration using Leaflet.

## Features

- 🗺️ **Interactive Map**: Explore playgrounds on a beautiful OpenStreetMap
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

3. **Build and run locally**
```bash
npm run build
npm run serve
```

Visit `http://localhost:8000` to see your app!

### GitHub Pages Deployment

For production deployment on GitHub Pages:

1. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: "GitHub Actions"
   - The workflow will automatically deploy on pushes to main

2. **Push your code**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Your site will be automatically built and deployed to `https://yourusername.github.io/your-repo-name`

**🎉 No API keys required!** The app uses OpenStreetMap which is completely free and open source.

## Project Structure

```
├── index.html              # Main HTML file
├── styles.css              # Kid-friendly CSS styling  
├── script.template.js      # JavaScript template
├── script.js               # Built JavaScript file (generated)
├── build.js                # Build script
├── CombinedJSON01.json     # NYC playground data
├── .github/workflows/      # GitHub Actions for deployment
│   └── deploy.yml          
└── package.json            # Node.js dependencies

```

## Build Process

The build system copies the JavaScript template to create the production file:

- **No API keys needed** - OpenStreetMap is completely free!
- **Simple build process** - Just copies template to output

Run `npm run build` to generate the final `script.js` file.

## Data Source

Playground information sourced from NYC Open Data and combined with spray shower location data. The dataset includes:
- 1,015 total playgrounds across all 5 boroughs
- 420 playgrounds with spray showers  
- 761 total spray shower installations
- Accessibility and sensory-friendly designations

## Technical Details

- **Pure JavaScript** - No frameworks required
- **Leaflet + OpenStreetMap** - Free, open-source mapping
- **CSS Grid & Flexbox** - Responsive layout
- **Mobile-first responsive design**
- **No API keys required** - Works everywhere without setup
- **GitHub Actions** - Automated deployment
