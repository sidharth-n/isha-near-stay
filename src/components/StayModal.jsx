import React, { useState } from 'react';
import { X, MapPin, Phone, Wifi, Car, Coffee, Wind, Star, Globe, ChevronLeft, ChevronRight, ExternalLink, Image } from 'lucide-react';
import PhotoGallery from './PhotoGallery';
import ReviewCard from './ReviewCard';

export default function StayModal({ stay, onClose }) {
  const [showGallery, setShowGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  if (!stay) return null;
  
  // Get visible media sorted by order
  const visibleMedia = (stay.media || [])
    .filter(m => m.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  
  const visiblePhotos = visibleMedia.filter(m => m.type === 'photo');
  
  // Get unique reviews (remove duplicates)
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
    if (stay.category.includes('Cottage')) return 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=1200';
    if (stay.category.includes('Resort')) return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200';
    if (stay.category.includes('Farm')) return 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=1200';
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';
  };
  
  const headerImage = visiblePhotos.length > 0 ? visiblePhotos[0].url : getFallbackImage();
  
  const nextPhoto = () => {
    if (visiblePhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % visiblePhotos.length);
    }
  };
  
  const prevPhoto = () => {
    if (visiblePhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* Hero Image Section */}
          <div className="relative h-64 sm:h-80 bg-earth-100 shrink-0 group">
            <img 
              src={visiblePhotos.length > 0 ? visiblePhotos[currentPhotoIndex].url : headerImage}
              alt={stay.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Navigation arrows for photos */}
            {visiblePhotos.length > 1 && (
              <>
                <button 
                  onClick={prevPhoto}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextPhoto}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            
            {/* Close button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2.5 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
            
            {/* Photo count & gallery button */}
            {visiblePhotos.length > 0 && (
              <button 
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg hover:bg-white transition-colors"
              >
                <Image size={16} className="text-earth-700" />
                <span className="text-sm font-semibold text-earth-800">
                  {currentPhotoIndex + 1} / {visiblePhotos.length}
                </span>
              </button>
            )}
            
            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 pt-16">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                  {stay.category.split('(')[0].trim()}
                </span>
                {stay.rating && (
                  <span className="flex items-center gap-1 text-white bg-amber-500/90 px-2.5 py-1 rounded-full text-sm font-bold">
                    <Star size={14} className="fill-white" />
                    {stay.rating}
                    {stay.reviewCount && (
                      <span className="font-normal opacity-80">({stay.reviewCount})</span>
                    )}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
                {stay.name}
              </h2>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-3">
                <a 
                  href={`tel:${stay.contact.split('/')[0].trim()}`}
                  className="flex-1 min-w-[130px] bg-gradient-to-r from-earth-800 to-earth-900 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-earth-900 hover:to-black transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <Phone size={18} />
                  Call Now
                </a>
                {stay.mapLink && (
                  <a 
                    href={stay.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[130px] bg-sage-100 text-sage-800 py-3.5 px-6 rounded-xl font-semibold hover:bg-sage-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <MapPin size={18} />
                    Directions
                  </a>
                )}
                {stay.website && (
                  <a 
                    href={stay.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[130px] bg-earth-100 text-earth-800 py-3.5 px-6 rounded-xl font-semibold hover:bg-earth-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Globe size={18} />
                    Website
                  </a>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                    Details
                  </h3>
                  <div className="space-y-3 text-earth-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="shrink-0 mt-0.5 text-sage-500" size={18} />
                      <div>
                        <span className="font-semibold text-earth-900">Distance:</span> {stay.distance}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="shrink-0 mt-0.5 text-sage-500" size={18} />
                      <div>
                        <span className="font-semibold text-earth-900">Contact:</span> {stay.contact.replace(/<br\/>/g, ', ')}
                      </div>
                    </div>
                    {stay.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="shrink-0 mt-0.5 text-sage-500" size={18} />
                        <div className="text-sm">
                          <span className="font-semibold text-earth-900">Address:</span><br/>
                          {stay.address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {stay.amenities?.length > 0 && stay.amenities[0] !== '—' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                      Amenities
                    </h3>
                    <ul className="space-y-2">
                      {stay.amenities.slice(0, 8).map((amenity, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-earth-700 text-sm">
                          <span className="shrink-0 mt-0.5 text-sage-500">
                            {getAmenityIcon(amenity)}
                          </span>
                          {amenity}
                        </li>
                      ))}
                      {stay.amenities.length > 8 && (
                        <li className="text-sage-600 text-sm font-medium">
                          +{stay.amenities.length - 8} more amenities
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Transportation */}
              {stay.transport?.length > 0 && stay.transport[0] !== '—' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                    Getting There
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {stay.transport.map((item, idx) => (
                      <div key={idx} className="bg-gradient-to-br from-earth-50 to-sage-50 p-4 rounded-xl text-sm text-earth-700 border border-earth-100">
                        <Car className="inline-block mr-2 text-sage-500" size={16} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Reviews Section */}
              {uniqueReviews.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-earth-100 pb-2">
                    <h3 className="text-lg font-serif font-bold text-earth-900">
                      Guest Reviews
                    </h3>
                    {stay.reviewCount && (
                      <span className="text-sm text-earth-500">
                        {stay.reviewCount} reviews on Google
                      </span>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {uniqueReviews.slice(0, 4).map((review, idx) => (
                      <ReviewCard key={idx} review={review} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Photo thumbnails */}
              {visiblePhotos.length > 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                    Photos
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {visiblePhotos.slice(0, 10).map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentPhotoIndex(idx);
                          setShowGallery(true);
                        }}
                        className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Photo Gallery */}
      {showGallery && (
        <PhotoGallery
          media={visibleMedia}
          stayName={stay.name}
          onClose={() => setShowGallery(false)}
          initialIndex={currentPhotoIndex}
        />
      )}
    </>
  );
}
