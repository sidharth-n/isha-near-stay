import React, { useState } from 'react';
import { MapPin, Phone, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Short category name mapping
const getShortCategory = (category) => {
  if (category.includes('Inside Isha')) return 'Inside Isha';
  if (category.includes('Home Stay')) return 'Homestay';
  if (category.includes('Dorm')) return 'Dorm';
  if (category.includes('Hotel') || category.includes('Residenc')) return 'Hotel';
  if (category.includes('Farm') || category.includes('Villa')) return 'Farm & Villa';
  if (category.includes('Resort')) return 'Resort';
  if (category.includes('Hall')) return 'Hall';
  return category.split('(')[0].trim().split(' ').slice(0, 2).join(' ');
};

// Deduplicate photos by comparing URL base (without size params)
const deduplicatePhotos = (media) => {
  if (!media) return [];
  const seen = new Set();
  return media.filter(m => {
    if (m.type !== 'photo' || m.visible === false) return false;
    const baseUrl = m.url.split('=')[0];
    if (seen.has(baseUrl)) return false;
    seen.add(baseUrl);
    return true;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));
};

export default function StayCard({ stay, onClick }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Fallback placeholder image
  const getPlaceholderImage = () => {
    return '/images/placeholder-stay.png';
  };
  
  // Get unique visible photos (deduplicated)
  const visiblePhotos = deduplicatePhotos(stay.media);
  
  const hasMultiplePhotos = visiblePhotos.length > 1;
  
  // Get current image URL
  const getCurrentImage = () => {
    if (imageError || visiblePhotos.length === 0) {
      return getPlaceholderImage(stay.category);
    }
    return visiblePhotos[currentImageIndex]?.url || getPlaceholderImage(stay.category);
  };
  
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % visiblePhotos.length);
  };
  
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
  };
  
  // Handle touch swipe
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = (e) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && hasMultiplePhotos) {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev + 1) % visiblePhotos.length);
    }
    if (isRightSwipe && hasMultiplePhotos) {
      e.stopPropagation();
      setCurrentImageIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="cursor-pointer group bg-white rounded-2xl p-2 border border-earth-100 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Image Carousel Container */}
      <div 
        className="relative aspect-[4/3] rounded-xl overflow-hidden bg-earth-100 mb-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img 
          src={getCurrentImage()} 
          alt={stay.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
        
        {/* Left/Right carousel arrows - visible on hover */}
        {hasMultiplePhotos && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-full text-earth-800 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-full text-earth-800 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
        
        {/* Image dots indicator */}
        {hasMultiplePhotos && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {visiblePhotos.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
        
        {/* Distance badge - top right */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-earth-700 shadow-sm">
          {stay.distance}
        </div>
      </div>
      
      {/* Content - Airbnb style clean info */}
      <div className="space-y-1">
        {/* Title and Rating row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-earth-900 line-clamp-1 text-[15px]">
            {stay.name}
          </h3>
          {stay.rating && (
            <div className="flex items-center gap-1 shrink-0">
              <Star size={12} className="fill-earth-900 text-earth-900" />
              <span className="text-sm text-earth-900">{stay.rating}</span>
            </div>
          )}
        </div>
        
        {/* Category */}
        <p className="text-sm text-earth-500">
          {getShortCategory(stay.category)}
        </p>
        
        {/* Action buttons - compact */}
        <div className="flex items-center gap-2 pt-2">
          {stay.mapLink && (
            <button 
              className="flex-1 bg-earth-100 text-earth-700 py-2 rounded-lg text-sm font-medium hover:bg-earth-200 transition-colors flex items-center justify-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(stay.mapLink, '_blank');
              }}
            >
              <MapPin size={14} />
              Map
            </button>
          )}
          <button 
            className="flex-1 bg-earth-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${stay.contact.split('/')[0].trim()}`, '_self');
            }}
          >
            <Phone size={14} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
}
