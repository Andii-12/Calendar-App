// Simple script to generate basic icons for PWA
// This creates simple colored squares as placeholders
// In production, you should replace these with proper app icons

const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Simple SVG icon template
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">📅</text>
</svg>`;

// Generate SVG files for each size
sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create browserconfig.xml for Windows tiles
const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
    <msapplication>
        <tile>
            <square150x150logo src="/icons/icon-144x144.png"/>
            <TileColor>#3b82f6</TileColor>
        </tile>
    </msapplication>
</browserconfig>`;

fs.writeFileSync(path.join(__dirname, '../public/icons/browserconfig.xml'), browserconfig);
console.log('Generated browserconfig.xml');

console.log('\n✅ PWA icons generated!');
console.log('📝 Note: These are placeholder icons. Replace with proper app icons for production.');
