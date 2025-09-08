const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Read the template script file
const scriptTemplatePath = path.join(__dirname, 'script.template.js');
const scriptOutputPath = path.join(__dirname, 'script.js');

// Check if template exists, if not, create it from current script.js
if (!fs.existsSync(scriptTemplatePath)) {
    console.log('Creating script template from existing script.js...');
    let scriptContent = fs.readFileSync(scriptOutputPath, 'utf8');
    
    // Replace the hardcoded token with placeholder
    scriptContent = scriptContent.replace(
        /this\.mapboxToken = ['"].*?['"];/,
        'this.mapboxToken = \'{{MAPBOX_ACCESS_TOKEN}}\';'
    );
    
    fs.writeFileSync(scriptTemplatePath, scriptContent);
    console.log('Template created: script.template.js');
}

// Read template content
let templateContent = fs.readFileSync(scriptTemplatePath, 'utf8');

// Get token from environment variable or GitHub secrets
const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';

// Replace placeholder with actual token
const finalContent = templateContent.replace(
    '{{MAPBOX_ACCESS_TOKEN}}',
    mapboxToken
);

// Write the final script file
fs.writeFileSync(scriptOutputPath, finalContent);

console.log('Build complete!');
console.log(`Mapbox token: ${mapboxToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE' ? 'Not set (using placeholder)' : 'Set from environment'}`);