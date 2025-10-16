import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JobCard from './JobCard';
import { useRef, useState, useEffect } from 'react';
import { LazyComponent } from './PerformanceOptimizations';

interface JobCarouselProps {
  title: string;
  jobs: any[];
  priority?: boolean;
}

export default function JobCarousel({ title, jobs, priority = false }: JobCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(priority);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldAnimate(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (jobs.length === 0) return null;

  return (
    <section 
      ref={carouselRef} 
      className="mb-12" 
      style={{ minHeight: '300px' }}
      aria-label={`${title} carousel`}
    >
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="relative group" style={{ minHeight: '250px' }} role="region" aria-roledescription="carousel">
        {shouldAnimate && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('left')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scroll('left');
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
              aria-label={`Scroll ${title} carousel left`}
            >
              <ChevronLeft className="w-6 h-6" aria-hidden="true" />
            </Button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              role="list"
              aria-label={`${title} job listings`}
            >
              {jobs.map((job, index) => (
                <div key={job.id} className="snap-start" role="listitem">
                  <JobCard job={job} priority={priority && index < 4} />
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll('right')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  scroll('right');
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/70 hover:bg-black/90 text-white rounded-full opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--focus-outline))] focus-visible:ring-offset-2"
              aria-label={`Scroll ${title} carousel right`}
            >
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
