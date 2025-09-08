// NYC Playground Explorer JavaScript

class PlaygroundExplorer {
    constructor() {
        this.playgrounds = [];
        this.filteredPlaygrounds = [];
        this.map = null;
        this.markers = [];
        this.currentPopup = null;
        
        // Mapbox token will be injected during build process
        this.mapboxToken = 'pk.eyJ1IjoibGFyYW1pZSIsImEiOiJja2VvZWtsYnExYWppMnltc3ZrMW45dHB1In0.Oc0kzrEhq7ZfdPSBWIpHzQ';
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadPlaygroundData();
            this.initMap();
            this.setupEventListeners();
            this.displayWelcomeStats();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to load playground data. Please refresh the page.');
        }
    }
    
    async loadPlaygroundData() {
        const response = await fetch('./CombinedJSON01.json');
        const data = await response.json();
        this.playgrounds = data.playgrounds;
        this.filteredPlaygrounds = [...this.playgrounds];
        console.log(`Loaded ${this.playgrounds.length} playgrounds`);
    }
    
    initMap() {
        // Check if Mapbox token is set
        if (this.mapboxToken === '{{MAPBOX_ACCESS_TOKEN}}' || this.mapboxToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
            this.showMapboxTokenError();
            return;
        }
        
        mapboxgl.accessToken = this.mapboxToken;
        
        this.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [-73.9857, 40.7484], // NYC center
            zoom: 10,
            attributionControl: false
        });
        
        this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        this.map.addControl(new mapboxgl.AttributionControl({
            compact: true
        }));
        
        this.map.on('load', () => {
            this.addPlaygroundMarkers();
        });
    }
    
    showMapboxTokenError() {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: linear-gradient(135deg, #87CEEB, #98FB98); color: #343A40; text-align: center; padding: 2rem;">
                <div>
                    <h3 style="color: #4A90E2; margin-bottom: 1rem; font-family: 'Fredoka', cursive;">🗝️ Mapbox Token Required</h3>
                    <p style="margin-bottom: 1rem; line-height: 1.5;">To view the interactive map, you'll need a free Mapbox token.</p>
                    <p style="margin-bottom: 1rem; font-size: 0.9rem; color: #6C757D;">
                        1. Get a free token at <a href="https://account.mapbox.com/access-tokens/" target="_blank" style="color: #4A90E2;">mapbox.com</a><br>
                        2. Set MAPBOX_ACCESS_TOKEN in your .env file<br>
                        3. Run <code>npm run build</code>
                    </p>
                    <p style="font-size: 0.8rem; color: #6C757D;">The filters below will still work! 🎯</p>
                </div>
            </div>
        `;
    }
    
    addPlaygroundMarkers() {
        this.clearMarkers();
        
        this.filteredPlaygrounds.forEach(playground => {
            const lat = parseFloat(playground.lat);
            const lon = parseFloat(playground.lon);
            
            if (isNaN(lat) || isNaN(lon)) return;
            
            // Create custom marker element
            const markerElement = document.createElement('div');
            markerElement.className = 'custom-marker';
            markerElement.innerHTML = '🛝';
            markerElement.style.cssText = `
                width: 30px;
                height: 30px;
                font-size: 20px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                border: 3px solid #FFD23F;
                border-radius: 50%;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: transform 0.2s ease;
            `;
            
            markerElement.addEventListener('mouseenter', () => {
                markerElement.style.transform = 'scale(1.2)';
            });
            
            markerElement.addEventListener('mouseleave', () => {
                markerElement.style.transform = 'scale(1)';
            });
            
            const marker = new mapboxgl.Marker(markerElement)
                .setLngLat([lon, lat])
                .addTo(this.map);
            
            markerElement.addEventListener('click', () => {
                this.showPlaygroundDetails(playground);
                this.showPlaygroundPopup(playground, marker);
            });
            
            this.markers.push(marker);
        });
    }
    
    showPlaygroundPopup(playground, marker) {
        if (this.currentPopup) {
            this.currentPopup.remove();
        }
        
        const features = [];
        if (playground.Accessible === 'Yes') features.push('<span class="feature-tag accessible">♿ Accessible</span>');
        if (playground.has_spray_showers) features.push('<span class="feature-tag spray">💦 Spray Showers</span>');
        if (playground['Sensory-Friendly'] === 'Y') features.push('<span class="feature-tag sensory">🧩 Sensory-Friendly</span>');
        if (playground.ADA_Accessible_Comfort_Station === 'Accessible') features.push('<span class="feature-tag bathroom">🚻 Accessible Bathrooms</span>');
        else if (playground.ADA_Accessible_Comfort_Station === 'Not Accessible') features.push('<span class="feature-tag bathroom">🚻 Bathrooms</span>');
        
        const popupContent = `
            <div style="max-width: 250px;">
                <h4 style="margin: 0 0 8px 0; color: #4A90E2; font-family: 'Fredoka', cursive;">${playground.Name}</h4>
                <p style="margin: 0 0 8px 0; font-size: 0.85rem; color: #6C757D;">${playground.Location}</p>
                ${features.length > 0 ? `<div style="display: flex; gap: 4px; flex-wrap: wrap;">${features.join('')}</div>` : ''}
            </div>
        `;
        
        this.currentPopup = new mapboxgl.Popup({
            offset: 35,
            closeOnClick: true,
            className: 'playground-popup'
        })
        .setHTML(popupContent)
        .addTo(this.map);
        
        marker.setPopup(this.currentPopup);
        this.currentPopup.addTo(this.map);
    }
    
    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
    }
    
    showPlaygroundDetails(playground) {
        const infoContainer = document.getElementById('playground-info');
        
        const features = [];
        if (playground.Accessible === 'Yes') features.push('<span class="feature-tag accessible">♿ Accessible</span>');
        if (playground.has_spray_showers) features.push(`<span class="feature-tag spray">💦 ${playground.spray_shower_count} Spray Shower${playground.spray_shower_count !== 1 ? 's' : ''}</span>`);
        if (playground['Sensory-Friendly'] === 'Y') features.push('<span class="feature-tag sensory">🧩 Sensory-Friendly</span>');
        
        // Bathroom features
        if (playground.ADA_Accessible_Comfort_Station === 'Accessible') {
            features.push('<span class="feature-tag bathroom">🚻 Accessible Bathrooms</span>');
        } else if (playground.ADA_Accessible_Comfort_Station === 'Not Accessible') {
            features.push('<span class="feature-tag bathroom">🚻 Bathrooms</span>');
        }
        
        // Water features (currently just spray showers, but extensible)
        if (playground.has_spray_showers) {
            features.push('<span class="feature-tag water-features">🚰 Water Features</span>');
        }
        
        const borough = this.getBoroughName(playground.Prop_ID[0]);
        
        infoContainer.innerHTML = `
            <div class="info-content">
                <div class="playground-details">
                    <h3>${playground.Name}</h3>
                    <p><strong>Location:</strong> ${playground.Location}</p>
                    <p><strong>Borough:</strong> ${borough}</p>
                    ${features.length > 0 ? `<div class="features">${features.join('')}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    getBoroughName(code) {
        const boroughs = {
            'B': 'Brooklyn',
            'Q': 'Queens', 
            'M': 'Manhattan',
            'X': 'Bronx',
            'R': 'Staten Island'
        };
        return boroughs[code] || 'Unknown';
    }
    
    displayWelcomeStats() {
        const totalElement = document.getElementById('total-playgrounds');
        if (totalElement) {
            totalElement.textContent = this.playgrounds.length;
        }
    }
    
    setupEventListeners() {
        const boroughFilter = document.getElementById('borough-filter');
        const accessibleFilter = document.getElementById('accessible-filter');
        const sprayFilter = document.getElementById('spray-filter');
        const sensoryFilter = document.getElementById('sensory-filter');
        const bathroomFilter = document.getElementById('bathroom-filter');
        const waterFeaturesFilter = document.getElementById('water-features-filter');
        const searchInput = document.getElementById('search-input');
        const clearButton = document.getElementById('clear-filters');
        
        boroughFilter.addEventListener('change', () => this.applyFilters());
        accessibleFilter.addEventListener('change', () => this.applyFilters());
        sprayFilter.addEventListener('change', () => this.applyFilters());
        sensoryFilter.addEventListener('change', () => this.applyFilters());
        bathroomFilter.addEventListener('change', () => this.applyFilters());
        waterFeaturesFilter.addEventListener('change', () => this.applyFilters());
        searchInput.addEventListener('input', () => this.applyFilters());
        
        clearButton.addEventListener('click', () => {
            boroughFilter.value = '';
            accessibleFilter.value = '';
            sprayFilter.checked = false;
            sensoryFilter.checked = false;
            bathroomFilter.value = '';
            waterFeaturesFilter.checked = false;
            searchInput.value = '';
            this.applyFilters();
            this.showWelcomeMessage();
        });
    }
    
    applyFilters() {
        const borough = document.getElementById('borough-filter').value;
        const accessible = document.getElementById('accessible-filter').value;
        const hasSpray = document.getElementById('spray-filter').checked;
        const isSensory = document.getElementById('sensory-filter').checked;
        const bathroomFilter = document.getElementById('bathroom-filter').value;
        const hasWaterFeatures = document.getElementById('water-features-filter').checked;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        
        this.filteredPlaygrounds = this.playgrounds.filter(playground => {
            // Borough filter
            if (borough && !playground.Prop_ID.startsWith(borough)) {
                return false;
            }
            
            // Accessibility filter
            if (accessible && playground.Accessible !== accessible) {
                return false;
            }
            
            // Spray shower filter
            if (hasSpray && !playground.has_spray_showers) {
                return false;
            }
            
            // Sensory-friendly filter
            if (isSensory && playground['Sensory-Friendly'] !== 'Y') {
                return false;
            }
            
            // Bathroom filter
            if (bathroomFilter) {
                const bathroomStatus = playground.ADA_Accessible_Comfort_Station;
                switch (bathroomFilter) {
                    case 'has':
                        if (bathroomStatus === 'No' || !bathroomStatus) {
                            return false;
                        }
                        break;
                    case 'accessible':
                        if (bathroomStatus !== 'Accessible') {
                            return false;
                        }
                        break;
                    case 'none':
                        if (bathroomStatus !== 'No' && bathroomStatus !== null) {
                            return false;
                        }
                        break;
                }
            }
            
            // Water features filter (combines spray showers as water features)
            if (hasWaterFeatures && !playground.has_spray_showers) {
                return false;
            }
            
            // Search filter
            if (searchTerm && !playground.Name.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            return true;
        });
        
        this.updateMapMarkers();
        this.updateStats();
        
        if (this.filteredPlaygrounds.length === 0) {
            this.showNoResults();
        } else if (searchTerm || borough || accessible || hasSpray || isSensory || bathroomFilter || hasWaterFeatures) {
            this.showFilterResults();
        }
    }
    
    updateMapMarkers() {
        if (this.map && this.map.loaded()) {
            this.addPlaygroundMarkers();
            
            // Fit map to filtered results if there are any
            if (this.filteredPlaygrounds.length > 0 && this.filteredPlaygrounds.length < 50) {
                const bounds = new mapboxgl.LngLatBounds();
                this.filteredPlaygrounds.forEach(playground => {
                    const lat = parseFloat(playground.lat);
                    const lon = parseFloat(playground.lon);
                    if (!isNaN(lat) && !isNaN(lon)) {
                        bounds.extend([lon, lat]);
                    }
                });
                
                if (!bounds.isEmpty()) {
                    this.map.fitBounds(bounds, { padding: 50 });
                }
            }
        }
    }
    
    updateStats() {
        const totalElement = document.getElementById('total-playgrounds');
        if (totalElement) {
            totalElement.textContent = this.filteredPlaygrounds.length;
        }
    }
    
    showNoResults() {
        const infoContainer = document.getElementById('playground-info');
        infoContainer.innerHTML = `
            <div class="info-content">
                <div class="welcome-message">
                    <h3>No playgrounds found 😢</h3>
                    <p>Try adjusting your filters to find more playgrounds!</p>
                    <button id="clear-filters-2" class="clear-btn" style="margin-top: 1rem;">Clear All Filters</button>
                </div>
            </div>
        `;
        
        document.getElementById('clear-filters-2').addEventListener('click', () => {
            document.getElementById('clear-filters').click();
        });
    }
    
    showFilterResults() {
        const infoContainer = document.getElementById('playground-info');
        const sprayCount = this.filteredPlaygrounds.filter(p => p.has_spray_showers).length;
        
        infoContainer.innerHTML = `
            <div class="info-content">
                <div class="welcome-message">
                    <h3>Found ${this.filteredPlaygrounds.length} playground${this.filteredPlaygrounds.length !== 1 ? 's' : ''}! 🎯</h3>
                    <p>Click on any marker to see details. Use the map to explore!</p>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-number">${this.filteredPlaygrounds.length}</span>
                            <span class="stat-label">Filtered Results</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${sprayCount}</span>
                            <span class="stat-label">With Spray Showers</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showWelcomeMessage() {
        const infoContainer = document.getElementById('playground-info');
        infoContainer.innerHTML = `
            <div class="info-content">
                <div class="welcome-message">
                    <h3>Welcome! 🎈</h3>
                    <p>Click on any playground marker to see details, or use the filters above to find your perfect playground!</p>
                    <div class="stats">
                        <div class="stat">
                            <span class="stat-number" id="total-playgrounds">${this.playgrounds.length}</span>
                            <span class="stat-label">Total Playgrounds</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">420</span>
                            <span class="stat-label">With Spray Showers</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showError(message) {
        const mapContainer = document.getElementById('map');
        mapContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; color: #dc3545; text-align: center; padding: 2rem;">
                <div>
                    <h3>⚠️ Error</h3>
                    <p>${message}</p>
                </div>
            </div>
        `;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlaygroundExplorer();
});