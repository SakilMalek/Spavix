import React from 'react';
import type { AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/context/ThemeContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <ThemeProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}
