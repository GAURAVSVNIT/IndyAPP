const fs = require('fs');
const path = require('path');

// Check if sharp is installed, if not, provide instructions
try {
  require.resolve('sharp');
} catch (e) {
  console.log('The sharp library is required. Please install it using:');
  console.log('npm install sharp');
  process.exit(1);
}

const sharp = require('sharp');

// Create a 1024x1024 solid color adaptive icon
async function generateAdaptiveIcon() {
  try {
    const size = 1024;
    const iconPath = path.join(__dirname, 'assets', 'images', 'adaptive-icon.png');
    
    // Create a rounded square with a light blue background
    // #4285F4 is a Material Design blue color, works well for adaptive icons
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 66, g: 133, b: 244, alpha: 1 }
      }
    })
    .png()
    .toFile(iconPath);
    
    console.log(`Adaptive icon created successfully at: ${iconPath}`);
  } catch (error) {
    console.error('Error generating adaptive icon:', error);
  }
}

generateAdaptiveIcon();

