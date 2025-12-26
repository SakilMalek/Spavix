import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Upload, Palette, Download } from 'lucide-react';
import ModernNavbar from '../components/modern-navbar';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #f0f9ff, #e0e7ff)' }}>
      {/* Header */}
      <ModernNavbar />

      {/* Main Content */}
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            Transform Your Rooms with AI
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#4b5563', marginBottom: '2rem' }}>
            Upload a photo, select your style, and see stunning AI-powered renovations instantly
          </p>
          <Link href="/signup" style={{ display: 'inline-block', padding: '1rem 2rem', background: '#2563eb', color: 'white', borderRadius: '0.5rem', fontSize: '1.125rem', fontWeight: '600', textDecoration: 'none' }}>
            Get Started Free
          </Link>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <Upload style={{ width: '3rem', height: '3rem', color: '#2563eb', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Upload Photo</h3>
            <p style={{ color: '#4b5563' }}>Upload any room photo (JPEG/PNG, max 10MB)</p>
          </div>
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <Palette style={{ width: '3rem', height: '3rem', color: '#2563eb', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Choose Style & Materials</h3>
            <p style={{ color: '#4b5563' }}>Select design style, colors, flooring, curtains, and lighting</p>
          </div>
          <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
            <Download style={{ width: '3rem', height: '3rem', color: '#2563eb', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Download Results</h3>
            <p style={{ color: '#4b5563' }}>Get high-quality before/after images and PDF reports</p>
          </div>
        </div>

        {/* Styles Section */}
        <div style={{ background: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '3rem' }}>
          <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Available Styles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {['Modern Minimalist', 'Industrial Chic', 'Scandinavian', 'Contemporary', 'Luxury Modern', 'Bohemian', 'Farmhouse', 'Mid-Century'].map((style) => (
              <div key={style} style={{ background: '#f3f4f6', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#111827' }}>{style}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
