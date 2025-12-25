import React from 'react';

export const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '0.5rem', style = {} }: any) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
      ...style,
    }}
  />
);

export const ImageSkeleton = () => (
  <div
    style={{
      width: '100%',
      height: '300px',
      borderRadius: '0.75rem',
      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s infinite',
    }}
  />
);

export const CardSkeleton = () => (
  <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.07)' }}>
    <SkeletonLoader width="60%" height="24px" />
    <div style={{ marginTop: '1rem' }}>
      <SkeletonLoader width="100%" height="16px" />
      <SkeletonLoader width="90%" height="16px" style={{ marginTop: '0.5rem' }} />
      <SkeletonLoader width="70%" height="16px" style={{ marginTop: '0.5rem' }} />
    </div>
  </div>
);

export const GenerationCardSkeleton = () => (
  <div style={{ borderRadius: '0.75rem', overflow: 'hidden', background: '#f9fafb', border: '1px solid #e5e7eb' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', marginBottom: '0.75rem' }}>
      <ImageSkeleton />
      <ImageSkeleton />
    </div>
    <div style={{ padding: '0.75rem' }}>
      <SkeletonLoader width="60%" height="16px" />
      <SkeletonLoader width="80%" height="12px" style={{ marginTop: '0.5rem' }} />
    </div>
  </div>
);

export const HistoryPageSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
    {/* Left sidebar */}
    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem' }}>
      <SkeletonLoader width="80%" height="20px" />
      <div style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
        {[1, 2, 3].map((i) => (
          <GenerationCardSkeleton key={i} />
        ))}
      </div>
    </div>

    {/* Right detail view */}
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <ImageSkeleton />
        <ImageSkeleton />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
    <div style={{ gridColumn: 'span 2' }}>
      <CardSkeleton />
    </div>
    <div style={{ gridColumn: 'span 2' }}>
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '2rem' }}>
        <SkeletonLoader width="40%" height="24px" />
        <div style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <ImageSkeleton />
          <ImageSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonStyles = () => (
  <style>{`
    @keyframes shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
  `}</style>
);
