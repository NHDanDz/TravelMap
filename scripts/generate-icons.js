const fs = require('fs');
const path = require('path');

// Simple icon generator without dependencies
// Tạo icons đơn giản bằng Canvas API

async function generateIcons() {
  // Tạo thư mục icons nếu chưa có
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Sizes cần thiết cho PWA
  const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
  
  console.log('🎨 Generating PWA icons...');
  console.log('📝 Tạo file SVG template...');
  
  // Tạo SVG icon template
  const createSVG = (size) => `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <path d="M${size * 0.25} ${size * 0.3} L${size * 0.75} ${size * 0.3} L${size * 0.6} ${size * 0.7} L${size * 0.4} ${size * 0.7} Z" fill="white"/>
      <circle cx="${size * 0.5}" cy="${size * 0.4}" r="${size * 0.08}" fill="white"/>
    </svg>
  `;

  // Tạo các icons với kích thước khác nhau
  for (const size of sizes) {
    const svgContent = createSVG(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(iconsDir, filename);
    
    fs.writeFileSync(filepath, svgContent);
    console.log(`✅ Generated ${filename}`);
  }

  // Tạo favicon
  const faviconSVG = createSVG(32);
  fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), faviconSVG);
  console.log('✅ Generated favicon.svg');

  // Tạo apple-touch-icon
  const appleTouchIcon = createSVG(180);
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
  console.log('✅ Generated apple-touch-icon.svg');

  // Tạo favicon ICO placeholder (HTML sẽ fallback to SVG)
  const icoContent = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#3b82f6"/>
      <path d="M8 10 L24 10 L19 22 L13 22 Z" fill="white"/>
      <circle cx="16" cy="13" r="2.5" fill="white"/>
    </svg>
  `;
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), icoContent);

  // Tạo browserconfig.xml cho Windows tiles
  const browserConfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/icons/icon-144x144.svg"/>
      <square310x310logo src="/icons/icon-384x384.svg"/>
      <TileColor>#3b82f6</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;
  
  fs.writeFileSync(path.join(process.cwd(), 'public', 'browserconfig.xml'), browserConfig);
  console.log('✅ Generated browserconfig.xml');

  console.log('\n🎉 Tất cả icons đã được tạo thành công!');
  console.log('📁 Kiểm tra thư mục public/icons/');
  console.log('\n💡 Lưu ý: Các file này là SVG. Để có chất lượng tốt nhất, hãy:');
  console.log('1. Thay thế bằng PNG files từ designer');
  console.log('2. Hoặc dùng tool online như favicon.io');
  console.log('3. Hoặc cài đặt sharp: npm install sharp và chạy script nâng cao');
}

// Chạy script
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };