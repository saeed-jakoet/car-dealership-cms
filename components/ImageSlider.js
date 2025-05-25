// app/admin/cars/[id]/components/ImageSlider.js
'use client';
import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function ImageSlider({ images }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="embla relative overflow-hidden rounded-xl">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container flex">
          {images.map((img, index) => (
            <div className="embla__slide flex-[0_0_100%] min-w-0 relative" key={index}>
              <img
                src={img}
                alt={`Car image ${index + 1}`}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder.jpg';
                  e.target.alt = 'Image not available';
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
        onClick={scrollPrev}
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white transition-all"
        onClick={scrollNext}
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              emblaApi?.selectedScrollSnap() === index 
                ? 'bg-white' 
                : 'bg-white/50'
            }`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
}