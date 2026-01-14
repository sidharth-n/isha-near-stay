import React, { useState, useEffect } from 'react';
import { X, MapPin, Phone, Wifi, Car, Coffee, Wind, Star, Globe, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ReviewCard from './ReviewCard';

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
    // Get base URL without size parameters
    const baseUrl = m.url.split('=')[0];
    if (seen.has(baseUrl)) return false;
    seen.add(baseUrl);
    return true;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));
};

export default function StayModal({ stay, onClose }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  if (!stay) return null;
  
  // Get unique visible photos (deduplicated)
  const visiblePhotos = deduplicatePhotos(stay.media);
  const hasPhotos = visiblePhotos.length > 0;
  const hasMultiplePhotos = visiblePhotos.length > 1;
  
  // Get unique reviews
  const uniqueReviews = (stay.reviews || []).filter((review, index, self) =>
    index === self.findIndex(r => r.text === review.text)
  );

  // Helper to get icon for amenity
  const getAmenityIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('wifi') || lower.includes('net')) return <Wifi size={16} />;
    if (lower.includes('park') || lower.includes('vehicle')) return <Car size={16} />;
    if (lower.includes('tea') || lower.includes('coffee') || lower.includes('kitchen')) return <Coffee size={16} />;
    if (lower.includes('ac') || lower.includes('air cond') || lower.includes('fan')) return <Wind size={16} />;
    return <div className="w-1.5 h-1.5 rounded-full bg-sage-500" />;
  };
  
  // Get fallback image
  const getFallbackImage = () => {
    return '/images/placeholder-stay.png';
  };
  
  const currentImage = hasPhotos ? visiblePhotos[currentPhotoIndex]?.url : getFallbackImage();
  
  // Navigation
  const nextPhoto = () => setCurrentPhotoIndex((prev) => (prev + 1) % visiblePhotos.length);
  const prevPhoto = () => setCurrentPhotoIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
  
  // Touch swipe handling
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance && hasMultiplePhotos) {
      nextPhoto();
      setIsAutoPaused(true); // Pause auto-swipe on manual interaction
    }
    if (distance < -minSwipeDistance && hasMultiplePhotos) {
      prevPhoto();
      setIsAutoPaused(true);
    }
  };
  
  // Auto-swipe timer (like Airbnb)
  const [isAutoPaused, setIsAutoPaused] = useState(false);
  
  useEffect(() => {
    if (!hasMultiplePhotos || isAutoPaused) return;
    
    const timer = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % visiblePhotos.length);
    }, 4000); // Change photo every 4 seconds
    
    return () => clearInterval(timer);
  }, [hasMultiplePhotos, isAutoPaused, visiblePhotos.length]);
  
  // Resume auto-swipe after 10 seconds of no interaction
  useEffect(() => {
    if (!isAutoPaused) return;
    const resumeTimer = setTimeout(() => setIsAutoPaused(false), 10000);
    return () => clearTimeout(resumeTimer);
  }, [isAutoPaused]);
  
  // Manual navigation with pause
  const handlePrevPhoto = () => {
    prevPhoto();
    setIsAutoPaused(true);
  };
  
  const handleNextPhoto = () => {
    nextPhoto();
    setIsAutoPaused(true);
  };
  
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white md:bg-black/50 md:backdrop-blur-sm md:flex md:items-center md:justify-center md:p-4">
      {/* Desktop backdrop click */}
      <div className="hidden md:block absolute inset-0" onClick={onClose} />
      
      {/* Modal Container - Full screen on mobile, centered on desktop */}
      <div className="relative w-full h-full md:max-w-2xl md:max-h-[90vh] md:h-auto bg-white md:rounded-3xl overflow-hidden flex flex-col">
        
        {/* Hero Image Section with Carousel */}
        <div 
          className="relative h-64 sm:h-72 md:h-80 bg-earth-100 shrink-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img 
            src={currentImage}
            alt={stay.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-colors shadow-lg z-10"
          >
            <X size={20} />
          </button>
          
          {/* Navigation arrows - visible on all devices */}
          {hasMultiplePhotos && (
            <>
              <button 
                onClick={handlePrevPhoto}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full text-earth-800 hover:bg-white active:scale-95 transition-all shadow-lg z-10"
              >
                <ChevronLeft size={22} />
              </button>
              <button 
                onClick={handleNextPhoto}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-white/90 rounded-full text-earth-800 hover:bg-white active:scale-95 transition-all shadow-lg z-10"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
          
          {/* Photo indicators */}
          {hasMultiplePhotos && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
              {visiblePhotos.slice(0, 8).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPhotoIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentPhotoIndex 
                      ? 'bg-white w-4' 
                      : 'bg-white/50'
                  }`}
                />
              ))}
              {visiblePhotos.length > 8 && (
                <span className="text-white/70 text-xs ml-1">+{visiblePhotos.length - 8}</span>
              )}
            </div>
          )}
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-white/90 text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {getShortCategory(stay.category)}
              </span>
              {stay.rating && (
                <span className="flex items-center gap-1 text-white bg-amber-500 px-2.5 py-1 rounded-full text-xs font-bold">
                  <Star size={12} className="fill-white" />
                  {stay.rating}
                  {stay.reviewCount && <span className="font-normal opacity-80">({stay.reviewCount})</span>}
                </span>
              )}
              <span className="text-white/80 text-xs bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                {stay.distance}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              {stay.name}
            </h2>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <div className="p-5 space-y-6">
            
            {/* Quick Actions - Sticky feel */}
            <div className="flex gap-3">
              <a 
                href={`tel:${stay.contact.split('/')[0].trim()}`}
                className="flex-1 bg-gradient-to-r from-earth-800 to-earth-900 text-white py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-transform"
              >
                <Phone size={18} />
                Call Now
              </a>
              {stay.mapLink && (
                <a 
                  href={stay.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-sage-100 text-sage-800 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <MapPin size={18} />
                  Directions
                </a>
              )}
            </div>
            
            {/* Website button */}
            {stay.website && (
              <a 
                href={stay.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-earth-100 text-earth-700 py-3 rounded-2xl font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Globe size={16} />
                Visit Website
                <ExternalLink size={14} className="opacity-50" />
              </a>
            )}

            {/* Details Card */}
            <div className="bg-earth-50 rounded-2xl p-4 space-y-3">
              <h3 className="font-serif font-bold text-earth-900">Details</h3>
              
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="shrink-0 mt-0.5 text-sage-500" size={16} />
                  <div>
                    <span className="font-medium text-earth-600">Distance</span>
                    <p className="text-earth-900">{stay.distance} from Isha</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="shrink-0 mt-0.5 text-sage-500" size={16} />
                  <div>
                    <span className="font-medium text-earth-600">Contact</span>
                    <p className="text-earth-900">{stay.contact.replace(/<br\/>/g, ', ')}</p>
                  </div>
                </div>
                
                {stay.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="shrink-0 mt-0.5 text-sage-500" size={16} />
                    <div>
                      <span className="font-medium text-earth-600">Address</span>
                      <p className="text-earth-900 text-sm">{stay.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {stay.amenities?.length > 0 && stay.amenities[0] !== '—' && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-earth-900">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {stay.amenities.slice(0, 8).map((amenity, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-earth-700 bg-earth-50 p-3 rounded-xl">
                      <span className="shrink-0 mt-0.5 text-sage-500">
                        {getAmenityIcon(amenity)}
                      </span>
                      <span className="line-clamp-2">{amenity}</span>
                    </div>
                  ))}
                </div>
                {stay.amenities.length > 8 && (
                  <p className="text-sage-600 text-sm font-medium text-center">
                    +{stay.amenities.length - 8} more amenities
                  </p>
                )}
              </div>
            )}

            {/* Transportation */}
            {stay.transport?.length > 0 && stay.transport[0] !== '—' && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-earth-900">Getting There</h3>
                <div className="space-y-2">
                  {stay.transport.map((item, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-earth-50 to-sage-50 p-3.5 rounded-xl text-sm text-earth-700 flex items-center gap-2">
                      <Car className="text-sage-500 shrink-0" size={16} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reviews Section */}
            {uniqueReviews.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-earth-900">Reviews</h3>
                  {stay.reviewCount && (
                    <span className="text-xs text-earth-500 bg-earth-100 px-2.5 py-1 rounded-full">
                      {stay.reviewCount} on Google
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {uniqueReviews.slice(0, 3).map((review, idx) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Photo Gallery Thumbnails */}
            {visiblePhotos.length > 1 && (
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-earth-900">Photos</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
                  {visiblePhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all ${
                        idx === currentPhotoIndex 
                          ? 'ring-2 ring-sage-500 ring-offset-2 scale-105' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={`${stay.name} photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Bottom padding for safe area */}
            <div className="h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
