import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  
  React.useEffect(() => {
    try {
      const { theme: currentTheme } = useTheme();
      setTheme(currentTheme);
    } catch (e) {
      // During SSR, useTheme will fail - use default light theme
      setTheme('light');
    }
    setMounted(true);
  }, []);

  const isDark = theme === 'dark';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - SPAVIX | AI Room Transformation</title>
        <meta name="description" content="Login to SPAVIX and start transforming your room with AI." />
      </Head>
      <div className={isDark ? 'bg-neutral-950' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className={isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'} style={{ borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>✨</div>
            <h1 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SPAVIX</h1>
          </div>

          <h2 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label htmlFor="email" className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="password" className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
              style={{ width: '100%', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, transition: 'all 0.2s' }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#4b5563', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              Sign up
            </Link>
          </p>
        </div>
        </div>
      </div>
    </>
  );
}
