import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERR:', err));

  const urls = [
    'http://localhost:3000/',
    'http://localhost:3000/library',
    'http://localhost:3000/members',
    'http://localhost:3000/events',
  ];
  for (const url of urls) {
    console.log("Navigating to " + url);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
  }
  await browser.close();
})();
