// Simple NYC Playground Explorer

let map;
let playgrounds = [];

// Initialize the map
function initMap() {
    // Create map centered on NYC
    map = L.map('map').setView([40.7484, -73.9857], 11);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Load playground data
    loadPlaygrounds();
}

// Load playground data from JSON
async function loadPlaygrounds() {
    try {
        const response = await fetch('./CombinedJSON01.json');
        const data = await response.json();
        playgrounds = data.playgrounds;
        
        console.log(`Loaded ${playgrounds.length} playgrounds`);
        addPlaygroundMarkers();
        
    } catch (error) {
        console.error('Error loading playground data:', error);
    }
}

// Add playground markers with clustering
function addPlaygroundMarkers() {
    // Create marker cluster group
    const markers = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50
    });
    
    // Add markers for each playground
    playgrounds.forEach(playground => {
        const lat = parseFloat(playground.lat);
        const lon = parseFloat(playground.lon);
        
        // Skip if coordinates are invalid
        if (isNaN(lat) || isNaN(lon)) return;
        
        // Create marker
        const marker = L.marker([lat, lon]);
        
        // Add popup with basic info
        marker.bindPopup(`
            <div>
                <h3>${playground.Name}</h3>
                <p>${playground.Location}</p>
                <p><strong>Borough:</strong> ${getBoroughName(playground.Prop_ID[0])}</p>
            </div>
        `);
        
        // Add marker to cluster group
        markers.addLayer(marker);
    });
    
    // Add cluster group to map
    map.addLayer(markers);
}

// Convert borough code to name
function getBoroughName(code) {
    const boroughs = {
        'B': 'Brooklyn',
        'Q': 'Queens', 
        'M': 'Manhattan',
        'X': 'Bronx',
        'R': 'Staten Island'
    };
    return boroughs[code] || 'Unknown';
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initMap);