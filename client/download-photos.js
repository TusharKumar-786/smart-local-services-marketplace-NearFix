import https from 'https';
import fs from 'fs';
import path from 'path';

const IMAGES = {
  'client/public/images/hero.webp': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  'client/public/images/categories/plumber.webp': 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/electrician.webp': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/ac-repair.webp': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/painter.webp': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/carpenter.webp': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/home-cleaning.webp': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/appliance-repair.webp': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/pest-control.webp': 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/water-purifier.webp': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80',
  'client/public/images/categories/cctv-wifi.webp': 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80',
};

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch ${url}: Status ${res.statusCode}`));
      }
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
};

async function main() {
  console.log('Downloading real free-license Unsplash photographs for categories...');
  for (const [dest, url] of Object.entries(IMAGES)) {
    try {
      await download(url, dest);
      console.log(`Saved: ${dest}`);
    } catch (err) {
      console.error(`Error downloading ${dest}:`, err.message);
    }
  }
  console.log('Photographs downloaded.');
}

main();
