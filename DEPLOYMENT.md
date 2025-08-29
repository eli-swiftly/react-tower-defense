# Deployment Guide

## Local Development

To run the game locally:

```bash
npm install
npm run dev
```

Then open http://localhost:3000 in your browser.

## Production Build

To create a production build:

```bash
npm run build
```

This will create optimized files in the `dist` directory.

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

Follow the prompts to deploy your game.

## Deployment to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder:
- Drag and drop the `dist` folder to https://app.netlify.com/drop
- Or use Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

## GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Deploy:
```bash
npm run deploy
```

## Environment Requirements

- Node.js 16+ 
- Modern browser with Canvas support
- Minimum screen resolution: 360x640px
