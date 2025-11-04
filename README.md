# PostLab - A Next.js API Tester

## Overview
PostLab is a Next.js application that acts as an API testing tool with built-in CORS proxy capabilities.

## Features
- Built with Next.js and Tailwind CSS
- Serverless API proxy route
- CORS-free API testing
- Simple and intuitive interface

## Architecture

### Frontend (`pages/index.js`)
- React application interface
- Collects API request details (URL, method, headers, body)

### Backend (`pages/api/proxy.js`)
- Next.js API Route acting as serverless proxy
- Handles CORS by proxying requests server-side

## How It Works
1. User submits request through frontend
2. Frontend sends POST to local `/api/proxy`
3. Proxy server makes actual API call
4. Response returns to frontend
5. Results display in browser

## Quick Start

### Prerequisites
- Node.js installed
- npm or yarn

### Installation
1. Create project structure:
```bash
mkdir postlab-next
cd postlab-next
mkdir -p pages/api styles
```

2. Clone required files:
- `package.json`
- `tailwind.config.js`
- `postcss.config.js`
- `styles/globals.css`
- `pages/_app.js`
- `pages/index.js`
- `pages/api/proxy.js`

3. Install dependencies:
```bash
npm install
```

4. Run development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to start testing APIs.

## Deployment

### Deploy to Vercel
1. Push to GitHub repository
2. Import repository to Vercel
3. Deploy automatically

## License
MIT

