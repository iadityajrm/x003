import React, { useState } from 'react';
import { Building2, Check } from 'lucide-react';
import { PROPERTIES } from '../../data/properties';
import { ScreenHeader } from './ScreenHeader';

interface PropertySwitcherScreenProps {
  currentSlug: string;
  onSelectProperty: (slug: string) => void;
  onBack: () => void;
}

export const PropertySwitcherScreen: React.FC<PropertySwitcherScreenProps> = ({
  currentSlug,
  onSelectProperty,
  onBack,
}) => {
  const [customSlugInput, setCustomSlugInput] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSlugInput.trim()) return;
    const clean = customSlugInput.toLowerCase().replace(/^\/stay\//, '').trim();
    onSelectProperty(clean);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title="Switch Stay"
        subtitle="Property URL slug routing"
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Preset Properties List */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#78756E] dark:text-neutral-400 block">
            Featured Properties
          </span>

          {Object.values(PROPERTIES).map((prop) => {
            const isCurrent = prop.slug === currentSlug;

            return (
              <button
                key={prop.slug}
                onClick={() => {
                  onSelectProperty(prop.slug);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-white dark:bg-[#1E1D1A] border-[#2A4436] dark:border-[#78A88E] shadow-soft-card'
                    : 'bg-white/80 dark:bg-[#1E1D1A]/80 hover:bg-white dark:hover:bg-[#1E1D1A] border-black/5 dark:border-white/10 shadow-soft-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={prop.heroImage}
                    alt={prop.name}
                    className="w-13 h-13 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#1C1B18] dark:text-white">{prop.name}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF2EC] dark:bg-[#2A4436]/40 text-[#2A4436] dark:text-[#78A88E]">
                          Active Stay
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#78756E] dark:text-neutral-400 mt-0.5">{prop.location}</p>
                    <span className="text-[11px] font-mono text-[#2A4436] dark:text-[#78A88E] font-semibold">/stay/{prop.slug}</span>
                  </div>
                </div>

                {isCurrent && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#2A4436] text-white shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom URL Slug Form */}
        <form onSubmit={handleCustomSubmit} className="p-4 rounded-2xl bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 shadow-soft-sm space-y-2.5 transition-colors">
          <span className="text-xs font-bold text-[#1C1B18] dark:text-white uppercase tracking-wider block">
            Enter Custom Property Slug
          </span>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-[#F6F4F0] dark:bg-white/10 border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs font-mono">
              <span className="text-[#78756E] dark:text-neutral-400">/stay/</span>
              <input
                type="text"
                value={customSlugInput}
                onChange={(e) => setCustomSlugInput(e.target.value)}
                placeholder="custom-cabin"
                className="flex-1 bg-transparent text-[#1C1B18] dark:text-white focus:outline-none ml-0.5"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer"
            >
              Go
            </button>
          </div>
          <p className="text-[11px] text-[#78756E] dark:text-neutral-400 leading-relaxed">
            When guests scan an on-property QR code, they automatically land on that property’s dedicated stay page.
          </p>
        </form>
      </div>
    </div>
  );
};
