import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROVIDERS_DIR = path.resolve(__dirname, '../../client/public/images/providers');
const TOTAL_PROVIDERS = 141;

console.log('=== NearFix Provider Image Inventory Check ===');
console.log(`Target directory: ${PROVIDERS_DIR}`);

if (!fs.existsSync(PROVIDERS_DIR)) {
  console.log(`Directory does not exist. Creating: ${PROVIDERS_DIR}`);
  fs.mkdirSync(PROVIDERS_DIR, { recursive: true });
}

let existingCount = 0;
const missing = [];

for (let i = 1; i <= TOTAL_PROVIDERS; i++) {
  const fileName = `provider-${String(i).padStart(3, '0')}.webp`;
  const filePath = path.join(PROVIDERS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    existingCount++;
  } else {
    missing.push(fileName);
  }
}

console.log(`\nFound: ${existingCount} / ${TOTAL_PROVIDERS} provider photographs.`);

if (missing.length === 0) {
  console.log('✓ All 141 provider portraits are present!');
} else {
  console.log(`! ${missing.length} files missing.`);
  console.log('Sample missing files:', missing.slice(0, 5).join(', '), missing.length > 5 ? '...' : '');
  console.log('\n[Fallback Active]: The NearFix seed and client use unique deterministic SVG avatars with distinctive Indian brand hues until photographs are dropped into this directory.');
}
