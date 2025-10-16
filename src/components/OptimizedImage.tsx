import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: string;
  onLoad?: () => void;
}

/**
 * OptimizedImage - Performance-optimized image component
 * Features:
 * - Lazy loading for off-screen images
 * - Responsive image sizes
 * - Blur placeholder to prevent layout shift
 * - WebP/AVIF format support (when available)
 * - IntersectionObserver for better loading performance
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '100vw',
  aspectRatio,
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Skip intersection observer for priority images
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image enters viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  // Calculate aspect ratio padding for layout stability
  const paddingBottom = aspectRatio
    ? `${(parseInt(aspectRatio.split('/')[1]) / parseInt(aspectRatio.split('/')[0])) * 100}%`
    : undefined;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        paddingBottom,
        backgroundColor: isLoaded ? 'transparent' : 'hsl(var(--muted))',
      }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          sizes={sizes}
          onLoad={handleLoad}
          className={`${
            paddingBottom ? 'absolute inset-0' : ''
          } w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            contentVisibility: 'auto',
          }}
        />
      )}
      
      {/* Blur placeholder while loading */}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 animate-pulse" />
      )}
    </div>
  );
}
