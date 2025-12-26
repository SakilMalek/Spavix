import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2, RotateCcw as Reset, ZoomIn, ZoomOut, Crop } from 'lucide-react';

export interface ImageEdits {
  crop: { x: number; y: number; width: number; height: number };
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  zoom: number;
}

interface ImageEditorProps {
  image: string;
  onApply: (croppedImage: string, edits: ImageEdits) => void;
  onCancel: () => void;
  isDark: boolean;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  image,
  onApply,
  onCancel,
  isDark,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [imgElement, setImgElement] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImgElement(img);
    img.onerror = () => console.error('Failed to load image');
    img.src = image;
  }, [image]);

  useEffect(() => {
    if (!imgElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 500;
    canvas.height = 400;

    ctx.fillStyle = isDark ? '#0f172a' : '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    const scale = Math.min(
      (canvas.width * zoom) / imgElement.width,
      (canvas.height * zoom) / imgElement.height
    );

    const x = (canvas.width - imgElement.width * scale) / 2;
    const y = (canvas.height - imgElement.height * scale) / 2;

    ctx.drawImage(imgElement, x, y, imgElement.width * scale, imgElement.height * scale);
    ctx.restore();
  }, [imgElement, zoom, rotation, flipH, flipV, isDark]);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (err) => reject(err));
      img.src = url;
    });


  const getCroppedImg = async (): Promise<string> => {
    try {
      const img = await createImage(image);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Could not get canvas context');

      ctx.save();
      ctx.translate(img.width / 2, img.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-img.width / 2, -img.height / 2);
      ctx.drawImage(img, 0, 0);
      ctx.restore();

      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (error) {
      console.error('Error processing image:', error);
      throw error;
    }
  };

  const handleApply = async () => {
    try {
      const croppedImage = await getCroppedImg();
      onApply(croppedImage, {
        crop: { x: 0, y: 0, width: 100, height: 100 },
        rotation,
        flipH,
        flipV,
        zoom,
      });
    } catch (error) {
      console.error('Error applying crop:', error);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const rotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const rotateRight = () => setRotation((prev) => (prev + 90) % 360);

  return (
    <div
      className={isDark ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-white to-slate-50'}
      style={{
        borderRadius: '1rem',
        boxShadow: isDark 
          ? '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' 
          : '0 20px 60px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        padding: '2.5rem',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .edit-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .edit-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .edit-button:active {
          transform: translateY(0);
        }
        .edit-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }
        .edit-button:hover::before {
          left: 100%;
        }
        canvas {
          cursor: grab;
          transition: cursor 0.2s;
        }
        canvas:active {
          cursor: grabbing;
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{
          padding: '0.5rem 1rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Crop size={20} color="white" />
        </div>
        <h2
          className={isDark ? 'text-white' : 'text-gray-900'}
          style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}
        >
          Edit Image
        </h2>
      </div>

      {/* Preview Canvas */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          marginBottom: '2rem',
          borderRadius: '1rem',
          overflow: 'hidden',
          backgroundColor: isDark ? '#0f172a' : '#f8fafc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '420px',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          boxShadow: isDark 
            ? 'inset 0 2px 8px rgba(0,0,0,0.3)' 
            : 'inset 0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            borderRadius: '0.75rem',
          }}
        />
      </div>

      {/* Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Rotation Controls */}
        <div>
          <label
            className={isDark ? 'text-slate-300' : 'text-slate-700'}
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '700',
              marginBottom: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}
          >
            Rotation
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={rotateLeft}
              className="edit-button"
              style={{
                flex: 1,
                padding: '0.875rem',
                background: isDark 
                  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                color: isDark ? '#e2e8f0' : '#1e293b',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
              title="Rotate 90° counter-clockwise"
            >
              <RotateCcw size={18} />
              <span>Left</span>
            </button>
            <button
              onClick={rotateRight}
              className="edit-button"
              style={{
                flex: 1,
                padding: '0.875rem',
                background: isDark 
                  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                color: isDark ? '#e2e8f0' : '#1e293b',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
              title="Rotate 90° clockwise"
            >
              <RotateCw size={18} />
              <span>Right</span>
            </button>
          </div>
          <p
            className={isDark ? 'text-slate-500' : 'text-slate-600'}
            style={{ fontSize: '0.75rem', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}
          >
            Current: <strong>{rotation}°</strong>
          </p>
        </div>

        {/* Flip Controls */}
        <div>
          <label
            className={isDark ? 'text-slate-300' : 'text-slate-700'}
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '700',
              marginBottom: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}
          >
            Flip
          </label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setFlipH(!flipH)}
              className="edit-button"
              style={{
                flex: 1,
                padding: '0.875rem',
                background: flipH
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : isDark 
                  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                color: flipH ? 'white' : isDark ? '#e2e8f0' : '#1e293b',
                border: flipH ? '1px solid rgba(59, 130, 246, 0.5)' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
              title="Flip horizontally"
            >
              <FlipHorizontal2 size={18} />
              <span>H</span>
            </button>
            <button
              onClick={() => setFlipV(!flipV)}
              className="edit-button"
              style={{
                flex: 1,
                padding: '0.875rem',
                background: flipV
                  ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                  : isDark 
                  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
                  : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                color: flipV ? 'white' : isDark ? '#e2e8f0' : '#1e293b',
                border: flipV ? '1px solid rgba(59, 130, 246, 0.5)' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                fontSize: '0.875rem',
              }}
              title="Flip vertically"
            >
              <FlipVertical2 size={18} />
              <span>V</span>
            </button>
          </div>
        </div>

        {/* Zoom Control */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label
            className={isDark ? 'text-slate-300' : 'text-slate-700'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              fontWeight: '700',
              marginBottom: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              opacity: 0.8,
            }}
          >
            <span>Zoom</span>
            <span style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '700',
            }}>
              {Math.round(zoom * 100)}%
            </span>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ZoomOut size={18} color={isDark ? '#64748b' : '#94a3b8'} />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{
                flex: 1,
                cursor: 'pointer',
                height: '6px',
                borderRadius: '3px',
                background: isDark 
                  ? 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + ((zoom - 0.5) / 2.5) * 100 + '%, #1e293b ' + ((zoom - 0.5) / 2.5) * 100 + '%, #1e293b 100%)'
                  : 'linear-gradient(to right, #3b82f6 0%, #3b82f6 ' + ((zoom - 0.5) / 2.5) * 100 + '%, #e2e8f0 ' + ((zoom - 0.5) / 2.5) * 100 + '%, #e2e8f0 100%)',
                outline: 'none',
              }}
            />
            <ZoomIn size={18} color={isDark ? '#64748b' : '#94a3b8'} />
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handleReset}
          className="edit-button"
          style={{
            padding: '0.875rem 1.5rem',
            background: isDark 
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            color: isDark ? '#e2e8f0' : '#1e293b',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9375rem',
          }}
          title="Reset all changes"
        >
          <Reset size={18} />
          Reset
        </button>
        <button
          onClick={onCancel}
          className="edit-button"
          style={{
            padding: '0.875rem 1.5rem',
            background: isDark 
              ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
              : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            color: isDark ? '#e2e8f0' : '#1e293b',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.9375rem',
          }}
          title="Cancel editing"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="edit-button"
          style={{
            padding: '0.875rem 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9375rem',
            boxShadow: '0 8px 16px rgba(59, 130, 246, 0.3)',
          }}
          title="Apply crop and continue"
        >
          <Crop size={18} />
          Apply & Continue
        </button>
      </div>
    </div>
  );
};
