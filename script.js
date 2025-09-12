// Simple NYC Playground Explorer

let map;
let playgrounds = [];
let filteredPlaygrounds = [];
let markerClusterGroup;

// Initialize the map
function initMap() {
    // Create map centered on NYC
    map = L.map('map').setView([40.7884, -73.8857], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Load playground data
    loadPlaygrounds();
    
    // Setup filter event listeners
    setupFilters();
}

// Load playground data from JSON
async function loadPlaygrounds() {
    try {
        const response = await fetch('./CombinedJSON01.json');
        const data = await response.json();
        playgrounds = data.playgrounds;
        filteredPlaygrounds = [...playgrounds]; // Start with all playgrounds
        
        console.log(`Loaded ${playgrounds.length} playgrounds`);
        addPlaygroundMarkers();
        updateResultsCount();
        
    } catch (error) {
        console.error('Error loading playground data:', error);
        document.getElementById('results-count').textContent = 'Error loading playground data';
    }
}

// Add playground markers with clustering
function addPlaygroundMarkers() {
    // Remove existing markers
    if (markerClusterGroup) {
        map.removeLayer(markerClusterGroup);
    }
    
    // Create marker cluster group
    markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50
    });
    
    // Add markers for filtered playgrounds
    filteredPlaygrounds.forEach(playground => {
        const lat = parseFloat(playground.lat);
        const lon = parseFloat(playground.lon);
        
        // Skip if coordinates are invalid
        if (isNaN(lat) || isNaN(lon)) return;
        
        // Create marker
        const marker = L.marker([lat, lon]);
        
        // Create popup content with more details
        const popupContent = createPopupContent(playground);
        marker.bindPopup(popupContent);
        
        // Add marker to cluster group
        markerClusterGroup.addLayer(marker);
    });
    
    // Add cluster group to map
    map.addLayer(markerClusterGroup);
}

// Create detailed popup content
function createPopupContent(playground) {
    const features = [];
    
    // Add bathroom info
    if (playground.ADA_Accessible_Comfort_Station === 'Accessible') {
        features.push('🚻 Accessible Bathrooms');
    } else if (playground.ADA_Accessible_Comfort_Station === 'Not Accessible') {
        features.push('🚻 Non-Accessible Bathrooms');
    }
    
    // Add sensory-friendly info
    if (playground['Sensory-Friendly'] === 'Y') {
        features.push('🧩 Sensory-Friendly');
    }
    
    // Add spray shower info
    if (playground.has_spray_showers) {
        features.push(`💦 ${playground.spray_shower_count} Spray Shower${playground.spray_shower_count !== 1 ? 's' : ''}`);
    }
    
    return `
        <div>
            <h3>${playground.Name}</h3>
            <p><strong>Location:</strong> ${playground.Location}</p>
            <p><strong>Borough:</strong> ${getBoroughName(playground.Prop_ID[0])}</p>
            ${features.length > 0 ? `<div style="margin-top: 8px; font-size: 0.9em; color: #666;">${features.join('<br>')}</div>` : ''}
        </div>
    `;
}

// Setup filter event listeners
function setupFilters() {
    const bathroomRadios = document.querySelectorAll('input[name="bathroom"]');
    const sensoryFilter = document.getElementById('sensory-filter');
    const sprayFilter = document.getElementById('spray-filter');
    const clearButton = document.getElementById('clear-filters');
    
    // Add event listeners
    bathroomRadios.forEach(radio => radio.addEventListener('change', applyFilters));
    sensoryFilter.addEventListener('click', toggleButton);
    sprayFilter.addEventListener('click', toggleButton);
    clearButton.addEventListener('click', clearFilters);
}

// Handle toggle button clicks
function toggleButton(event) {
    const button = event.target;
    const isActive = button.getAttribute('data-active') === 'true';
    button.setAttribute('data-active', !isActive);
    applyFilters();
}

// Apply filters to playground data
function applyFilters() {
    const checkedBathroom = document.querySelector('input[name="bathroom"]:checked');
    const bathroomValue = checkedBathroom ? checkedBathroom.value : '';
    const sensoryChecked = document.getElementById('sensory-filter').getAttribute('data-active') === 'true';
    const sprayChecked = document.getElementById('spray-filter').getAttribute('data-active') === 'true';
    
    filteredPlaygrounds = playgrounds.filter(playground => {
        // Bathroom filter
        if (bathroomValue === 'has-bathroom') {
            // Show any playground with bathrooms (accessible or not accessible)
            if (playground.ADA_Accessible_Comfort_Station === 'No' || !playground.ADA_Accessible_Comfort_Station) {
                return false;
            }
        } else if (bathroomValue === 'Accessible') {
            // Show only accessible bathrooms
            if (playground.ADA_Accessible_Comfort_Station !== 'Accessible') {
                return false;
            }
        }
        
        // Sensory-friendly filter
        if (sensoryChecked && playground['Sensory-Friendly'] !== 'Y') {
            return false;
        }
        
        // Spray shower filter
        if (sprayChecked && !playground.has_spray_showers) {
            return false;
        }
        
        return true;
    });
    
    // Update map and UI
    addPlaygroundMarkers();
    updateResultsCount();
}

// Clear all filters
function clearFilters() {
    // Clear radio buttons
    const bathroomRadios = document.querySelectorAll('input[name="bathroom"]');
    bathroomRadios.forEach(radio => radio.checked = false);
    
    // Clear toggle buttons
    document.getElementById('sensory-filter').setAttribute('data-active', 'false');
    document.getElementById('spray-filter').setAttribute('data-active', 'false');
    
    // Reset to show all playgrounds
    filteredPlaygrounds = [...playgrounds];
    addPlaygroundMarkers();
    updateResultsCount();
}

// Update results count display
function updateResultsCount() {
    const count = filteredPlaygrounds.length;
    const total = playgrounds.length;
    const resultsElement = document.getElementById('results-count');
    
    if (count === total) {
        resultsElement.textContent = `Showing all ${total} playgrounds`;
    } else {
        resultsElement.textContent = `Showing ${count} of ${total} playgrounds`;
    }
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