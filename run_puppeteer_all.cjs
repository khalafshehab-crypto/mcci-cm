const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.text().includes('Duplicate')) {
      console.log('BROWSER CONSOLE:', msg.text());
    }
  });

  const urls = [
    '/',
    '/library',
    '/committees',
    '/committees/123/library'
  ];

  for (const url of urls) {
    console.log('Visiting', url);
    await page.goto('http://localhost:3000' + url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 3000));
  }

  await browser.close();
})();
