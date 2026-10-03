# Don Coqui HospitalityOS Lite

Mobile training app with searchable food and drink cards, predictive menu suggestions, flashcards, JCs Kitchen, Cocktail Build and JARI coaching.

## Run and deploy

Requires Node 24. No runtime packages are required.

```sh
npm run build
npm test
```

Import this repository into Vercel. `vercel.json` supplies the build command and static output directory; the `api` directory supplies the JARI endpoints. Pushes to `main` update the linked deployment.

## JARI

Source lookup works without an AI key. For live coaching, set `OPENAI_API_KEY` securely in Vercel environment variables, then redeploy. Optional `JARI_MODEL` defaults to `gpt-4.1-mini`. A `GEMINI_API_KEY` is also supported if no OpenAI key is supplied. Never put a key in client code or commit one.

## Menu sources and maintenance

The catalog was transcribed from supplied Don Coqui food and drinks PDFs and the current cocktail menu photo. Cards retain source/page information and recipe conflicts for staff confirmation. Menu facts are study references; allergy and cross-contact questions require kitchen confirmation.

Edit `source/catalog.json`, `source/app.js`, `source/style.css` or `source/server.js`. After source changes regenerate `worker/index.js` with `python3 source/assemble.py`, then build and test. `source/images.json` contains extracted food JPEGs. Flashcard progress and game scores are saved on the current device.

The existing ChatGPT-hosted study app is separate from this deployment. This repository contains the Vercel-compatible edition with the same catalog and predictive search.
