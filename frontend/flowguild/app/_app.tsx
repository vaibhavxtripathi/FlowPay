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
          style: { fontFamily: 'Inter, sans-serif', borderRadius: '12px', boxShadow: '0 1px 10px rgba(139, 92, 246, 0.1)' },
          duration: 3500,
        }}
      />
    </>
  );
}
