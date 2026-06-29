import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('public/logo.svg');

async function convert() {
  try {
    await sharp(svg)
      .resize(32, 32, { fit: 'contain', background: { r: 240, g: 247, b: 240, alpha: 1 } })
      .png()
      .toFile('public/favicon-32x32.png');
    console.log('Created favicon-32x32.png');

    await sharp(svg)
      .resize(180, 180, { fit: 'contain', background: { r: 240, g: 247, b: 240, alpha: 1 } })
      .png()
      .toFile('public/apple-touch-icon.png');
    console.log('Created apple-touch-icon.png');

    await sharp(svg)
      .resize(192, 192, { fit: 'contain', background: { r: 240, g: 247, b: 240, alpha: 1 } })
      .png()
      .toFile('public/icon-192.png');
    console.log('Created icon-192.png');

    await sharp(svg)
      .resize(512, 512, { fit: 'contain', background: { r: 240, g: 247, b: 240, alpha: 1 } })
      .png()
      .toFile('public/icon-512.png');
    console.log('Created icon-512.png');
  } catch (e) {
    console.error('Error:', e.message);
  }
}

convert();
