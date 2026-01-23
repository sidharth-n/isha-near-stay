import puppeteer from 'puppeteer';
import fs from 'fs';

const CORRECT_LINK = 'https://www.google.com/maps/place/Sree+Bharat+Residency/@10.9412737,76.7524066,1139m/data=!3m2!1e3!4b1!4m9!3m8!1s0x3ba86735f79b6e1b:0x1b3baad2d08ea632!5m2!4m1!1i2!8m2!3d10.9412737!4d76.7524066';

const isUserAvatar = (url) => {
  if (!url) return true;
  if (url.includes('-rp-')) return true;
  if (url.includes('/a/ACg')) return true;
  if (url.includes('-mo-br100')) return true;
  return false;
};

async function scrape() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  console.log('Scraping Shree Bharat Residency from correct link...');
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
  await page.goto(CORRECT_LINK, { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise(r => setTimeout(r, 5000));
  
  // Extract photos
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
  console.log('Found', photos.length, 'photos');
  
  await browser.close();
  
  // Update stays.json
  const stays = JSON.parse(fs.readFileSync('./src/data/stays.json', 'utf-8'));
  const idx = stays.findIndex(s => s.name === 'Shree Bharat Residency');
  
  if (idx >= 0) {
    stays[idx].mapLink = CORRECT_LINK;
    stays[idx].distance = '9 kms';
    stays[idx].website = null;
    stays[idx].address = 'Sree Bharat Residency, near Isha Yoga Center, Coimbatore';
    stays[idx].media = photos.map((url, i) => ({ order: i+1, type: 'photo', url, visible: true }));
    
    fs.writeFileSync('./src/data/stays.json', JSON.stringify(stays, null, 2));
    console.log('✅ Updated Shree Bharat Residency with', photos.length, 'new photos');
  }
}

scrape().catch(console.error);
