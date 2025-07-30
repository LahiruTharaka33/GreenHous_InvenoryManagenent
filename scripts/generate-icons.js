const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
  try {
    // Check if input SVG exists
    if (!fs.existsSync(inputSvg)) {
      console.error('❌ Input SVG file not found:', inputSvg);
      console.log('Please create the SVG icon first at:', inputSvg);
      return;
    }

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎨 Generating PWA icons...');

    for (const size of iconSizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputSvg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated ${size}x${size} icon`);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log('📁 Icons saved to:', outputDir);
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    console.log('\n💡 Make sure you have sharp installed:');
    console.log('npm install sharp');
  }
}

// Run the script
generateIcons(); 