import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Signup() {
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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isDark ? 'bg-neutral-950' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <div className={isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'} style={{ borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
            <div className={isDark ? 'text-blue-400' : 'text-blue-600'} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>✨</div>
            <h1 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SPAVIX</h1>
          </div>

          <h2 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <Label htmlFor="signup-email" className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <Label htmlFor="signup-password" className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <Label htmlFor="confirm-password" className={isDark ? 'text-neutral-300' : 'text-gray-700'}>Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
              style={{ width: '100%', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, transition: 'all 0.2s' }}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#4b5563', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
