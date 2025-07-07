# Cloudflare Workers Deployment Guide

## Prerequisites
- Cloudflare account
- Wrangler CLI authenticated
- Environment variables configured

## Setup Instructions

### 1. Authenticate Wrangler CLI
```bash
# Login to Cloudflare
bunx wrangler login

# Verify authentication
bunx wrangler whoami
```

### 2. Configure Environment Variables
Set the following secrets in Cloudflare:

```bash
# Telegram configuration
bunx wrangler secret put TELEGRAM_BOT_TOKEN
bunx wrangler secret put TELEGRAM_CHAT_ID

# Firebase configuration (if needed as secrets)
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_API_KEY
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_PROJECT_ID
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_APP_ID
bunx wrangler secret put NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID

# Image cache worker URL
bunx wrangler secret put NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL
```

Or configure them in the Cloudflare dashboard under Workers & Pages > Settings > Environment variables.

### 3. Deploy to Cloudflare Pages

#### Option A: Connect GitHub Repository
1. Go to Cloudflare Dashboard > Workers & Pages
2. Click "Create application"
3. Choose "Pages" tab
4. Connect to Git provider (GitHub)
5. Select the `autobel1` repository
6. Configure build settings:
   - Framework preset: Next.js
   - Build command: `bun run build && bun run pages:build`
   - Build output directory: `.vercel/output/static`
   - Environment variables: Add all Firebase and Telegram variables

#### Option B: Manual Deployment
```bash
# Build for production
bun run build
bun run pages:build

# Deploy to Cloudflare Pages
bunx wrangler pages deploy .vercel/output/static --project-name autobel1
```

### 4. Deploy Image Cache Worker (Separate Worker)
```bash
# Navigate to worker directory
cd cloudflare-worker

# Deploy the image cache worker
bunx wrangler deploy

# Set up custom domain routing (optional)
# Configure DNS in Cloudflare dashboard
```

### 5. Configure Custom Domain (Optional)
1. In Cloudflare Dashboard, go to your domain
2. Add CNAME record: `images` pointing to your worker
3. Update `NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL` to use your domain

## Build Commands Summary

```bash
# Development
bun run dev

# Build for Cloudflare Pages
bun run build
bun run pages:build

# Preview locally with Cloudflare
bun run preview

# Deploy manually
bun run deploy
```

## Environment Variables Required

### Public Variables (can be in wrangler.toml or dashboard)
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_IMAGE_CACHE_WORKER_URL`

### Secret Variables (use wrangler secret or dashboard)
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

## Troubleshooting

### Build Issues
- Ensure all routes that need server-side rendering have `export const runtime = 'edge'`
- Check that Firebase configuration is correct
- Verify all dependencies are compatible with Edge Runtime

### Runtime Issues
- Check Cloudflare Functions logs
- Verify environment variables are set correctly
- Test API routes separately

## Project Structure
```
autobel1/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                    # Utility libraries
├── functions/              # Cloudflare Functions
├── cloudflare-worker/      # Separate image cache worker
├── wrangler.toml          # Main app worker config
└── .vercel/output/static/ # Built Cloudflare Pages output
```
