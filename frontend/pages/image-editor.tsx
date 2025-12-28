import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  RotateCw,
  RotateCcw,
  Crop,
  Zap,
  Sliders,
  Undo2,
  Redo2,
  RotateCcw as Reset,
  Download,
  Eye,
  EyeOff,
  ArrowLeft,
  Wand2,
  Brush,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { FileUpload } from '@/components/ui/file-upload';
import { motion } from 'motion/react';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';

interface EditState {
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  straighten: number;
}

interface HistoryEntry {
  state: EditState;
  timestamp: number;
}

export default function ImageEditor() {
  const router = useRouter();
  const { image: imageParam } = router.query;
  const [imageUrl, setImageUrl] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Edit state
  const [editState, setEditState] = useState<EditState>({
    rotation: 0,
    flipH: false,
    flipV: false,
    brightness: 0,
    contrast: 0,
    saturation: 0,
    straighten: 0,
  });

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI state
  const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'enhance' | 'remove'>('crop');
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  // Load image from URL or sessionStorage
  useEffect(() => {
    if (imageParam && typeof imageParam === 'string') {
      setImageUrl(imageParam);
      loadImage(imageParam);
    } else {
      // Check if image is in sessionStorage
      const storedImage = sessionStorage.getItem('imageToEdit');
      if (storedImage && storedImage.length > 0) {
        setImageUrl(storedImage);
        loadImage(storedImage);
      }
    }
  }, [imageParam]);

  const loadImage = (url: string) => {
    if (!url || url.length === 0) {
      toast.error('No image provided');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log('Image loaded successfully:', img.width, 'x', img.height);
      setOriginalImage(img);
      const initialState: EditState = {
        rotation: 0,
        flipH: false,
        flipV: false,
        brightness: 0,
        contrast: 0,
        saturation: 0,
        straighten: 0,
      };
      setHistory([{ state: initialState, timestamp: Date.now() }]);
      setHistoryIndex(0);
      // Use setTimeout to ensure canvas is ready
      setTimeout(() => drawCanvas(initialState), 100);
    };
    
    img.onerror = (error) => {
      console.error('Failed to load image:', error);
      toast.error('Failed to load image. Please try uploading again.');
    };
    
    // Ensure the URL is valid before setting src
    try {
      img.src = url;
    } catch (error) {
      console.error('Error setting image src:', error);
      toast.error('Invalid image data');
    }
  };

  const drawCanvas = useCallback(
    (state: EditState) => {
      if (!canvasRef.current || !originalImage) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 500;
      canvas.height = 400;

      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((state.rotation * Math.PI) / 180 + (state.straighten * Math.PI) / 180);
      ctx.scale(state.flipH ? -1 : 1, state.flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      const scale = Math.min(canvas.width / originalImage.width, canvas.height / originalImage.height);
      const x = (canvas.width - originalImage.width * scale) / 2;
      const y = (canvas.height - originalImage.height * scale) / 2;

      ctx.drawImage(originalImage, x, y, originalImage.width * scale, originalImage.height * scale);
      ctx.restore();

      // Apply color adjustments
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        // Brightness
        data[i] += state.brightness * 2.55;
        data[i + 1] += state.brightness * 2.55;
        data[i + 2] += state.brightness * 2.55;

        // Contrast
        const factor = (259 * (state.contrast + 255)) / (255 * (259 - state.contrast));
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;

        // Saturation
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = Math.round(gray + (data[i] - gray) * (1 + state.saturation / 100));
        data[i + 1] = Math.round(gray + (data[i + 1] - gray) * (1 + state.saturation / 100));
        data[i + 2] = Math.round(gray + (data[i + 2] - gray) * (1 + state.saturation / 100));

        // Clamp values
        data[i] = Math.max(0, Math.min(255, data[i]));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
      }

      ctx.putImageData(imageData, 0, 0);
    },
    [originalImage]
  );

  const updateEditState = (updates: Partial<EditState>) => {
    const newState = { ...editState, ...updates };
    setEditState(newState);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ state: newState, timestamp: Date.now() });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    drawCanvas(newState);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex].state;
      setEditState(state);
      drawCanvas(state);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const state = history[newIndex].state;
      setEditState(state);
      drawCanvas(state);
    }
  };

  const resetAll = () => {
    const initialState: EditState = {
      rotation: 0,
      flipH: false,
      flipV: false,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      straighten: 0,
    };
    updateEditState(initialState);
  };

  const autoEnhance = () => {
    setIsProcessing(true);
    setTimeout(() => {
      updateEditState({
        brightness: 15,
        contrast: 20,
        saturation: 25,
      });
      setIsProcessing(false);
      toast.success('Auto-enhance applied!');
    }, 500);
  };

  const downloadImage = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.download = `edited-image-${Date.now()}.jpg`;
      link.click();
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const saveAndContinue = async () => {
    if (!canvasRef.current) return;
    try {
      const editedImage = canvasRef.current.toDataURL('image/jpeg', 0.95);
      sessionStorage.setItem('editedImageData', editedImage);
      toast.success('Image saved! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (error) {
      toast.error('Failed to save image');
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setImageUrl(imageData);
        loadImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Head>
        <title>Image Editor - Spavix</title>
      </Head>

      <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', minHeight: '100vh' }}>
        {/* Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.back()}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  color: '#1e293b',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
              >
                <ArrowLeft size={24} />
              </button>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>
                Image Editor
              </h1>
            </div>

            {originalImage && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <HoverBorderGradient
                  onClick={downloadImage}
                  containerClassName="w-fit"
                  className="px-6 py-2 text-blue-600 font-semibold rounded-full flex items-center gap-2"
                >
                  <Download size={18} />
                  Download
                </HoverBorderGradient>
                <HoverBorderGradient
                  onClick={saveAndContinue}
                  containerClassName="w-fit"
                  className="px-6 py-2 text-blue-600 font-semibold rounded-full"
                >
                  Save & Continue
                </HoverBorderGradient>
              </div>
            )}
          </div>
        </motion.div>

        {/* Main Content */}
        {!originalImage ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}
          >
            <div style={{ width: '100%', maxWidth: '800px' }}>
              <FileUpload onChange={(files) => {
                if (files.length > 0) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const imageData = event.target?.result as string;
                    setImageUrl(imageData);
                    loadImage(imageData);
                  };
                  reader.readAsDataURL(files[0]);
                }
              }} />

              <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                  Or upload from dashboard to edit
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#3b82f6',
                    border: '1px solid #3b82f6',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff', e.currentTarget.style.borderColor = '#2563eb')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white', e.currentTarget.style.borderColor = '#3b82f6')}
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}
          >
            {/* Canvas Area */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '1rem',
              overflow: 'hidden',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              aspectRatio: '5/4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}>
              {showComparison && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  zIndex: 1,
                }} />
              )}
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                  zIndex: showComparison ? 0 : 1,
                }}
              />
            </div>

            {/* Comparison Toggle */}
            <button
              onClick={() => setShowComparison(!showComparison)}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: '#1e293b',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                width: '100%',
                justifyContent: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc', e.currentTarget.style.borderColor = '#cbd5e1')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'white', e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              {showComparison ? <Eye size={18} /> : <EyeOff size={18} />}
              {showComparison ? 'Hide Original' : 'Show Original'}
            </button>
          </div>

          {/* Controls Panel */}
          <div>
            {/* Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[
                { id: 'crop', label: 'Crop', icon: Crop },
                { id: 'adjust', label: 'Adjust', icon: Sliders },
                { id: 'enhance', label: 'Enhance', icon: Wand2 },
                { id: 'remove', label: 'Remove', icon: Brush },
              ].map(({ id, label, icon: Icon }, idx) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1, ease: 'easeOut' }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(id as any)}
                  style={{
                    padding: '0.75rem',
                    background: activeTab === id ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                    color: activeTab === id ? 'white' : '#475569',
                    border: activeTab === id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '0.625rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== id) {
                      e.currentTarget.style.background = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== id) {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }
                  }}
                >
                  <Icon size={16} />
                  {label}
                </motion.button>
              ))}
            </div>

            {/* Tab Content */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '1rem',
                padding: '1.5rem',
                minHeight: '300px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {/* Crop Tab */}
              {activeTab === 'crop' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>Crop & Rotate</h3>

                  {/* Rotation */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
                      Rotation: {editState.rotation}°
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateEditState({ rotation: (editState.rotation - 90 + 360) % 360 })}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'white',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.625rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc', e.currentTarget.style.borderColor = '#cbd5e1')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white', e.currentTarget.style.borderColor = '#e2e8f0')}
                      >
                        <RotateCcw size={16} />
                        Left
                      </button>
                      <button
                        onClick={() => updateEditState({ rotation: (editState.rotation + 90) % 360 })}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: 'white',
                          color: '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.625rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc', e.currentTarget.style.borderColor = '#cbd5e1')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'white', e.currentTarget.style.borderColor = '#e2e8f0')}
                      >
                        <RotateCw size={16} />
                        Right
                      </button>
                    </div>
                  </div>

                  {/* Flip */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>Flip</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => updateEditState({ flipH: !editState.flipH })}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: editState.flipH ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                          color: editState.flipH ? 'white' : '#1e293b',
                          border: editState.flipH ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '0.625rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!editState.flipH) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!editState.flipH) {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }
                        }}
                      >
                        Flip H
                      </button>
                      <button
                        onClick={() => updateEditState({ flipV: !editState.flipV })}
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          background: editState.flipV ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                          color: editState.flipV ? 'white' : '#1e293b',
                          border: editState.flipV ? '1px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '0.625rem',
                          cursor: 'pointer',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!editState.flipV) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.borderColor = '#cbd5e1';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!editState.flipV) {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                          }
                        }}
                      >
                        Flip V
                      </button>
                    </div>
                  </div>

                  {/* Aspect Ratio */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>Aspect Ratio</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {[
                        { label: 'Free', value: null },
                        { label: '1:1', value: 1 },
                        { label: '4:3', value: 4 / 3 },
                        { label: '16:9', value: 16 / 9 },
                        { label: '3:4', value: 3 / 4 },
                        { label: 'Original', value: originalImage ? originalImage.width / originalImage.height : 1 },
                      ].map(({ label, value }) => (
                        <button
                          key={label}
                          onClick={() => setAspectRatio(value)}
                          style={{
                            padding: '0.625rem',
                            background: aspectRatio === value ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'white',
                            color: aspectRatio === value ? 'white' : '#475569',
                            border: aspectRatio === value ? '1px solid #2563eb' : '1px solid #e2e8f0',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            fontSize: '0.8125rem',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            if (aspectRatio !== value) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (aspectRatio !== value) {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#e2e8f0';
                            }
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Adjust Tab */}
              {activeTab === 'adjust' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>Adjust Colors</h3>

                  {/* Brightness */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
                      Brightness: {editState.brightness}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.brightness}
                      onChange={(e) => updateEditState({ brightness: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        height: '8px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((editState.brightness + 100) / 200) * 100}%, #e2e8f0 ${((editState.brightness + 100) / 200) * 100}%, #e2e8f0 100%)`,
                        outline: 'none',
                        WebkitAppearance: 'none',
                      } as any}
                    />
                  </div>

                  {/* Contrast */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
                      Contrast: {editState.contrast}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.contrast}
                      onChange={(e) => updateEditState({ contrast: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        height: '8px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((editState.contrast + 100) / 200) * 100}%, #e2e8f0 ${((editState.contrast + 100) / 200) * 100}%, #e2e8f0 100%)`,
                        outline: 'none',
                        WebkitAppearance: 'none',
                      } as any}
                    />
                  </div>

                  {/* Saturation */}
                  <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem', color: '#475569' }}>
                      Saturation: {editState.saturation}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={editState.saturation}
                      onChange={(e) => updateEditState({ saturation: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        height: '8px',
                        borderRadius: '4px',
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((editState.saturation + 100) / 200) * 100}%, #e2e8f0 ${((editState.saturation + 100) / 200) * 100}%, #e2e8f0 100%)`,
                        outline: 'none',
                        WebkitAppearance: 'none',
                      } as any}
                    />
                  </div>
                </div>
              )}

              {/* Enhance Tab */}
              {activeTab === 'enhance' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>One-Tap Enhance</h3>

                  <button
                    onClick={autoEnhance}
                    disabled={isProcessing}
                    style={{
                      padding: '1rem',
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      opacity: isProcessing ? 0.7 : 1,
                      transition: 'all 0.3s',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(245, 158, 11, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isProcessing) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                      }
                    }}
                  >
                    <Zap size={20} />
                    {isProcessing ? 'Enhancing...' : 'Auto Enhance'}
                  </button>

                  <p style={{ fontSize: '0.875rem', margin: '1rem 0 0 0', color: '#64748b' }}>
                    Automatically adjusts brightness, contrast, and saturation for optimal results.
                  </p>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#475569' }}>Pro Features (Coming Soon)</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {['Straighten Tool', 'Perspective Correction', 'Color Temperature', 'Sharpen / Denoise'].map((feature) => (
                        <div
                          key={feature}
                          style={{
                            padding: '0.75rem',
                            background: '#f8fafc',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: '0.875rem', color: '#475569' }}>{feature}</span>
                          <Lock size={16} color='#cbd5e1' />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Remove Tab */}
              {activeTab === 'remove' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#1e293b' }}>Object Removal (Pro)</h3>

                  <div style={{
                    padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '0.75rem',
                    textAlign: 'center',
                  }}>
                    <Lock size={32} color='#cbd5e1' style={{ margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: '#475569' }}>Object removal is a Pro feature</p>
                    <p style={{ fontSize: '0.8125rem', margin: 0, color: '#64748b' }}>
                      Upgrade to Pro to remove unwanted objects, furniture, and clutter from your images.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={undo}
                disabled={historyIndex <= 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'white',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.625rem',
                  cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: historyIndex <= 0 ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (historyIndex > 0) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (historyIndex > 0) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <Undo2 size={16} />
                Undo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'white',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.625rem',
                  cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  opacity: historyIndex >= history.length - 1 ? 0.5 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (historyIndex < history.length - 1) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }
                }}
                onMouseLeave={(e) => {
                  if (historyIndex < history.length - 1) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
              >
                <Redo2 size={16} />
                Redo
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetAll}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.625rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.4)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)')}
              >
                <Reset size={16} />
                Reset
              </motion.button>
            </motion.div>
          </div>
          </motion.div>
        )}
      </div>

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          transition: all 0.2s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
          transition: all 0.2s;
        }
        input[type="range"]::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
