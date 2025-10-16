# Pflegeflix - Performance Optimization Guide

## Performance Features Implemented

### 1. Image Optimization
- **OptimizedImage Component**: Lazy loading, responsive sizes, blur placeholders
- WebP/AVIF format support when available
- IntersectionObserver for efficient loading (50px margin before viewport)
- Aspect ratio preservation to prevent layout shift
- Priority loading for above-fold images

### 2. Code Splitting
- Route-based lazy loading with React.lazy()
- Vendor chunk splitting (React, UI libraries, Supabase)
- Dynamic imports for heavy components
- CSS code splitting enabled
- Separate chunks for images and fonts

### 3. Core Web Vitals Monitoring
- **WebVitals Component**: Tracks LCP, INP, CLS, FCP, TTFB
- Real-time performance monitoring
- Analytics integration ready (Google Analytics, custom endpoint)
- Layout shift detection with PerformanceObserver

### 4. Font & Script Optimization
- Preloaded Inter font (400-700 weights) with font-display: swap
- DNS prefetch for Supabase API
- Preconnect to critical domains
- Module preload for main.tsx
- Prefetch for Search and JobDetails pages

### 5. Bundle Optimization
- Manual chunk splitting for better caching
- Tree shaking enabled
- Console/debugger removed in production
- Modern ES2020 target for smaller bundles
- esbuild for faster minification (3-4x faster than terser)
- 4KB asset inline limit
- Sourcemaps disabled in production

### 6. Performance Utilities
- Idle callback utilities (requestIdleCallback)
- Connection-aware loading (slow/medium/fast detection)
- Debounce/throttle helpers for events
- Low-end device detection (CPU cores, RAM)
- Reduced motion preference detection

## Performance Targets

| Metric | Target | Current Strategy |
|--------|--------|------------------|
| **LCP** | < 2.5s | Image lazy loading, font preloading, code splitting |
| **INP** | < 200ms | Debounced interactions, efficient event handlers |
| **CLS** | < 0.1 | Aspect ratio reservations, skeleton loaders, blur placeholders |
| **FCP** | < 1.8s | Critical CSS inline, preloaded fonts, prioritized resources |
| **TTFB** | < 600ms | Supabase CDN, edge functions, DNS prefetch |
| **Bundle Size** | < 800KB | Code splitting, tree shaking, modern targets |

## Usage Examples

### Using OptimizedImage
```tsx
import OptimizedImage from '@/components/OptimizedImage';

// Hero image (above fold) - priority loading
<OptimizedImage
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  aspectRatio="2/1"
  priority={true}
  sizes="100vw"
/>

// List item image - lazy loading
<OptimizedImage
  src="/job-thumbnail.jpg"
  alt="Job posting"
  width={400}
  height={300}
  aspectRatio="4/3"
  priority={false}
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### Using Performance Utilities
```tsx
import { 
  runWhenIdle, 
  debounce, 
  getConnectionSpeed,
  isLowEndDevice
} from '@/utils/performance';

// Defer non-critical operations
runWhenIdle(() => {
  // Analytics, prefetching, etc.
});

// Debounce search input
const handleSearch = debounce((query: string) => {
  fetchResults(query);
}, 300);

// Adaptive loading based on connection
const connectionSpeed = getConnectionSpeed();
if (connectionSpeed === 'fast') {
  loadHighResImages();
}

// Check for low-end devices
if (isLowEndDevice()) {
  // Reduce animations
}
```

## Testing Performance

1. **Build & Preview**
   ```bash
   npm run build
   npm run preview
   ```

2. **Lighthouse (Chrome DevTools)**
   - Target: 90+ performance score
   - Check all Core Web Vitals

3. **Network Throttling**
   - Test on "Slow 3G"
   - Verify progressive enhancement

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Performance](https://react.dev/learn/render-and-commit)
