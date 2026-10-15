import React, { useState } from 'react';
import { 
  MapPin, 
  Coffee, 
  Utensils, 
  Mountain, 
  ShoppingBag, 
  Star, 
  ExternalLink,
  MessageSquare,
  Navigation,
  Compass,
  Home,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { PropertyData, Recommendation } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface RecommendationsScreenProps {
  property: PropertyData;
  onBack: () => void;
  onAskAI: (prompt: string) => void;
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  property,
  onBack,
  onAskAI,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const coords = property.coordinates || { lat: 39.1677, lng: -120.1452, address: property.location };

  const categories = [
    { id: 'all', label: 'All Picks' },
    { id: 'starred', label: '★ Host Favorites' },
    { id: 'dining', label: 'Restaurants' },
    { id: 'coffee', label: 'Cafes & Breakfast' },
    { id: 'attraction', label: 'Attractions' },
    { id: 'outdoors', label: 'Hikes & Nature' },
    { id: 'activity', label: 'Activities' },
    { id: 'essentials', label: 'Groceries' },
  ];

  // Filter recommendations & strictly sort by rating (highest first)
  const filteredRecs = (property.recommendations || [])
    .filter((rec) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'starred') return rec.isStarred === true;
      if (selectedCategory === 'dining') return rec.category === 'dining';
      if (selectedCategory === 'coffee') return rec.category === 'coffee';
      if (selectedCategory === 'attraction') return rec.category === 'attraction';
      if (selectedCategory === 'outdoors') return rec.category === 'outdoors';
      if (selectedCategory === 'activity') return rec.category === 'activity';
      if (selectedCategory === 'essentials') return rec.category === 'essentials';
      return true;
    })
    .sort((a, b) => {
      // If starred, can place starred first if same rating, or strict rating
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0);
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coffee':
        return <Coffee className="w-4 h-4 text-[#9E5A3F]" />;
      case 'dining':
        return <Utensils className="w-4 h-4 text-[#9E5A3F]" />;
      case 'attraction':
        return <Compass className="w-4 h-4 text-[#2A4436]" />;
      case 'outdoors':
        return <Mountain className="w-4 h-4 text-[#2A4436]" />;
      case 'activity':
        return <Compass className="w-4 h-4 text-[#2A4436]" />;
      case 'essentials':
        return <ShoppingBag className="w-4 h-4 text-[#2A4436]" />;
      default:
        return <MapPin className="w-4 h-4 text-[#2A4436]" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Local Recommendations"
        subtitle={`Places near ${property.name}`}
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2A4436] text-white shadow-sm'
                  : 'bg-white dark:bg-[#1E1D1A] text-[#5C5A55] dark:text-neutral-300 hover:text-[#1C1B18] dark:hover:text-white border border-black/5 dark:border-white/10 shadow-soft-sm'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Recommendations List (Sorted by Rating: Highest First) */}
        <div className="space-y-3">
          {filteredRecs.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1E1D1A] rounded-2xl border border-black/5 dark:border-white/10 text-xs text-[#78756E] dark:text-neutral-400 space-y-2">
              <Compass className="w-8 h-8 text-[#78756E]/40 mx-auto" />
              <p>No places found in this category yet.</p>
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] underline cursor-pointer"
              >
                View all places
              </button>
            </div>
          ) : (
            filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 shadow-soft-sm space-y-2.5 hover:shadow-soft-card transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1.5 rounded-lg bg-[#F6F4F0] dark:bg-white/10 shrink-0">
                        {getCategoryIcon(rec.category)}
                      </span>
                      <h3 className="font-bold text-sm text-[#1C1B18] dark:text-white truncate">{rec.name}</h3>
                      {rec.isStarred && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-700/50 shrink-0">
                          ★ Host Recommended
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#2A4436] dark:text-[#78A88E] font-semibold mt-1 block">
                      {rec.type}
                    </span>
                  </div>

                  {/* Rating Badge: Prominent & sorted highest first */}
                  <div className="flex items-center gap-1 text-xs font-bold text-[#1C1B18] dark:text-white bg-[#F6F4F0] dark:bg-white/10 px-2.5 py-1 rounded-full shrink-0 shadow-soft-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{rec.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-[#5C5A55] dark:text-neutral-300 leading-relaxed">{rec.description}</p>

                {rec.highlight && (
                  <div className="p-2.5 rounded-xl bg-[#F6F4F0] dark:bg-white/5 border border-black/5 dark:border-white/5 text-[11px] text-[#3D3B36] dark:text-neutral-200 flex items-center justify-between">
                    <span>✨ <strong>Insider tip:</strong> {rec.highlight}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs text-[#78756E] dark:text-neutral-400">
                  <span className="truncate max-w-[210px]">📍 {rec.distance}</span>
                  {rec.mapsUrl ? (
                    <a
                      href={rec.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#2A4436] dark:text-[#78A88E] hover:underline font-bold"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rec.name)}+near+${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[#2A4436] dark:text-[#78A88E] hover:underline font-bold"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Ask AI for custom recommendations */}
          <button
            onClick={() => onAskAI(`What are more recommendations for activities, cafes and dining near ${property.name}?`)}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-xs font-semibold text-[#2A4436] dark:text-[#78A88E] border border-black/5 dark:border-white/10 shadow-soft-sm transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask Assistant for custom suggestions</span>
          </button>
        </div>
      </div>
    </div>
  );
};
