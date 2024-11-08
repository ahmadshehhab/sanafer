const express = require('express');
const app = express();
const PORT = 3000;
const puppeteer = require('puppeteer');

// Set Pug as the view engine
app.set('view engine', 'pug');
app.set('views', './views');

// URL to scrape
const url = 'https://alsanafer.ps/?app=product.cat.59&size=';

async function scrapeData(size) {
  try {
    // Launch a new headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to the page
    await page.goto(`${url}${size}`, { waitUntil: 'domcontentloaded' });

    // Scrape the product data
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll('.product-brief-content-wrapper');
      const productData = [];

      productElements.forEach((element) => {
        // Skip elements that contain the .out-of-stock class
        if (element.classList.contains('out-of-stock')) {
          return; // Skip this product
        }

        // Extract name, price, and image
        const name = element.querySelector('.product-brief-content .flex-row .title')?.textContent.trim();
        const priceText = element.querySelector('.product-brief-content .flex-row .price')?.textContent.trim();
        const price = priceText ? parseInt(priceText.replace('₪', '').trim()) + 20 : null; // Add 20 to the price if found
        const image = element.querySelector('.product-brief-content .flex-row .image-wrapper img')?.getAttribute('src');
        const fullImageUrl = image ? `https://alsanafer.ps/${image.trim()}` : null;

        // Only add product if name and price exist
        if (name && price !== null && fullImageUrl) {
          productData.push({ name, price, image: fullImageUrl });
        }
      });

      return productData;
    });

    // Close the browser
    await browser.close();

    return products; // Return the scraped data
  } catch (error) {
    console.error('Error scraping data:', error);
    return [];
  }
}


// Serve static files from the "public" folder
app.use(express.static('public'));

// Define the home route
app.get('/', async (req, res) => {
  const products = await scrapeData(2); // Get the scraped data
  res.render('template', { products });
   console.log(await scrapeData())
});
app.get('/products/size/:size', async (req, res) => {
  const selectedSize = req.params.size;
  const products = await scrapeData(selectedSize); // Get the scraped data
  res.render('template', { products, selectedSize });
   console.log(await scrapeData())
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
