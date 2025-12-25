import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, Trash2, ShoppingCart, Maximize2, X, Loader } from 'lucide-react';
import ModernNavbar from '../components/modern-navbar';
import { useAppStore } from '../store/appStore';
import { HoverEffect } from '../components/ui/card-hover-effect';

interface Generation {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  style: string;
  roomType: string;
  createdAt: string;
}

export default function History() {
  const router = useRouter();
  const { imageId } = router.query;
  const { allGenerations: cachedAllGenerations, setAllGenerations, isAllGenerationsCacheValid } = useAppStore();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedImage, setExpandedImage] = useState<'before' | 'after' | null>(null);
  const [shoppingList, setShoppingList] = useState<string | null>(null);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);

  useEffect(() => {
    fetchGenerations();
  }, []);

  useEffect(() => {
    if (imageId && generations.length > 0) {
      const gen = generations.find(g => g.id === imageId);
      if (gen) setSelectedGeneration(gen);
    }
  }, [imageId, generations]);

  const fetchGenerations = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      // Check if all generations cache is valid
      if (isAllGenerationsCacheValid() && cachedAllGenerations.length > 0) {
        console.log('Using cached all generations from history cache');
        setGenerations(cachedAllGenerations);
        if (cachedAllGenerations.length > 0 && !imageId) {
          setSelectedGeneration(cachedAllGenerations[0]);
        }
      } else {
        console.log('Fetching fresh generations from API');
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setGenerations(response.data.generations);
          setAllGenerations(response.data.generations);
          if (response.data.generations.length > 0 && !imageId) {
            setSelectedGeneration(response.data.generations[0]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
      toast.error('Failed to load generations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!selectedGeneration) return;
    try {
      setLoadingShoppingList(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate/${selectedGeneration.id}/shopping-list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShoppingList(response.data.shoppingList);
        toast.success(response.data.cached ? 'Shopping list loaded from cache' : 'Shopping list generated');
      }
    } catch (error) {
      console.error('Failed to generate shopping list:', error);
      toast.error('Failed to generate shopping list');
    } finally {
      setLoadingShoppingList(false);
    }
  };

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <ModernNavbar />
        <div style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p style={{ color: '#6b7280' }}>Loading your transformations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <ModernNavbar />
        <div style={{ minHeight: 'calc(100vh - 4rem)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '1.125rem' }}>No transformations yet</p>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Create Your First Transformation
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>History - SPAVIX | AI Room Transformation</title>
        <meta name="description" content="View all your room transformations. Browse and manage your AI-generated designs." />
      </Head>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <ModernNavbar />

        <main style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(1rem, 5vw, 2rem)' }}>
        {/* Page Title */}
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '700', color: '#111827', marginBottom: '2rem' }}>Transformation History</h1>

        {/* Two Column Layout - Responsive */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(1rem, 5vw, 2rem)' }} className="history-layout">
          {/* Gallery Grid (Left) - Vertical Stack with Scrollbar */}
          <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>All Transformations ({generations.length})</h2>
            <HoverEffect
              items={generations.map((gen) => ({
                title: gen.style.replace(/-/g, ' '),
                description: `${gen.roomType.replace(/_/g, ' ')} • ${gen.createdAt ? new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}`,
                link: '#',
                onClick: () => setSelectedGeneration(gen),
                beforeImage: gen.beforeImageUrl,
                afterImage: gen.afterImageUrl,
              }))}
              className="gap-2"
            />
          </div>

          {/* Detail View (Right) */}
          {selectedGeneration && (
            <div>
              {/* Before/After Comparison */}
              <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.07)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                  {/* Before */}
                  <div style={{ position: 'relative', background: '#f3f4f6' }}>
                    <img
                      src={selectedGeneration.beforeImageUrl}
                      alt="Before"
                      style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                      onClick={() => setExpandedImage('before')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3C/svg%3E';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.75rem' }}>
                      BEFORE
                    </div>
                  </div>

                  {/* After */}
                  <div style={{ position: 'relative', background: '#f3f4f6' }}>
                    <img
                      src={selectedGeneration.afterImageUrl}
                      alt="After"
                      style={{ width: '100%', height: '300px', objectFit: 'cover', display: 'block', cursor: 'pointer' }}
                      onClick={() => setExpandedImage('after')}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23f3f4f6" width="300" height="300"/%3E%3C/svg%3E';
                      }}
                    />
                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(59, 130, 246, 0.95)', color: 'white', padding: '0.375rem 0.75rem', borderRadius: '0.375rem', fontWeight: '700', fontSize: '0.75rem' }}>
                      AFTER
                    </div>
                  </div>
                </div>
              </div>

              {/* Details and Shopping List */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Details Card */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Details</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.125rem' }}>STYLE</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedGeneration.style.replace(/-/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.125rem' }}>ROOM TYPE</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', textTransform: 'capitalize' }}>
                        {selectedGeneration.roomType.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '0.125rem' }}>CREATED</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600' }}>
                        {selectedGeneration.createdAt ? new Date(selectedGeneration.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shopping List Card */}
                <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Shopping List</h3>
                  {shoppingList ? (
                    <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', color: '#374151', lineHeight: '1.5' }}>
                      {shoppingList}
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerateShoppingList}
                      disabled={loadingShoppingList}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: loadingShoppingList ? '#d1d5db' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: loadingShoppingList ? 'not-allowed' : 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!loadingShoppingList) {
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <ShoppingCart style={{ width: '1rem', height: '1rem', display: 'inline', marginRight: '0.5rem' }} />
                      {loadingShoppingList ? 'Generating...' : 'Generate List'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          </div>
        </main>

        {/* Expanded Image Modal */}
        {expandedImage && selectedGeneration && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setExpandedImage(null)}
          >
            <button
              onClick={() => setExpandedImage(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              <X style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
            <img
              src={expandedImage === 'before' ? selectedGeneration.beforeImageUrl : selectedGeneration.afterImageUrl}
              alt={expandedImage}
              style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '0.5rem' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 1024px) {
            .history-layout {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 768px) {
            .history-layout {
              grid-template-columns: 1fr !important;
              gap: 1rem !important;
            }
            .history-layout > div:first-child {
              max-height: 300px !important;
              margin-bottom: 1rem;
            }
            .history-layout > div:last-child {
              display: flex;
              flex-direction: column;
            }
          }
        `}</style>
      </div>
    </>
  );
}
