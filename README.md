# MiniAmazon — E-Commerce with AI Shopping Assistant

A working student project inspired by the Amazon shopping experience. Educational demo only; not affiliated with Amazon.

## Features

- Amazon-inspired storefront, homepage, navigation and product category cards.
- 18 sample products with prices in Saudi Riyal (SAR), ratings and product details.
- Search, category filters and sorting by price or rating.
- Add-to-cart, quantity editing, price totals and saved cart on the same device.
- Shopping chatbot: recommendation requests, budget filters, price comparisons and product descriptions for sellers.
- Responsive design for phones and desktops.
- **Optional live AI endpoint** using the OpenAI Responses API. Without an API key, the chatbot uses a clearly identified local rule-based demo mode.

## How to open

Open `index.html` in a browser. For local development with full support for relative paths, run a local web server in this folder, e.g. `python -m http.server 8000` and open `http://localhost:8000`.

## How to enable real AI

1. Deploy this directory to Vercel (it has an `api/chat.js` serverless function).
2. In project settings → Environment Variables, add `OPENAI_API_KEY` with your own API key. Never store the key in `index.html`, `app.js`, GitHub or a screenshot.
3. Optionally set `OPENAI_MODEL` to a Responses API-compatible model name. Default: `gpt-4.1-mini`.
4. Redeploy and test the assistant. The chat header changes to “Live AI connected” only after a successful API response.

**API usage may incur provider costs.** Product images are sourced from Unsplash, so internet is needed for the photos; emoji placeholders display if images cannot load.

## Demonstration prompts

- Find me shoes under 300 SAR for gym.
- Compare headphone prices.
- Write a product description for a smartwatch.
- ابحث عن حذاء رياضي أقل من 300 ريال.

## Project limitations

This is a prototype. Product catalog and prices are fictional examples. Cart uses browser local storage. There are no real logins, inventory database, payment processing, shipping, or completed real purchases. Demo mode does **not** use a language model. Live AI requires server setup and an API key.
