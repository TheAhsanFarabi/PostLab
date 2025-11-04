import '@/styles/globals.css'

// This is the main entry point for your Next.js app.
// It wraps all your pages, so it's the perfect place
// to import global stylesheets.
export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />
}

