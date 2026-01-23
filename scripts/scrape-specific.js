/**
 * Scrape images for specific properties only
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const STAYS_FILE = './src/data/stays.json';

// Properties to scrape (name patterns)
const TARGET_PROPERTIES = ['chakra stay', 'nischala', 'shree bharat'];

const isUserAvatar = (url) => {
  if (!url) return true;
  if (url.includes('-rp-')) return true;
  if (url.includes('/a/ACg')) return true;
  if (url.includes('-mo-br100')) return true;
  return false;
};

async function scrapePhotos(browser, mapLink, name) {
  if (!mapLink || !mapLink.includes('google')) {
    console.log(`  Skipped - no valid map link`);
    return [];
  }

  const page = await browser.newPage();
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(mapLink, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 5000));

    const imageUrls = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.includes('googleusercontent.com') && !img.src.includes('gstatic')) {
          let url = img.src.split('=')[0] + '=w800-h600-k-no';
          images.push(url);
        }
      });
      return [...new Set(images)];
    });

    const photos = imageUrls.filter(url => !isUserAvatar(url));
    console.log(`  Found ${photos.length} photos`);
    return photos;
  } catch (e) {
    console.log(`  Error: ${e.message}`);
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('📸 Scraping images for specific properties...\n');
  
  const stays = JSON.parse(fs.readFileSync(STAYS_FILE, 'utf-8'));
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  
  for (const stay of stays) {
    const nameLC = stay.name.toLowerCase();
    const isTarget = TARGET_PROPERTIES.some(t => nameLC.includes(t));
    
    if (isTarget && (!stay.media || stay.media.length === 0)) {
      console.log(`Scraping: ${stay.name}`);
      const photos = await scrapePhotos(browser, stay.mapLink, stay.name);
      
      if (photos.length > 0) {
        stay.media = photos.map((url, i) => ({
          order: i + 1,
          type: 'photo',
          url,
          visible: true
        }));
      }
    }
  }
  
  await browser.close();
  
  fs.writeFileSync(STAYS_FILE, JSON.stringify(stays, null, 2));
  console.log('\n✅ Done! Updated stays.json');
}

main().catch(console.error);
