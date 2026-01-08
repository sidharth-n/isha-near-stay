import React, { useState } from 'react';
import { MapPin, Phone, Star, ExternalLink, Image } from 'lucide-react';

export default function StayCard({ stay, onClick }) {
  const [imageError, setImageError] = useState(false);
  
  // Fallback placeholder images
  const getPlaceholderImage = (category) => {
    if (category.includes('Cottage')) return 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Resort')) return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Farm')) return 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Dorm') || category.includes('Hall')) return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=600';
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600';
  };
  
  // Get thumbnail from media (first visible photo sorted by order)
  const getThumbnail = () => {
    if (imageError) {
      return getPlaceholderImage(stay.category);
    }
    
    if (stay.media && stay.media.length > 0) {
      const visibleMedia = stay.media
        .filter(m => m.visible !== false && m.type === 'photo')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      if (visibleMedia.length > 0) {
        return visibleMedia[0].url;
      }
    }
    // Fallback placeholder based on category
    return getPlaceholderImage(stay.category);
  };
  
  const photoCount = stay.media?.filter(m => m.visible !== false).length || 0;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-earth-100 group"
    >
      {/* Image Container */}
      <div className="relative h-52 overflow-hidden bg-earth-100">
        <img 
          src={getThumbnail()} 
          alt={stay.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* Distance badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-earth-800 shadow-sm">
          {stay.distance}
        </div>
        
        {/* Photo count */}
        {photoCount > 0 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-white flex items-center gap-1.5">
            <Image size={12} />
            {photoCount}
          </div>
        )}
        
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
          {stay.category.split('(')[0].trim()}
        </div>
        <h3 className="text-lg font-serif font-bold text-earth-900 mb-1 line-clamp-1 group-hover:text-sage-700 transition-colors">
          {stay.name}
        </h3>
        
        {/* Address preview */}
        {stay.address && (
          <p className="text-xs text-earth-500 line-clamp-1 mb-3">
            {stay.address}
          </p>
        )}
        
        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3">
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
        </div>
      </div>
    </div>
  );
}
