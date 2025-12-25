'use client';
import React, { useState } from 'react';
import { X, Download, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernTransformationCardProps {
  beforeImage: string;
  afterImage: string;
  style: string;
  roomType: string;
  createdAt: string;
  isDark: boolean;
  onViewAll?: () => void;
  onViewDetails?: () => void;
  onDownload?: () => void;
}

export const ModernTransformationCard = ({
  beforeImage,
  afterImage,
  style,
  roomType,
  createdAt,
  isDark,
  onViewAll,
  onViewDetails,
  onDownload,
}: ModernTransformationCardProps) => {
  const [expandedImage, setExpandedImage] = useState<'before' | 'after' | null>(null);

  return (
    <>
      <div
        className={cn(
          'rounded-2xl overflow-hidden transition-all duration-300',
          isDark
            ? 'bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
        )}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={cn(
                'text-xl font-bold',
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                Latest Transformation
              </h2>
            </div>
            <button
              onClick={onViewAll}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
                isDark
                  ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/40 border border-blue-500/50'
                  : 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 border border-blue-400/50'
              )}
            >
              View All
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Before/After Images */}
          <div className="grid grid-cols-2 gap-4">
            {/* Before Image */}
            <div
              onClick={() => setExpandedImage('before')}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
            >
              <img
                src={beforeImage}
                alt="Before"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3C/svg%3E';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className={cn(
                  'text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  isDark ? 'text-white' : 'text-white'
                )}>
                  Click to expand
                </span>
              </div>
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
                BEFORE
              </div>
            </div>

            {/* After Image */}
            <div
              onClick={() => setExpandedImage('after')}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
            >
              <img
                src={afterImage}
                alt="After"
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23e5e7eb" width="300" height="200"/%3E%3C/svg%3E';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <span className={cn(
                  'text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  isDark ? 'text-white' : 'text-white'
                )}>
                  Click to expand
                </span>
              </div>
              <div className="absolute top-2 right-2 bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-semibold">
                AFTER
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <h3 className={cn(
              'text-lg font-bold capitalize',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {style.replace(/-/g, ' ')}
            </h3>
            <p className={cn(
              'text-sm',
              isDark ? 'text-neutral-400' : 'text-gray-600'
            )}>
              {roomType.replace(/_/g, ' ')} • {createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Just now'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={onDownload}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
                isDark
                  ? 'bg-green-600/30 text-green-300 hover:bg-green-600/40 border border-green-500/50'
                  : 'bg-green-500/20 text-green-700 hover:bg-green-500/30 border border-green-400/50'
              )}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={onViewDetails}
              className={cn(
                'flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
                isDark
                  ? 'bg-purple-600/30 text-purple-300 hover:bg-purple-600/40 border border-purple-500/50'
                  : 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 border border-purple-400/50'
              )}
            >
              <ShoppingCart size={16} />
              Details
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={expandedImage === 'before' ? beforeImage : afterImage}
              alt={expandedImage === 'before' ? 'Before' : 'After'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23333" width="800" height="600"/%3E%3C/svg%3E';
              }}
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-lg transition-all duration-200"
            >
              <X size={24} />
            </button>
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-semibold">
              {expandedImage === 'before' ? 'BEFORE' : 'AFTER'}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
