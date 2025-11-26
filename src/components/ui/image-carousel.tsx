import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPhotoUrl } from "@/lib/utils";
import { CafePhoto } from "@/integrations/server/types";

interface ImageCarouselProps {
  photos: CafePhoto[];
  altText: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ photos, altText }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<number>>(new Set());

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleImageError = (index: number) => {
    setImageError((prev) => new Set(prev).add(index));
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-to-br from-[#e5d8c2] to-[#d4c4a8] flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="text-8xl mb-4">☕</div>
          <p className="text-[#746650] font-medium text-lg">No Images</p>
        </div>
      </div>
    );
  }

  // Sort photos by order, with primary first
  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return a.order - b.order;
  });

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="overflow-hidden rounded-lg" ref={emblaRef}>
        <div className="flex">
          {sortedPhotos.map((photo, index) => (
            <div key={photo.id} className="flex-[0_0_100%] min-w-0">
              {imageError.has(index) ? (
                <div className="w-full h-[400px] bg-gradient-to-br from-[#e5d8c2] to-[#d4c4a8] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">☕</div>
                    <p className="text-[#746650] font-medium text-lg">Image Error</p>
                  </div>
                </div>
              ) : (
                <img
                  src={formatPhotoUrl(photo.photo_url)}
                  alt={`${altText} - Image ${index + 1}`}
                  className="w-full h-[400px] object-cover"
                  onError={() => handleImageError(index)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons - Only show if more than 1 photo */}
      {sortedPhotos.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#746650] rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#746650] rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {sortedPhotos.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === selectedIndex ? "bg-white w-6" : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>

          {/* Image Counter */}
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
            {selectedIndex + 1} / {sortedPhotos.length}
          </div>
        </>
      )}
    </div>
  );
};
