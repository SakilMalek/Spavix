import React from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  // Only load GoogleOAuthProvider on login/signup pages to reduce initial bundle
  const isAuthPage = router.pathname === '/login' || router.pathname === '/signup';

  return (
    <ThemeProvider>
      {isAuthPage ? (
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <Component {...pageProps} />
        </GoogleOAuthProvider>
      ) : (
        <Component {...pageProps} />
      )}
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}
