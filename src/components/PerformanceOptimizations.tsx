import { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function LazyImage({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  priority = false,
  objectFit = 'cover'
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(priority ? src : undefined);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (priority) return;

    let observer: IntersectionObserver;
    
    if (imageRef && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !imageSrc) {
              setImageSrc(src);
            }
          });
        },
        {
          rootMargin: '100px',
        }
      );
      
      observer.observe(imageRef);
    } else if (imageRef) {
      setImageSrc(src);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [imageRef, src, imageSrc, priority]);

  const aspectRatio = width && height ? `${width}/${height}` : undefined;

  // Generate WebP srcset for modern browsers
  const getModernSrcSet = (baseSrc: string) => {
    if (!baseSrc) return undefined;
    // If image is already WebP/AVIF, return as is
    if (baseSrc.match(/\.(webp|avif)$/i)) return baseSrc;
    
    // For external images, let browser handle it
    // In production, you'd use a CDN that auto-converts
    return baseSrc;
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      srcSet={imageSrc ? getModernSrcSet(imageSrc) : undefined}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setIsLoaded(true)}
      className={`${className} ${!isLoaded && !priority ? 'opacity-0 transition-opacity duration-300' : 'opacity-100'}`}
      style={{
        aspectRatio,
        objectFit,
        contentVisibility: priority ? 'visible' : 'auto',
      }}
    />
  );
}

interface LazyComponentProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
}

export function LazyComponent({ 
  children, 
  className = '',
  rootMargin = '100px',
  threshold = 0.01
}: LazyComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    let observer: IntersectionObserver;
    
    if (elementRef && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        {
          rootMargin,
          threshold,
        }
      );
      
      observer.observe(elementRef);
    } else if (elementRef) {
      setIsVisible(true);
    }

    return () => {
      if (observer && elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, rootMargin, threshold]);

  return (
    <div ref={setElementRef} className={className}>
      {isVisible ? children : <div style={{ minHeight: '200px' }} />}
    </div>
  );
}

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({ 
  items, 
  height, 
  itemHeight, 
  renderItem,
  overscan = 3,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{
        height: `${height}px`,
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: `${itemHeight}px` }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PrefetchLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  prefetch?: boolean;
}

export function PrefetchLink({ to, children, className, prefetch = true }: PrefetchLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!prefetch || !linkRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Prefetch the route module
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = to;
            document.head.appendChild(link);
            
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(linkRef.current);

    return () => observer.disconnect();
  }, [to, prefetch]);

  return (
    <a ref={linkRef} href={to} className={className}>
      {children}
    </a>
  );
}
