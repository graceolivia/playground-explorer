# NYC Playground Explorer

A small playground explorer aggregated from NYC Open Data and enhanced with my own reviews.

## How to Run Locally

1. Clone this repository
2. Navigate to the project directory
3. Start a local web server:
   - **Python 3:** `python3 -m http.server 8000`
   - **Python 2:** `python -m SimpleHTTPServer 8000`
   - **Node.js:** `npx http-server -p 8000`
   - **PHP:** `php -S localhost:8000`
4. Open your browser and go to `http://localhost:8000`
5. The application will load and display an interactive map of NYC playgrounds

## Requirements

- A modern web browser with JavaScript enabled
- Internet connection (for loading map tiles and external libraries)
- Python, Node.js, or PHP installed (for running local server)

## Files

- `index.html` - Main application file
- `script.js` - Application logic and map functionality
- `style.css` - Styling for the application
- `CombinedJSON03.updated_deduped.json` - Playground data from NYC Open Data with custom reviews