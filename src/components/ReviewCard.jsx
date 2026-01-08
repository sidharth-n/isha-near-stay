import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewCard({ review }) {
  const { author, text, rating, date } = review;
  
  // Clean up author name (remove review count if present)
  const cleanAuthor = author?.replace(/\d+\s*reviews?$/i, '').trim() || 'Anonymous';
  
  return (
    <div className="bg-earth-50 rounded-xl p-4 border border-earth-100">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar with initial */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center text-white font-bold text-sm">
            {cleanAuthor.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-medium text-earth-900 text-sm">{cleanAuthor}</h4>
            {date && (
              <p className="text-xs text-earth-500">{date}</p>
            )}
          </div>
        </div>
        
        {/* Rating stars */}
        {rating && (
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-earth-200'}
              />
            ))}
          </div>
        )}
      </div>
      
      <p className="text-earth-700 text-sm leading-relaxed line-clamp-4">
        {text}
      </p>
    </div>
  );
}
