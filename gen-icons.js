const sharp = require('sharp');
const fs = require('fs');

async function gen() {
  const svgBuffer = fs.readFileSync('public/icon-mark.svg');
  const viewBoxW = 73;
  const viewBoxH = 60;
  
  const sizes = [
    { name: 'public/favicon-32x32.png', w: 32, h: 32 },
    { name: 'public/apple-touch-icon.png', w: 180, h: 180 },
    { name: 'public/icon-192.png', w: 192, h: 192 },
    { name: 'public/icon-512.png', w: 512, h: 512 },
  ];
  
  for (const s of sizes) {
    const density = Math.max(
      (s.w / viewBoxW) * 72 * 4,
      (s.h / viewBoxH) * 72 * 4
    );
    
    await sharp(svgBuffer, { density })
      .resize(s.w, s.h, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(s.name);
    
    console.log(`Generated ${s.name} (${s.w}x${s.h})`);
  }
}

gen().catch(err => { console.error(err); process.exit(1); });
