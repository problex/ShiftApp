const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://shiftapp.problex.com';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, url, filename, options = {}) {
  console.log(`Taking screenshot of ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000); // Wait for any animations
    
    const screenshotPath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      ...options
    });
    console.log(`✓ Saved: ${filename}`);
    return screenshotPath;
  } catch (error) {
    console.error(`✗ Error capturing ${url}:`, error.message);
    return null;
  }
}

async function login(page, email, password) {
  console.log('Logging in...');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await delay(1000);
    
    if (email && password) {
      await page.type('input[type="email"]', email);
      await page.type('input[type="password"]', password);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 });
      await delay(2000);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error.message);
    return false;
  }
}

async function main() {
  console.log('Starting screenshot capture...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Capture public pages
  await takeScreenshot(page, `${BASE_URL}/login`, 'login.png');
  await takeScreenshot(page, `${BASE_URL}/register`, 'register.png');
  
  // Try to capture protected pages if credentials are provided via environment variables
  const email = process.env.SCREENSHOT_EMAIL;
  const password = process.env.SCREENSHOT_PASSWORD;
  
  if (email && password) {
    const loggedIn = await login(page, email, password);
    if (loggedIn) {
      await takeScreenshot(page, `${BASE_URL}/dashboard`, 'dashboard.png');
      await takeScreenshot(page, `${BASE_URL}/month`, 'month-view.png');
      await takeScreenshot(page, `${BASE_URL}/week`, 'week-view.png');
      await takeScreenshot(page, `${BASE_URL}/favorites`, 'favorites.png');
    }
  } else {
    console.log('\nNote: To capture protected pages (dashboard, month, week, favorites),');
    console.log('set SCREENSHOT_EMAIL and SCREENSHOT_PASSWORD environment variables.');
  }
  
  await browser.close();
  console.log('\nScreenshot capture complete!');
  console.log(`Screenshots saved to: ${SCREENSHOT_DIR}`);
}

main().catch(console.error);

