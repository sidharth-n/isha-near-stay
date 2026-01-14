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
  
  // Fallback placeholder images
  const getPlaceholderImage = (category) => {
    if (category.includes('Cottage')) return 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Resort')) return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Farm')) return 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Dorm') || category.includes('Hall')) return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600';
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
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-earth-100 group"
    >
      {/* Image Carousel Container */}
      <div 
        className="relative h-52 overflow-hidden bg-earth-100"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img 
          src={getCurrentImage()} 
          alt={stay.name}
          className="w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        
        {/* Left/Right carousel arrows */}
        {hasMultiplePhotos && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
        
        {/* Image dots indicator */}
        {hasMultiplePhotos && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {visiblePhotos.slice(0, 5).map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex 
                    ? 'bg-white w-3' 
                    : 'bg-white/60 hover:bg-white/80'
                }`}
              />
            ))}
            {visiblePhotos.length > 5 && (
              <span className="text-white/80 text-xs ml-1">+{visiblePhotos.length - 5}</span>
            )}
          </div>
        )}
        
        {/* Distance badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-earth-800 shadow-sm">
          {stay.distance}
        </div>
        
        {/* Rating badge */}
        {stay.rating && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold text-earth-900">{stay.rating}</span>
            {stay.reviewCount && (
              <span className="text-xs text-earth-500">({stay.reviewCount})</span>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="text-xs font-semibold text-sage-600 mb-1.5 uppercase tracking-wider">
          {getShortCategory(stay.category)}
        </div>
        <h3 className="text-lg font-serif font-bold text-earth-900 mb-3 line-clamp-1 group-hover:text-sage-700 transition-colors">
          {stay.name}
        </h3>
        
        {/* Action buttons - Map on left, Call on right */}
        <div className="flex items-center gap-2">
          {stay.mapLink && (
            <button 
              className="flex-1 bg-sage-100 text-sage-800 py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-sage-200 transition-colors flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(stay.mapLink, '_blank');
              }}
            >
              <MapPin size={15} />
              Map
            </button>
          )}
          <button 
            className="flex-1 bg-gradient-to-r from-earth-800 to-earth-900 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:from-earth-900 hover:to-black transition-all flex items-center justify-center gap-2 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${stay.contact.split('/')[0].trim()}`, '_self');
            }}
          >
            <Phone size={15} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
}
