/**
 * Image Scraper for Isha Near Stay - Full Photo Extraction
 * - Clicks into Photos section on Google Maps
 * - Scrolls to load ALL available photos
 * - Excludes user profile/avatar images
 * - Generates HTML report for verification
 */

import puppeteer from 'puppeteer';
import fs from 'fs';

const STAYS_FILE = './src/data/stays.json';
const REPORT_FILE = './image-report.html';

// Pattern to identify user profile/avatar images (NOT property photos)
const isUserAvatar = (url) => {
  if (!url) return true;
  // Reviewer profile patterns
  if (url.includes('-rp-')) return true;
  if (url.includes('/a/ACg')) return true;
  if (url.includes('-mo-br100')) return true;
  if (url.includes('w36-h36')) return true;
  if (url.includes('w40-h40')) return true;
  if (url.includes('s40-c')) return true;
  if (url.includes('s44-c')) return true;
  if (url.includes('s120-c')) return true;
  // Google default icons
  if (url.includes('/maps/contrib/')) return true;
  return false;
};

// Scrape ALL photos from a Google Maps place
async function scrapeAllPropertyPhotos(browser, mapLink, propertyName) {
  const result = {
    name: propertyName,
    mapLink: mapLink,
    photos: [],
    error: null,
    status: 'pending'
  };

  if (!mapLink || (!mapLink.includes('google') && !mapLink.includes('goo.gl'))) {
    result.status = 'skipped';
    result.error = 'No valid Google Maps link';
    return result;
  }

  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(`Scraping: ${propertyName}`);
    await page.goto(mapLink, { waitUntil: 'networkidle2', timeout: 45000 });
    
    // Wait for page to load
    await new Promise(r => setTimeout(r, 3000));
    
    // Strategy 1: Try clicking the main image to open gallery
    try {
      // Look for the main photo area and click it
      const mainPhotoSelectors = [
        'button[jsaction*="pane.heroHeaderImage"]',
        '[data-photo-index="0"]',
        '.aoRNLd img',  // Main photo
        'img[decoding="async"]',  // Primary image
      ];
      
      for (const selector of mainPhotoSelectors) {
        const photoEl = await page.$(selector);
        if (photoEl) {
          await photoEl.click();
          await new Promise(r => setTimeout(r, 2000));
          break;
        }
      }
    } catch (e) {
      console.log('  Could not click main photo');
    }
    
    // Strategy 2: Try clicking "Photos" or "All" tab
    try {
      const photosTabSelectors = [
        'button[aria-label*="Photo"]',
        'button[aria-label*="photo"]',
        'button:has-text("Photos")',
        'button:has-text("All")',
        '[role="tab"][aria-label*="Photo"]',
        '.RWPxGd button',  // Tab buttons
      ];
      
      for (const selector of photosTabSelectors) {
        try {
          const tabEl = await page.$(selector);
          if (tabEl) {
            await tabEl.click();
            await new Promise(r => setTimeout(r, 2000));
            break;
          }
        } catch (e) {}
      }
    } catch (e) {}
    
    // Strategy 3: Look for "See all photos" or similar buttons
    try {
      const seeAllButtons = await page.$$('button');
      for (const btn of seeAllButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && (text.includes('See all') || text.includes('All photos') || text.includes('photos'))) {
          await btn.click();
          await new Promise(r => setTimeout(r, 2500));
          break;
        }
      }
    } catch (e) {}
    
    // Now scroll to load more photos (if in a gallery view)
    try {
      // Find scrollable container
      const scrollContainers = [
        '.m6QErb',  // Common scroll container
        '[role="main"]',
        '.siAUzd-neVct',
        '.section-scrollbox',
      ];
      
      for (const containerSelector of scrollContainers) {
        const container = await page.$(containerSelector);
        if (container) {
          // Scroll multiple times to load all photos
          for (let i = 0; i < 5; i++) {
            await page.evaluate((selector) => {
              const el = document.querySelector(selector);
              if (el) {
                el.scrollTop += 1000;
              }
            }, containerSelector);
            await new Promise(r => setTimeout(r, 1000));
          }
          break;
        }
      }
      
      // Also try scrolling the photo grid
      await page.evaluate(() => {
        const photoGrids = document.querySelectorAll('[role="list"], .m6QErb, .DxyBCb');
        photoGrids.forEach(grid => {
          for (let i = 0; i < 5; i++) {
            grid.scrollTop += 800;
          }
        });
      });
      await new Promise(r => setTimeout(r, 2000));
      
    } catch (e) {}
    
    // Extract all image URLs from the page
    const imageUrls = await page.evaluate(() => {
      const images = [];
      
      // Get all images on the page
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.dataset?.src;
        if (src && src.includes('googleusercontent.com') && !src.includes('gstatic')) {
          // Convert to larger size
          let largeUrl = src;
          // Remove existing size params and add our own
          largeUrl = largeUrl.split('=')[0] + '=w800-h600-k-no';
          images.push(largeUrl);
        }
      });
      
      // Also check data-src attributes (lazy loaded images)
      document.querySelectorAll('[data-src]').forEach(el => {
        const src = el.dataset.src;
        if (src && src.includes('googleusercontent.com')) {
          let largeUrl = src.split('=')[0] + '=w800-h600-k-no';
          images.push(largeUrl);
        }
      });
      
      // Check background images in styles
      document.querySelectorAll('[style*="background"]').forEach(el => {
        const style = el.getAttribute('style');
        const match = style?.match(/url\(["\']?(https:\/\/[^"'\)]+googleusercontent[^"'\)]+)["\']?\)/);
        if (match && match[1]) {
          let largeUrl = match[1].split('=')[0] + '=w800-h600-k-no';
          images.push(largeUrl);
        }
      });
      
      return images;
    });
    
    // Filter out user avatars and keep only property photos
    let propertyPhotos = imageUrls.filter(url => !isUserAvatar(url));
    
    // Remove duplicates based on base URL
    const seen = new Set();
    const uniquePhotos = [];
    for (const url of propertyPhotos) {
      const baseUrl = url.split('=')[0];
      if (!seen.has(baseUrl)) {
        seen.add(baseUrl);
        uniquePhotos.push(url);
      }
    }
    
    result.photos = uniquePhotos;
    result.status = result.photos.length > 0 ? 'success' : 'no_photos';
    
    console.log(`  Found ${result.photos.length} photos`);
    
  } catch (error) {
    result.status = 'error';
    result.error = error.message;
    console.log(`  Error: ${error.message}`);
  } finally {
    await page.close();
  }
  
  return result;
}

// Generate HTML report  
function generateHtmlReport(results) {
  const successCount = results.filter(r => r.status === 'success').length;
  const noPhotosCount = results.filter(r => r.status === 'no_photos').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  const totalPhotos = results.reduce((sum, r) => sum + r.photos.length, 0);
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Scraping Report - Isha Near Stay</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 1600px; margin: 0 auto; background: #f5f5f5; }
    h1 { color: #333; }
    .summary { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
    .stat { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); min-width: 150px; }
    .stat h3 { margin: 0 0 10px; color: #666; font-size: 14px; }
    .stat .number { font-size: 32px; font-weight: bold; }
    .success .number { color: #22c55e; }
    .no-photos .number { color: #f59e0b; }
    .error .number { color: #ef4444; }
    .skipped .number { color: #6b7280; }
    .total .number { color: #3b82f6; }
    .property { background: white; margin-bottom: 20px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .property-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
    .property-name { font-weight: 600; font-size: 16px; }
    .photo-count { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 10px; }
    .property-status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    .status-success { background: #dcfce7; color: #166534; }
    .status-no_photos { background: #fef3c7; color: #92400e; }
    .status-error { background: #fee2e2; color: #991b1b; }
    .status-skipped { background: #f3f4f6; color: #374151; }
    .property-link { font-size: 13px; color: #2563eb; text-decoration: none; word-break: break-all; }
    .property-link:hover { text-decoration: underline; }
    .photos { display: flex; flex-wrap: wrap; gap: 10px; padding: 15px; }
    .photo { width: 180px; height: 135px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; cursor: pointer; transition: transform 0.2s; }
    .photo:hover { transform: scale(1.05); }
    .error-msg { color: #ef4444; padding: 15px; font-size: 14px; }
    .no-photos-msg { color: #f59e0b; padding: 15px; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🏠 Image Scraping Report (Full Photos)</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  <div class="summary">
    <div class="stat total">
      <h3>Total Photos</h3>
      <div class="number">${totalPhotos}</div>
    </div>
    <div class="stat success">
      <h3>Success</h3>
      <div class="number">${successCount}</div>
    </div>
    <div class="stat no-photos">
      <h3>No Photos</h3>
      <div class="number">${noPhotosCount}</div>
    </div>
    <div class="stat error">
      <h3>Errors</h3>
      <div class="number">${errorCount}</div>
    </div>
    <div class="stat skipped">
      <h3>Skipped</h3>
      <div class="number">${skippedCount}</div>
    </div>
  </div>
  
  <h2>Properties (${results.length} total)</h2>
`;

  for (const result of results) {
    html += `
  <div class="property">
    <div class="property-header">
      <div>
        <span class="property-name">${result.name}</span>
        <span class="photo-count">${result.photos.length} photos</span>
        <br/>
        ${result.mapLink ? `<a class="property-link" href="${result.mapLink}" target="_blank">📍 Open in Google Maps</a>` : '<span style="color:#999">No map link</span>'}
      </div>
      <span class="property-status status-${result.status}">${result.status.replace('_', ' ').toUpperCase()}</span>
    </div>
`;
    
    if (result.photos.length > 0) {
      html += `<div class="photos">`;
      for (const photo of result.photos) {
        html += `<img src="${photo}" class="photo" loading="lazy" onclick="window.open('${photo}', '_blank')" onerror="this.style.display='none'" title="Click to open full size" />`;
      }
      html += `</div>`;
    } else if (result.status === 'error') {
      html += `<div class="error-msg">❌ Error: ${result.error}</div>`;
    } else if (result.status === 'no_photos') {
      html += `<div class="no-photos-msg">⚠️ No property photos found - check the Google Maps link manually</div>`;
    } else if (result.status === 'skipped') {
      html += `<div class="no-photos-msg">⏭️ ${result.error}</div>`;
    }
    
    html += `</div>`;
  }

  html += `
</body>
</html>`;

  return html;
}

// Main function
async function main() {
  console.log('📸 Starting Full Image Scraper (with gallery scrolling)...\n');
  
  // Read stays data
  const stays = JSON.parse(fs.readFileSync(STAYS_FILE, 'utf-8'));
  console.log(`Found ${stays.length} properties to process\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const results = [];
  
  // Process each property
  for (let i = 0; i < stays.length; i++) {
    const stay = stays[i];
    console.log(`[${i + 1}/${stays.length}] ${stay.name}`);
    
    const result = await scrapeAllPropertyPhotos(browser, stay.mapLink, stay.name);
    result.id = stay.id;
    results.push(result);
    
    // Update stay with new photos if found
    if (result.status === 'success' && result.photos.length > 0) {
      // Keep local images (from /images/) and replace Google images
      const localImages = (stay.media || []).filter(m => m.url && m.url.startsWith('/images/'));
      
      stay.media = [
        ...localImages,
        ...result.photos.map((url, idx) => ({
          order: localImages.length + idx + 1,
          type: 'photo',
          url: url,
          visible: true
        }))
      ];
    }
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 1500));
  }
  
  await browser.close();
  
  // Save updated stays.json
  fs.writeFileSync(STAYS_FILE, JSON.stringify(stays, null, 2));
  console.log(`\n✅ Updated ${STAYS_FILE}`);
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(results);
  fs.writeFileSync(REPORT_FILE, htmlReport);
  console.log(`📄 Report saved to ${REPORT_FILE}`);
  
  // Print summary
  const successCount = results.filter(r => r.status === 'success').length;
  const noPhotosCount = results.filter(r => r.status === 'no_photos').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const totalPhotos = results.reduce((sum, r) => sum + r.photos.length, 0);
  
  console.log(`\n📊 Summary:`);
  console.log(`   📷 Total photos: ${totalPhotos}`);
  console.log(`   ✅ Properties with photos: ${successCount}`);
  console.log(`   ⚠️ No photos found: ${noPhotosCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`\nOpen ${REPORT_FILE} in your browser to review all images.`);
}

main().catch(console.error);
