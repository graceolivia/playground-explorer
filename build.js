const fs = require('fs');
const path = require('path');

// Read the template script file
const scriptTemplatePath = path.join(__dirname, 'script.template.js');
const scriptOutputPath = path.join(__dirname, 'script.js');

// Check if template exists, if not, create it from current script.js
if (!fs.existsSync(scriptTemplatePath)) {
    console.log('Creating script template from existing script.js...');
    let scriptContent = fs.readFileSync(scriptOutputPath, 'utf8');
    fs.writeFileSync(scriptTemplatePath, scriptContent);
    console.log('Template created: script.template.js');
}

// Read template content and copy directly (no token replacement needed for Leaflet)
let templateContent = fs.readFileSync(scriptTemplatePath, 'utf8');

// Write the final script file
fs.writeFileSync(scriptOutputPath, templateContent);

console.log('Build complete!');
console.log('Using OpenStreetMap with Leaflet - no API key required! 🎉');