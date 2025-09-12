// Simple NYC Playground Explorer

let map;
let playgrounds = [];
let filteredPlaygrounds = [];
let markerClusterGroup;
let searchMarker = null;
let searchLocation = null;

// Initialize the map
function initMap() {
    // Create map centered on NYC
    map = L.map('map').setView([40.7884, -73.8857], 12);
    
    // Add Mapbox custom style tiles
    L.tileLayer('https://api.mapbox.com/styles/v1/laramie/cmf8k94as004501qs1ao0e8n0/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibGFyYW1pZSIsImEiOiJja2VvZWtsYnExYWppMnltc3ZrMW45dHB1In0.Oc0kzrEhq7ZfdPSBWIpHzQ', {
        attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map);
    
    // Load playground data
    loadPlaygrounds();
    
    // Setup filter event listeners
    setupFilters();
    
    // Setup address search
    setupAddressSearch();
}

// Load playground data from JSON
async function loadPlaygrounds() {
    try {
        const response = await fetch('./CombinedJSON02.json');
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
    
    // Create marker cluster group with custom icon creation
    markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
            const childCount = cluster.getChildCount();
            let size, className;
            
            // Scale cluster size based on count
            if (childCount < 5) {
                size = 30;
                className = 'marker-cluster marker-cluster-small';
            } else if (childCount < 15) {
                size = 40;
                className = 'marker-cluster marker-cluster-medium';
            } else if (childCount < 30) {
                size = 50;
                className = 'marker-cluster marker-cluster-large';
            } else {
                size = 60;
                className = 'marker-cluster marker-cluster-xlarge';
            }
            
            return new L.DivIcon({
                html: '<div><span>' + childCount + '</span></div>',
                className: className,
                iconSize: new L.Point(size, size)
            });
        }
    });
    
    // Add markers for filtered playgrounds
    filteredPlaygrounds.forEach(playground => {
        const lat = parseFloat(playground.lat);
        const lon = parseFloat(playground.lon);
        
        // Skip if coordinates are invalid
        if (isNaN(lat) || isNaN(lon)) return;
        
        // Create marker with default pin
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
    
    // Add water fountain info
    if (playground.has_drinking_fountains) {
        features.push(`🚰 ${playground.drinking_fountain_count} Water Fountain${playground.drinking_fountain_count !== 1 ? 's' : ''}`);
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
    const fountainFilter = document.getElementById('fountain-filter');
    const clearButton = document.getElementById('clear-filters');
    
    // Add event listeners
    bathroomRadios.forEach(radio => radio.addEventListener('change', applyFilters));
    sensoryFilter.addEventListener('click', toggleButton);
    sprayFilter.addEventListener('click', toggleButton);
    fountainFilter.addEventListener('click', toggleButton);
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
    const fountainChecked = document.getElementById('fountain-filter').getAttribute('data-active') === 'true';
    
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
        
        // Water fountain filter
        if (fountainChecked && !playground.has_drinking_fountains) {
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
    document.getElementById('fountain-filter').setAttribute('data-active', 'false');
    
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

// Setup address search functionality
function setupAddressSearch() {
    const addressInput = document.getElementById('address-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', searchAddress);
    addressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAddress();
        }
    });
}

// Search for address and show nearby playgrounds
async function searchAddress() {
    const address = document.getElementById('address-input').value.trim();
    if (!address) return;
    
    try {
        // Use Mapbox Geocoding API to get coordinates
        const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=pk.eyJ1IjoibGFyYW1pZSIsImEiOiJja2VvZWtsYnExYWppMnltc3ZrMW45dHB1In0.Oc0kzrEhq7ZfdPSBWIpHzQ&proximity=-73.9857,40.7484&country=us`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            searchLocation = { lat, lng };
            
            // Add search marker
            addSearchMarker(lat, lng, data.features[0].place_name);
            
            // Zoom to location
            map.setView([lat, lng], 15);
            
            // Filter nearby playgrounds
            filterNearbyPlaygrounds(lat, lng);
            
        } else {
            alert('Address not found. Please try a different address.');
        }
        
    } catch (error) {
        console.error('Geocoding error:', error);
        alert('Error searching for address. Please try again.');
    }
}

// Add search location marker
function addSearchMarker(lat, lng, address) {
    // Remove existing search marker
    if (searchMarker) {
        map.removeLayer(searchMarker);
    }
    
    // Create custom search marker with yellow star
    const searchIcon = L.divIcon({
        className: 'search-marker',
        html: '⭐',
        iconSize: [40, 40],
        iconAnchor: [10, 10]
    });
    
    searchMarker = L.marker([lat, lng], { icon: searchIcon })
        .addTo(map)
        .bindTooltip(`Starting location: ${address}`, {
            permanent: false,
            direction: 'top',
            offset: [0, -10]
        });
}

// Filter playgrounds within selected distance
function filterNearbyPlaygrounds(searchLat, searchLng) {
    const selectedDistance = document.querySelector('input[name="distance"]:checked').value;
    const maxDistance = parseFloat(selectedDistance);
    
    // Calculate distances and filter
    const nearbyPlaygrounds = playgrounds.filter(playground => {
        const lat = parseFloat(playground.lat);
        const lng = parseFloat(playground.lon);
        
        if (isNaN(lat) || isNaN(lng)) return false;
        
        const distance = calculateDistance(searchLat, searchLng, lat, lng);
        playground.distanceFromSearch = distance;
        
        return distance <= maxDistance;
    });
    
    // Sort by distance
    nearbyPlaygrounds.sort((a, b) => a.distanceFromSearch - b.distanceFromSearch);
    
    // Update filtered playgrounds and map
    filteredPlaygrounds = nearbyPlaygrounds;
    addPlaygroundMarkers();
    updateResultsCount();
    
    // Update results text to show search context
    const count = filteredPlaygrounds.length;
    const resultsElement = document.getElementById('results-count');
    
    // Convert distance to walking time
    const walkingTimes = {
        0.25: '5 minute walk',
        0.5: '10 minute walk', 
        0.75: '15 minute walk',
        1: '20 minute walk'
    };
    const walkingTime = walkingTimes[maxDistance] || `${maxDistance} mile${maxDistance !== 1 ? 's' : ''}`;
    
    if (count > 0) {
        resultsElement.textContent = `Found ${count} playground${count !== 1 ? 's' : ''} within a ${walkingTime}`;
    } else {
        resultsElement.textContent = `No playgrounds found within a ${walkingTime}`;
    }
}

// Calculate distance between two points in miles
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initMap);