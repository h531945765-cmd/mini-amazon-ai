
'use strict';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'GEMINI_NOT_CONFIGURED' });
  }

  const { message, catalog } = req.body || {};

  if (typeof message !== 'string' ||
      !message.trim() || message.length > 500) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  if (!Array.isArray(catalog) || catalog.length > 100) {
    return res.status(400).json({ error: 'Invalid catalog' });
  }

  const products = catalog.map(p => ({
    name: String(p.name || '').slice(0, 80),
    category: String(p.category || '').slice(0, 40),
    price: Number(p.price) || 0,
    rating: Number(p.rating) || 0,
    description: String(p.description || '').slice(0, 300)
  }));

  const instructions = `
You are the AI Shopping Assistant for Mini Amazon,
a university demonstration e-commerce website.

Answer in the customer's language, Arabic or English.
Help customers:
- Find products within their budget.
- Recommend suitable products.
- Compare product prices and ratings.
- Write attractive, factual product descriptions.

Use ONLY the products in this catalog.
Never invent products, prices, ratings or specifications.
All prices are in Saudi Riyals (SAR).
The products and transactions are demonstrations.
Keep answers clear, friendly and helpful.

CATALOG:
${JSON.stringify(products)}
`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const model = 'gemini-3.5-flash-lite';
    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/' +
      model + ':generateContent';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: instructions }]
        },
        contents: [{
          role: 'user',
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1000
        }
      }),
      signal: controller.signal
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        'Gemini error:',
        response.status,
        data.error?.status || 'UNKNOWN'
      );
      return res.status(502).json({
        error: 'GEMINI_PROVIDER_ERROR',
        providerStatus: response.status
      });
    }

    const reply = (data.candidates || [])
      .flatMap(c => c.content?.parts || [])
      .map(part => part.text || '')
      .join('\n')
      .trim();

    if (!reply) {
      return res.status(502).json({
        error: 'EMPTY_GEMINI_RESPONSE'
      });
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Gemini request issue:', err.name);
    return res.status(503).json({
      error: 'GEMINI_TEMPORARILY_UNAVAILABLE'
    });
  } finally {
    clearTimeout(timeout);
  }
};
