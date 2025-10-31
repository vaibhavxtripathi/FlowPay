import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            background: 'rgba(26, 26, 36, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            padding: '14px 18px',
            fontFamily: 'var(--font-geist-sans), sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#00ef8b',
              secondary: '#0a0a0f',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#0a0a0f',
            },
          },
          loading: {
            iconTheme: {
              primary: '#00ef8b',
              secondary: '#0a0a0f',
            },
          },
          duration: 4000,
        }}
      />
    </>
  );
}
