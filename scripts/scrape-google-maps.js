/**
 * Google Maps Scraper for Isha Near Stay
 * 
 * This script scrapes photos, ratings, reviews, and other data
 * from Google Maps links for all accommodation listings.
 * 
 * Usage: node scripts/scrape-google-maps.js
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STAYS_FILE = path.join(__dirname, '../src/data/stays.json');
const OUTPUT_FILE = path.join(__dirname, '../src/data/stays-enriched.json');

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeGoogleMapsPlace(browser, url, stayName) {
  console.log(`\n📍 Scraping: ${stayName}`);
  console.log(`   URL: ${url}`);
  
  // Skip non-Google Maps URLs
  if (!url.includes('maps.app.goo.gl') && !url.includes('google.com/maps')) {
    console.log(`   ⏭️  Skipping - not a Google Maps URL`);
    return null;
  }
  
  const page = await browser.newPage();
  
  try {
    // Set viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000); // Wait for redirects and content load
    
    const data = await page.evaluate(() => {
      const result = {
        rating: null,
        reviewCount: null,
        website: null,
        address: null,
        photos: [],
        reviews: []
      };
      
      // Extract rating - try multiple selectors
      const ratingSelectors = [
        '[role="img"][aria-label*="star"]',
        'span.ceNzKf',
        'span.fontDisplayLarge',
        'div.F7nice span[aria-hidden="true"]'
      ];
      
      for (const selector of ratingSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          const text = el.getAttribute('aria-label') || el.textContent;
          const match = text.match(/([\d.]+)/);
          if (match && parseFloat(match[1]) <= 5) {
            result.rating = parseFloat(match[1]);
            break;
          }
        }
      }
      
      // Extract review count
      const reviewPatterns = [
        /\(([\d,]+)\s*review/i,
        /([\d,]+)\s*review/i,
        /\(([\d,]+)\)/
      ];
      
      const allText = document.body.innerText;
      for (const pattern of reviewPatterns) {
        const match = allText.match(pattern);
        if (match) {
          result.reviewCount = parseInt(match[1].replace(/,/g, ''));
          break;
        }
      }
      
      // Extract website
      const websiteSelectors = [
        'a[data-item-id="authority"]',
        'a[aria-label*="website"]',
        'a[href^="http"]:not([href*="google"])'
      ];
      
      for (const selector of websiteSelectors) {
        const el = document.querySelector(selector);
        if (el && el.href && !el.href.includes('google.com')) {
          result.website = el.href;
          break;
        }
      }
      
      // Extract address
      const addressSelectors = [
        'button[data-item-id="address"]',
        '[data-item-id="address"]',
        'div[aria-label*="Address"]'
      ];
      
      for (const selector of addressSelectors) {
        const el = document.querySelector(selector);
        if (el) {
          result.address = el.textContent.trim().replace(/^Address:\s*/i, '');
          break;
        }
      }
      
      // Extract photos from the page
      const photoUrls = new Set();
      
      // Try to get photos from img elements
      const imgElements = document.querySelectorAll('img[src*="googleusercontent"], img[src*="lh3."], img[src*="lh5."]');
      for (const img of imgElements) {
        let src = img.src;
        if (src && (src.includes('googleusercontent') || src.includes('lh3.') || src.includes('lh5.'))) {
          // Get higher resolution
          src = src.replace(/=w\d+-h\d+/, '=w800-h600')
                   .replace(/=s\d+/, '=s800')
                   .replace(/=w\d+/, '=w800');
          if (!src.includes('=')) {
            src += '=w800-h600';
          }
          photoUrls.add(src);
        }
      }
      
      // Also try background images
      const bgElements = document.querySelectorAll('[style*="background-image"]');
      for (const el of bgElements) {
        const style = el.getAttribute('style');
        const match = style.match(/url\(["']?(https:\/\/[^"')]+)["']?\)/);
        if (match && (match[1].includes('googleusercontent') || match[1].includes('lh3.'))) {
          photoUrls.add(match[1]);
        }
      }
      
      result.photos = Array.from(photoUrls).slice(0, 10);
      
      // Extract reviews from review section
      const reviewContainers = document.querySelectorAll('[data-review-id], .jftiEf');
      for (const container of Array.from(reviewContainers).slice(0, 5)) {
        const authorEl = container.querySelector('.d4r55, .WNxzHc');
        const textEl = container.querySelector('.wiI7pd, .MyEned');
        const ratingEl = container.querySelector('[aria-label*="star"]');
        const dateEl = container.querySelector('.rsqaWe, .xRkPPb');
        
        if (textEl && textEl.textContent.length > 5) {
          result.reviews.push({
            author: authorEl ? authorEl.textContent.trim() : 'Anonymous',
            text: textEl.textContent.trim().slice(0, 300),
            rating: ratingEl ? parseInt(ratingEl.getAttribute('aria-label')) || 5 : null,
            date: dateEl ? dateEl.textContent.trim() : null
          });
        }
      }
      
      return result;
    });
    
    console.log(`   ⭐ Rating: ${data.rating || 'N/A'}`);
    console.log(`   📝 Reviews: ${data.reviewCount || 'N/A'}`);
    console.log(`   📷 Photos: ${data.photos.length}`);
    console.log(`   🌐 Website: ${data.website || 'N/A'}`);
    
    await page.close();
    return data;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    await page.close();
    return null;
  }
}

async function main() {
  console.log('🚀 Starting Google Maps Scraper for Isha Near Stay\n');
  console.log('='.repeat(60));
  
  // Read existing stays data
  const staysRaw = fs.readFileSync(STAYS_FILE, 'utf-8');
  const stays = JSON.parse(staysRaw);
  
  console.log(`📊 Found ${stays.length} stays to process\n`);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  let processed = 0;
  let enriched = 0;
  
  for (let i = 0; i < stays.length; i++) {
    const stay = stays[i];
    processed++;
    
    // Initialize new fields
    stays[i].rating = null;
    stays[i].reviewCount = null;
    stays[i].website = null;
    stays[i].address = stay.address || null;
    stays[i].media = stays[i].media || [];
    stays[i].reviews = stays[i].reviews || [];
    
    if (stay.mapLink) {
      const scraped = await scrapeGoogleMapsPlace(browser, stay.mapLink, stay.name);
      
      if (scraped) {
        stays[i].rating = scraped.rating;
        stays[i].reviewCount = scraped.reviewCount;
        stays[i].website = scraped.website;
        stays[i].address = scraped.address || stays[i].address;
        
        // Add photos as media with ordering
        if (scraped.photos.length > 0) {
          stays[i].media = scraped.photos.map((url, idx) => ({
            order: idx + 1,
            type: 'photo',
            url: url,
            visible: true
          }));
          enriched++;
        }
        
        // Add reviews
        if (scraped.reviews.length > 0) {
          stays[i].reviews = scraped.reviews;
        }
      }
    }
    
    // Save progress periodically
    if (processed % 10 === 0) {
      console.log(`\n💾 Progress saved: ${processed}/${stays.length} stays processed`);
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stays, null, 2));
    }
    
    // Small delay between requests
    await delay(1000);
  }
  
  await browser.close();
  
  // Final save
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(stays, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Scraping complete!');
  console.log(`📊 Processed: ${processed} stays`);
  console.log(`📷 Enriched with photos: ${enriched} stays`);
  console.log(`💾 Output saved to: ${OUTPUT_FILE}`);
}

main().catch(console.error);
