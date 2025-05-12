const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/price/:productId', async (req, res) => {
  const productId = req.params.productId;
  const url = `https://www.ozon.ru/product/${productId}/`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.waitForSelector('[data-widget="webPrice"] span');

    const priceText = await page.$eval('[data-widget="webPrice"] span', el =>
      el.textContent.replace(/\s/g, '').replace('₽', '')
    );

    const price = parseInt(priceText, 10);
    await browser.close();

    res.json({ price });
  } catch (err) {
    console.error('Ошибка при парсинге:', err);
    res.status(500).json({ error: 'Не удалось получить цену' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на порту ${PORT}`);
});
