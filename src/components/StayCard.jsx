import React from 'react';
import { MapPin, Phone, ExternalLink } from 'lucide-react';

export default function StayCard({ stay, onClick }) {
  // Generate a placeholder image based on category or id to make it look nicer
  const getPlaceholderImage = (category) => {
    if (category.includes('Cottage')) return 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Resort')) return 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600';
    if (category.includes('Farm')) return 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=600';
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600';
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-earth-100 group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getPlaceholderImage(stay.category)} 
          alt={stay.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-earth-800 shadow-sm">
          {stay.distance}
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs font-medium text-earth-500 mb-1 uppercase tracking-wider">
          {stay.category.split('(')[0].trim()}
        </div>
        <h3 className="text-lg font-serif font-bold text-earth-900 mb-2 line-clamp-1">
          {stay.name}
        </h3>
        
        <div className="flex items-center gap-4 mt-4">
          <button 
            className="flex-1 bg-earth-800 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-earth-900 transition-colors flex items-center justify-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${stay.contact.split('/')[0].trim()}`, '_self');
            }}
          >
            <Phone size={16} />
            Call
          </button>
          {stay.mapLink && (
            <button 
              className="flex-1 bg-sage-100 text-sage-800 py-2 px-4 rounded-lg text-sm font-medium hover:bg-sage-200 transition-colors flex items-center justify-center gap-2"
              onClick={(e) => {
                e.stopPropagation();
                window.open(stay.mapLink, '_blank');
              }}
            >
              <MapPin size={16} />
              Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
