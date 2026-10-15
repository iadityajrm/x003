import React from 'react';
import { 
  BookOpen, 
  Wifi, 
  KeyRound, 
  PhoneCall, 
  MapPin, 
  ChevronRight,
  Gamepad2,
  HelpCircle,
  Settings,
  Building2
} from 'lucide-react';
import { PropertyData } from '../../types';
import { ScreenHeader } from './ScreenHeader';

interface MenuScreenProps {
  property: PropertyData;
  onSelectOption: (option: 'guide' | 'wifi' | 'checkin' | 'host' | 'recommendations' | 'play' | 'call') => void;
  onBack: () => void;
  onOpenWebsite?: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  property,
  onSelectOption,
  onBack,
  onOpenWebsite,
}) => {
  const menuItems = [
    {
      id: 'play' as const,
      title: 'Cabin Play & Party Games',
      description: 'Truth or Dare & Never Have I Ever pass-and-play',
      icon: <Gamepad2 className="w-5 h-5 text-[#9E5A3F]" />,
      badge: '2 Games'
    },
    {
      id: 'checkin' as const,
      title: 'Getting inside & Check-in',
      description: 'Smart lock keypad & parking instructions',
      icon: <KeyRound className="w-5 h-5 text-[#2A4436]" />,
      badge: 'Ready'
    },
    {
      id: 'wifi' as const,
      title: 'Wi-Fi Details & QR Code',
      description: `${property.wifi.network} · Instant QR scan`,
      icon: <Wifi className="w-5 h-5 text-[#2A4436]" />,
      badge: 'Wi-Fi'
    },
    {
      id: 'guide' as const,
      title: 'House Guide & Appliances',
      description: 'Single-page property manual & instructions',
      icon: <BookOpen className="w-5 h-5 text-[#9E5A3F]" />,
      badge: 'Manual'
    },
    {
      id: 'recommendations' as const,
      title: 'Local Recommendations',
      description: 'Host-curated cafes, dining, hikes & grocery',
      icon: <MapPin className="w-5 h-5 text-[#2A4436]" />,
      badge: `${property.recommendations.length} spots`
    },
    {
      id: 'host' as const,
      title: `Contact Host (${property.host.name})`,
      description: `Direct call, SMS & urgent help (${property.host.responseTime})`,
      icon: <PhoneCall className="w-5 h-5 text-[#2A4436]" />,
      badge: 'Superhost'
    },
    {
      id: 'call' as const,
      title: 'Emergency & Urgent Help',
      description: 'On-call maintenance, concierge & 911 dispatch',
      icon: <HelpCircle className="w-5 h-5 text-rose-700" />,
      badge: '24/7'
    }
  ];

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      <ScreenHeader
        title={`${property.name} Directory`}
        subtitle="Guest Services & Property Tools"
        onBack={onBack}
      />

      <div className="p-4 sm:p-5 space-y-2.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectOption(item.id)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#1E1D1A] hover:bg-[#FAF8F5] dark:hover:bg-white/5 border border-black/[0.03] dark:border-white/10 shadow-soft-sm hover:shadow-soft-card transition-all text-left group active:scale-[0.99] cursor-pointer"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-[#F6F4F0] dark:bg-white/10 border border-black/5 dark:border-white/10 group-hover:scale-105 transition-transform mt-0.5">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1C1B18] dark:text-white group-hover:text-[#2A4436] dark:group-hover:text-[#78A88E] transition-colors">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF2EC] dark:bg-[#2A4436]/40 text-[#2A4436] dark:text-[#78A88E]">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#78756E] dark:text-neutral-400 mt-0.5 line-clamp-1">{item.description}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#78756E] dark:text-neutral-400 group-hover:text-[#2A4436] dark:group-hover:text-[#78A88E] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </button>
        ))}

        {/* Host Management Portal Link */}
        <div className="pt-3 border-t border-black/5 dark:border-white/10 text-center space-y-2">
          <a
            href="/client"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/client');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C5A55] dark:text-neutral-300 hover:text-[#2A4436] dark:hover:text-[#78A88E] py-1.5 px-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Property Host? Sign in to dwellio Portal</span>
          </a>

          <div className="text-[11px] text-[#78756E]/80 dark:text-neutral-400/80 font-medium">
            Powered by{' '}
            <button
              onClick={() => {
                if (onOpenWebsite) {
                  onOpenWebsite();
                } else {
                  window.history.pushState({}, '', '/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="font-serif font-bold text-[#1C1B18] dark:text-white hover:text-[#2A4436] dark:hover:text-[#78A88E] transition-colors cursor-pointer hover:underline"
            >
              dwellio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
