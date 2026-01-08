import React from 'react';
import { X, MapPin, Phone, Wifi, Car, Coffee, Wind } from 'lucide-react';

export default function StayModal({ stay, onClose }) {
  if (!stay) return null;

  // Helper to get icon for amenity
  const getAmenityIcon = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('wifi') || lower.includes('net')) return <Wifi size={18} />;
    if (lower.includes('park') || lower.includes('vehicle')) return <Car size={18} />;
    if (lower.includes('tea') || lower.includes('coffee') || lower.includes('kitchen')) return <Coffee size={18} />;
    if (lower.includes('ac') || lower.includes('air cond') || lower.includes('fan')) return <Wind size={18} />;
    return <div className="w-2 h-2 rounded-full bg-earth-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header Image Area */}
        <div className="relative h-48 sm:h-64 bg-earth-100 shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200" 
            alt={stay.name}
            className="w-full h-full object-cover"
          />
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-earth-800 hover:bg-white transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
            <div className="text-white/90 text-sm font-medium mb-1">{stay.category}</div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              {stay.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <a 
                href={`tel:${stay.contact.split('/')[0].trim()}`}
                className="flex-1 min-w-[140px] bg-earth-800 text-white py-3 px-6 rounded-xl font-medium hover:bg-earth-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone size={18} />
                Call Now
              </a>
              {stay.mapLink && (
                <a 
                  href={stay.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] bg-sage-100 text-sage-800 py-3 px-6 rounded-xl font-medium hover:bg-sage-200 transition-colors flex items-center justify-center gap-2"
                >
                  <MapPin size={18} />
                  Get Directions
                </a>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                  Details
                </h3>
                <div className="space-y-3 text-earth-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="shrink-0 mt-1 text-earth-400" size={18} />
                    <div>
                      <span className="font-medium text-earth-900">Distance:</span> {stay.distance}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="shrink-0 mt-1 text-earth-400" size={18} />
                    <div>
                      <span className="font-medium text-earth-900">Contact:</span> {stay.contact}
                    </div>
                  </div>
                </div>
              </div>

              {stay.amenities.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                    Amenities
                  </h3>
                  <ul className="space-y-2">
                    {stay.amenities.map((amenity, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-earth-700 text-sm">
                        <span className="shrink-0 mt-0.5 text-sage-500">
                          {getAmenityIcon(amenity)}
                        </span>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {stay.transport.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-serif font-bold text-earth-900 border-b border-earth-100 pb-2">
                  Transportation & Access
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {stay.transport.map((item, idx) => (
                    <li key={idx} className="bg-earth-50 p-3 rounded-lg text-sm text-earth-700 border border-earth-100">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
