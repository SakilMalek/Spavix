import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Upload, Sparkles, Download, LogOut, Loader, Maximize2, X, ShoppingCart, ArrowRight } from 'lucide-react';
import ModernNavbar from '../components/modern-navbar';
import { useAppStore } from '../store/appStore';
import { useTheme } from '@/context/ThemeContext';
import { FileUpload } from '@/components/ui/file-upload';
import { ModernTransformationCard } from '@/components/ui/modern-transformation-card';

interface Generation {
  id: string;
  beforeImageUrl: string;
  afterImageUrl: string;
  style: string;
  roomType: string;
  createdAt: string;
}

interface Style {
  id: string;
  name: string;
  description: string;
}

interface Material {
  id: string;
  name: string;
  hex?: string;
  description?: string;
}

export default function Dashboard() {
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

  const { latestGeneration: cachedLatestGeneration, setLatestGeneration, isLatestGenerationCacheValid } = useAppStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [materials, setMaterials] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [roomType, setRoomType] = useState('living_room');
  const [materials_selected, setMaterialsSelected] = useState({
    wallColor: 'warm-white',
    floorType: 'tile',
    curtainType: 'sheer',
    lightingMood: 'neutral',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsAuthenticated(true);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if latest generation cache is valid
      if (isLatestGenerationCacheValid() && cachedLatestGeneration) {
        console.log('Using cached latest generation from dashboard cache');
        setGenerations([cachedLatestGeneration]);
      } else {
        console.log('Fetching fresh generations from API');
        const genRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('Generations fetched:', genRes.data.generations);
        const allGenerations = genRes.data.generations || [];
        setGenerations(allGenerations);
        
        // Cache only the latest generation for dashboard
        if (allGenerations.length > 0) {
          setLatestGeneration(allGenerations[0]);
        }
      }
      
      // Always fetch styles and materials (they don't change often)
      const [stylesRes, materialsRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/styles`),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/materials`),
      ]);
      
      setStyles(stylesRes.data.styles || []);
      setMaterials(materialsRes.data.materials || {});
      if (stylesRes.data.styles?.length > 0) {
        setSelectedStyle(stylesRes.data.styles[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadedImage(response.data.imageUrl);
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStyle) {
      toast.error('Please upload an image and select a style');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/generate`,
        {
          imageUrl: uploadedImage,
          roomType,
          style: selectedStyle,
          materials: materials_selected,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Image generated successfully!');
      setUploadedImage(null);
      setSelectedStyle('');
      fetchData();
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };


  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite', margin: '0 auto 1rem', color: '#2563eb' }} />
          <p style={{ color: '#4b5563' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - SPAVIX | AI Room Transformation</title>
        <meta name="description" content="Create stunning room transformations with AI. Design your perfect space with SPAVIX." />
      </Head>
      <div className={isDark ? 'bg-neutral-950' : 'bg-white'} style={{ minHeight: '100vh' }}>
        <ModernNavbar />
      {!isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <Loader style={{ width: '2rem', height: '2rem', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto', 
          padding: 'clamp(1rem, 5vw, 2rem)', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', 
          gap: 'clamp(1rem, 5vw, 2rem)',
        }} className="dashboard-grid">
          {/* Upload & Generation Panel */}
          <div style={{ gridColumn: 'span 2' }}>
            <div className={isDark ? 'bg-neutral-900 border border-neutral-800' : 'bg-white'} style={{ borderRadius: '0.5rem', boxShadow: '0 10px 15px rgba(0,0,0,0.1)', padding: '2rem' }}>
              <h2 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create Transformation</h2>

              {!uploadedImage ? (
                <FileUpload onChange={(files) => {
                  if (files.length > 0) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setUploadedImage(e.target?.result as string);
                    };
                    reader.readAsDataURL(files[0]);
                  }
                }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={uploadedImage} alt="Uploaded" style={{ width: '100%', height: '16rem', objectFit: 'cover', borderRadius: '0.5rem' }} />
                    <button
                      onClick={() => setUploadedImage(null)}
                      style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', padding: '0.5rem 0.75rem', borderRadius: '0.25rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                    >
                      Change
                    </button>
                  </div>

                  {/* Room Type */}
                  <div>
                    <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Room Type</label>
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value)}
                      className={isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}
                      style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid', borderRadius: '0.5rem', outline: 'none' }}
                    >
                      <option value="living_room">Living Room</option>
                      <option value="bedroom">Bedroom</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bathroom">Bathroom</option>
                    </select>
                  </div>

                  {/* Style Selection */}
                  <div>
                    <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem' }}>Design Style</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                      {styles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={selectedStyle === style.id ? (isDark ? 'bg-blue-900/30 border-blue-500' : 'bg-blue-50 border-blue-500') : (isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-300')}
                          style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '2px solid', textAlign: 'left', cursor: 'pointer' }}
                        >
                          <p className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontWeight: '600' }}>{style.name}</p>
                          <p className={isDark ? 'text-neutral-400' : 'text-gray-600'} style={{ fontSize: '0.75rem' }}>{style.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Materials */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 className={isDark ? 'text-white' : 'text-gray-900'} style={{ fontWeight: '600' }}>Materials</h3>

                    {/* Wall Color */}
                    <div>
                      <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Wall Color</label>
                      <select
                        value={materials_selected.wallColor}
                        onChange={(e) =>
                          setMaterialsSelected({ ...materials_selected, wallColor: e.target.value })
                        }
                        className={isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}
                        style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid', borderRadius: '0.5rem', outline: 'none' }}
                      >
                        {materials.wallColors?.map((color: Material) => (
                          <option key={color.id} value={color.id}>
                            {color.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Floor Type */}
                    <div>
                      <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Floor Type</label>
                      <select
                        value={materials_selected.floorType}
                        onChange={(e) =>
                          setMaterialsSelected({ ...materials_selected, floorType: e.target.value })
                        }
                        className={isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}
                        style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid', borderRadius: '0.5rem', outline: 'none' }}
                      >
                        {materials.floorTypes?.map((floor: Material) => (
                          <option key={floor.id} value={floor.id}>
                            {floor.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Curtains */}
                    <div>
                      <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Curtains</label>
                      <select
                        value={materials_selected.curtainType}
                        onChange={(e) =>
                          setMaterialsSelected({ ...materials_selected, curtainType: e.target.value })
                        }
                        className={isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}
                        style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid', borderRadius: '0.5rem', outline: 'none' }}
                      >
                        {materials.curtainTypes?.map((curtain: Material) => (
                          <option key={curtain.id} value={curtain.id}>
                            {curtain.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Lighting */}
                    <div>
                      <label className={isDark ? 'text-neutral-300' : 'text-gray-700'} style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Lighting Mood</label>
                      <select
                        value={materials_selected.lightingMood}
                        onChange={(e) =>
                          setMaterialsSelected({ ...materials_selected, lightingMood: e.target.value })
                        }
                        className={isDark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-white text-gray-900 border-gray-300'}
                        style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid', borderRadius: '0.5rem', outline: 'none' }}
                      >
                        {materials.lightingMoods?.map((mood: Material) => (
                          <option key={mood.id} value={mood.id}>
                            {mood.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    style={{ width: '100%', background: '#2563eb', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: '600', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    {isLoading ? (
                      <>
                        <Loader style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles style={{ width: '1.25rem', height: '1.25rem' }} />
                        Generate Transformation
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Latest Transformation */}
          {generations.length > 0 && (
            <div style={{ gridColumn: 'span 2' }}>
              <ModernTransformationCard
                beforeImage={generations[0].beforeImageUrl}
                afterImage={generations[0].afterImageUrl}
                style={generations[0].style}
                roomType={generations[0].roomType}
                createdAt={generations[0].createdAt}
                isDark={isDark}
                onViewAll={() => router.push('/history')}
                onViewDetails={() => router.push(`/history?imageId=${generations[0].id}`)}
                onDownload={() => {
                  const link = document.createElement('a');
                  link.href = generations[0].afterImageUrl;
                  link.download = `spavix-transformation-${generations[0].id}.jpg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              />
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
            padding-top: 1rem !important;
          }
          .dashboard-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
      </div>
    </>
  );
}
