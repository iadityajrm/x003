import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Compass,
  Wifi,
  Building2,
  QrCode,
  Languages,
  Mic,
  UtensilsCrossed,
  Sliders,
  Check,
  Bot,
  Zap,
  Globe,
  ConciergeBell
} from 'lucide-react';
import { PROPERTIES } from '../../data/properties';
import { PropertyData } from '../../types';

interface DwellioWebsiteProps {
  onLaunchDemo: (slug?: string) => void;
  onOpenClientPortal: () => void;
  onOpenAdmin: () => void;
  isExiting?: boolean;
}

export const DwellioWebsite: React.FC<DwellioWebsiteProps> = ({
  onLaunchDemo,
  onOpenClientPortal,
  onOpenAdmin,
  isExiting = false,
}) => {
  const [selectedDemoSlug, setSelectedDemoSlug] = useState('cedar-house');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selectedPlanModal, setSelectedPlanModal] = useState<string | null>(null);

  // Enforce dark mode on landing page by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Scroll reveal observer: all elements with .reveal-from-top fade in from above on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        root: null,
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-from-top');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const propertiesList: PropertyData[] = Object.values(PROPERTIES);

  const features = [
    {
      title: 'Instant Assistance',
      description: 'Wi-Fi, climate control, and house instructions answered in seconds, 24/7.',
      icon: <Sparkles className="w-5 h-5 text-white" />,
    },
    {
      title: 'Verified Access',
      description: 'Smart lock codes and key instructions revealed only to confirmed guests.',
      icon: <ShieldCheck className="w-5 h-5 text-white" />,
    },
    {
      title: 'Curated Recommendations',
      description: 'Hand-picked cafes, scenic trails, and neighborhood dining favorites.',
      icon: <Compass className="w-5 h-5 text-white" />,
    },
    {
      title: 'Fail-Safe Offline Backup',
      description: 'Key property details remain accessible even during network interruptions.',
      icon: <Wifi className="w-5 h-5 text-white" />,
    },
  ];

  const plans = [
    {
      id: 'simple',
      name: 'Simple Assistant',
      badge: 'Starter',
      popular: false,
      tagline: 'Textual AI assistance in clean English for quick answers & essentials.',
      description: 'Ideal for independent rentals, Airbnbs, and boutique stays wanting instant guest communication.',
      icon: <Bot className="w-6 h-6 text-white" />,
      features: [
        'Instant QR Code access (no app install required)',
        'English-only text conversational AI concierge',
        'Answers Wi-Fi, property guidelines & amenities 24/7',
        'Curated nearby destinations, attractions & dining spots',
        'Digital food menu viewing & item inquiries',
        'Hybrid remote architecture: 100% remote setup in minutes',
        'Essential offline fallback support for critical info',
      ],
      ctaText: 'Get Started with Simple',
    },
    {
      id: 'advanced',
      name: 'Advanced Assistant',
      badge: 'Most Popular',
      popular: true,
      tagline: 'Multilingual AI with natural speech & interactive ordering capabilities.',
      description: 'Engineered for international guests and busy luxury villas looking for frictionless voice guidance.',
      icon: <Mic className="w-6 h-6 text-white" />,
      features: [
        'Everything in Simple Assistant, plus:',
        'Full Multilingual Support (auto-detects guest language)',
        'Two-way Voice & Speech Assistant (natural listening & speaking)',
        'Interactive digital food menu inquiries & instant order placement',
        'Dynamic local recommendations with interactive navigation',
        'Hybrid remote deployment: custom knowledge base tuned remotely',
        'Priority AI model responsiveness & voice tuning',
      ],
      ctaText: 'Choose Advanced',
    },
    {
      id: 'integrated',
      name: 'Integrated Assistant',
      badge: 'Enterprise & Resort',
      popular: false,
      tagline: 'Tailored, end-to-end bespoke experience connected with your front desk.',
      description: 'Designed for boutique hotels, serviced apartments, and resorts needing direct reception synergy.',
      icon: <ConciergeBell className="w-6 h-6 text-white" />,
      features: [
        'Everything in Advanced Assistant, plus:',
        'Deep Reception & Front Desk integration (live handover & alerts)',
        'Custom ordering workflow with kitchen/reception dispatch',
        'Tailored brand styling, custom domain & personalized greetings',
        'VIP guest routing, special request & room service ticketing',
        'Hybrid remote setup with dedicated onboarding engineer',
        '24/7 host emergency hotline routing & bespoke API integration',
      ],
      ctaText: 'Contact for Integrated',
    },
  ];

  const faqs = [
    {
      q: 'Do guests need to install an app?',
      a: 'No app download is required. Guests simply scan a QR card placed in the home, and Relay opens instantly in any mobile browser.',
    },
    {
      q: 'How does Relay keep entry codes safe?',
      a: 'Lockbox and keypad access codes remain hidden until the guest verifies their booking phone number inside the digital guide.',
    },
    {
      q: 'Can hosts customize instructions for their home?',
      a: 'Yes. Through the host portal, you can customize check-in guidelines, appliance notes, trash days, and favorite local recommendations.',
    },
    {
      q: 'What happens if the internet goes down?',
      a: 'Relay features an offline fallback engine that answers essential property questions even without an active internet connection.',
    },
  ];

  return (
    <div
      className={`min-h-screen bg-[#000000] text-[#F5F5F7] selection:bg-white/20 transition-all ${
        isExiting ? 'animate-page-fade-out' : 'animate-page-fade-in'
      }`}
    >
      
      {/* ─── FLOATING PILL NAVIGATION (APPLE SOPHISTICATION, MONOCHROME) ─── */}
      <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <header
          className="reveal-from-top pointer-events-auto w-full max-w-4xl bg-[#1C1C1E]/80 backdrop-blur-2xl rounded-full px-5 sm:px-6 py-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.6)] border border-white/10 flex items-center justify-between transition-all"
          style={{ transitionDelay: '100ms' }}
        >
          {/* Brand Logo & Company Subtitle */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            {/* Minimalist 4-dot geometric mark in Apple clean monochrome */}
            <div className="grid grid-cols-2 gap-0.5 p-1 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-white leading-none">
                relay
              </span>
              <span className="text-[9px] tracking-wider text-[#86868B] uppercase font-mono font-medium mt-0.5">
                by FramewrkLabs
              </span>
            </div>
          </a>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#86868B]">
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#solution" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#plans" className="hover:text-white transition-colors">
              Plans & Pricing
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#properties" className="hover:text-white transition-colors">
              Properties
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQs
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={onOpenClientPortal}
              className="hidden sm:inline-flex text-xs font-medium text-[#86868B] hover:text-white px-2.5 py-1.5 transition-colors cursor-pointer"
            >
              Host Portal
            </button>

            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-full bg-white hover:bg-[#E5E5EA] text-[#000000] text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Live Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>
      </div>

      {/* ─── HERO SECTION (APPLE SOPHISTICATION, ARCHITECTURE & MONOCHROME FADE) ─── */}
      <section className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-28 sm:pt-36 overflow-hidden">
        
        {/* Architectural Image with Subtle Monochrome Dark Treatment */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2400&q=85"
            alt="Modern luxury architecture"
            className="w-full h-full object-cover object-center brightness-75 contrast-105 saturate-[0.85]"
          />
          {/* Subtle dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/45 to-transparent" />
          
          {/* Smooth bottom fade into pure monochrome black background */}
          <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-[#000000] via-[#000000]/85 to-transparent" />
        </div>

        {/* Hero Content (Cascading fade in from above on load) */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6 pt-6 sm:pt-12">
          
          <div
            className="reveal-from-top inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-[#D1D1D6] font-mono tracking-wide"
            style={{ transitionDelay: '150ms' }}
          >
            <span>FramewrkLabs</span>
            <span className="text-[#86868B]">/</span>
            <span>Relay</span>
          </div>

          <h1
            className="reveal-from-top font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.12]"
            style={{ transitionDelay: '250ms' }}
          >
            Spaces worth coming home to.
          </h1>

          <p
            className="reveal-from-top text-sm sm:text-base lg:text-lg text-[#D1D1D6] max-w-2xl mx-auto leading-relaxed font-normal"
            style={{ transitionDelay: '380ms' }}
          >
            A refined digital guest guide and 24/7 intelligent concierge for vacation rentals. Thoughtfully engineered by FramewrkLabs with zero clutter.
          </p>

          {/* Hero CTAs */}
          <div
            className="reveal-from-top pt-2 flex flex-row items-center justify-center gap-3"
            style={{ transitionDelay: '500ms' }}
          >
            <button
              onClick={() => onLaunchDemo(selectedDemoSlug)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-[#E5E5EA] text-[#000000] text-xs sm:text-sm font-semibold shadow-xl active:scale-95 transition-all cursor-pointer"
            >
              <span>Explore Live Demo</span>
            </button>

            <button
              onClick={onOpenClientPortal}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-full bg-[#1C1C1E]/90 hover:bg-[#2C2C2E] text-white text-xs sm:text-sm font-semibold border border-white/15 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <span>Host Portal</span>
            </button>
          </div>

        </div>

        {/* Bottom anchor */}
        <div className="relative z-10 pb-12" />

      </section>

      {/* ─── ABOUT & PHILOSOPHY (FADES IN FROM ABOVE ON SCROLL) ─── */}
      <section id="about" className="py-24 sm:py-32 max-w-5xl mx-auto px-6">
        <div className="reveal-from-top text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] uppercase tracking-widest font-mono font-medium text-[#86868B]">
            Effortless Hospitality
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            Simple, calm, and always attentive.
          </h2>
          <p className="text-sm sm:text-base text-[#86868B] leading-relaxed pt-2">
            Guests should never spend their first evening searching for Wi-Fi passwords or deciphering appliance manuals. Relay brings clarity to every detail of the stay.
          </p>
        </div>

        {/* 4 Feature Cards (Fading in from above with staggered delays) */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="reveal-from-top p-8 sm:p-10 rounded-3xl bg-[#1C1C1E]/60 border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm space-y-4 hover:border-white/20 hover:bg-[#1C1C1E]/80 transition-all"
              style={{ transitionDelay: `${idx * 120}ms` }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                {feat.icon}
              </div>
              <h3 className="font-serif text-xl font-bold text-white">
                {feat.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS / WHAT WE OFFER (SCAN QR TO ASSISTANT) ─── */}
      <section id="solution" className="py-24 sm:py-32 bg-[#050505] border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="reveal-from-top text-center space-y-4 max-w-3xl mx-auto mb-16">
            <span className="text-[11px] uppercase tracking-widest font-mono font-medium text-[#86868B]">
              The Core Solution
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
              One QR Scan. Complete Hospitality.
            </h2>
            <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
              We sell a radically simple guest solution: guests scan a sleek QR code in their room or villa and immediately receive a personal AI assistant. No app download, no account creation, no friction.
            </p>
          </div>

          {/* Solution Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="reveal-from-top p-8 rounded-3xl bg-[#141416] border border-white/10 space-y-4 hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Instant AI Concierge</h3>
              <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
                Guests instantly enquire about Wi-Fi credentials, air conditioning, check-in instructions, parking, house guidelines, and all property services at any hour of the day or night.
              </p>
            </div>

            <div className="reveal-from-top p-8 rounded-3xl bg-[#141416] border border-white/10 space-y-4 hover:border-white/20 transition-all" style={{ transitionDelay: '150ms' }}>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Nearby Explorations</h3>
              <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
                Recommends scenic viewpoints, popular attractions, nearby destinations, hidden gems, and local cafes with directions, distance estimates, and opening hours.
              </p>
            </div>

            <div className="reveal-from-top p-8 rounded-3xl bg-[#141416] border border-white/10 space-y-4 hover:border-white/20 transition-all" style={{ transitionDelay: '300ms' }}>
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-serif text-xl font-bold text-white">Digital Food Menu & Ordering</h3>
              <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed">
                Incorporate your in-house dining or partner restaurant menu. Guests can browse photos, enquire about ingredients and dietary options, and place food orders with confidence.
              </p>
            </div>
          </div>

          {/* Hybrid Architecture Remote Setup Banner */}
          <div className="reveal-from-top mt-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1C1C1E] to-[#121214] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-white">
                <Zap className="w-3.5 h-3.5 text-white" />
                Hybrid Architecture
              </div>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-white">
                100% Remote, Effortless Setup
              </h4>
              <p className="text-xs sm:text-sm text-[#86868B] max-w-2xl leading-relaxed">
                All tiers are engineered with a hybrid approach so your property’s digital concierge can be configured, tested, and published completely remotely without any on-site hardware or technicians.
              </p>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('plans');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="shrink-0 px-6 py-3 rounded-full bg-white hover:bg-[#E5E5EA] text-[#000000] text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              View Tiers & Plans
            </button>
          </div>
        </div>
      </section>

      {/* ─── THREE PLANS & TIERS SECTION ─── */}
      <section id="plans" className="py-24 sm:py-32 max-w-6xl mx-auto px-6">
        <div className="reveal-from-top text-center space-y-4 max-w-3xl mx-auto mb-16">
          <span className="text-[11px] uppercase tracking-widest font-mono font-medium text-[#86868B]">
            Flexible Plans
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            Tailored Tiers for Every Host & Hotel
          </h2>
          <p className="text-sm sm:text-base text-[#86868B] leading-relaxed">
            Choose the level of intelligence your guests experience. Each tier is fully remote-deployable and adapts seamlessly to your property.
          </p>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={plan.id}
              className={`reveal-from-top relative rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-[#18181B] border-2 border-white/40 shadow-[0_20px_50px_rgba(255,255,255,0.06)] scale-[1.02] z-10'
                  : 'bg-[#141416]/90 border border-white/10 hover:border-white/20'
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Badge */}
              <div className="flex items-center justify-between mb-6">
                <span className={`text-[10px] uppercase font-mono font-bold tracking-wider px-3 py-1 rounded-full border ${
                  plan.popular
                    ? 'bg-white text-black border-white'
                    : 'bg-white/10 text-white/80 border-white/15'
                }`}>
                  {plan.badge}
                </span>
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10">
                  {plan.icon}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-bold text-white">
                  {plan.name}
                </h3>
                <p className="text-xs font-medium text-white/90">
                  {plan.tagline}
                </p>
                <p className="text-xs text-[#86868B] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-white/10" />

              {/* Features List */}
              <div className="space-y-3 mb-8 flex-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#86868B]">
                  Included Capabilities:
                </span>
                <ul className="space-y-2.5 text-xs text-[#D1D1D6]">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 leading-relaxed">
                      <div className="mt-0.5 rounded-full p-0.5 bg-white/10 text-white shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className={fIdx === 0 && plan.popular ? 'text-white font-medium' : ''}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedPlanModal(plan.name)}
                className={`w-full py-3 px-5 rounded-full text-xs font-semibold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-white hover:bg-[#E5E5EA] text-[#000000] shadow-xl'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                <span>{plan.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Remote Setup Guarantee footnote */}
        <div className="reveal-from-top mt-12 text-center text-xs text-[#86868B] max-w-xl mx-auto flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white shrink-0" />
          <span>All tiers include hybrid remote deployment, instant QR printable assets, and automated menu syncing.</span>
        </div>
      </section>

      {/* ─── FEATURED RESIDENCES SHOWCASE (INTERACTIVE DEMO) ─── */}
      <section id="properties" className="py-24 bg-[#0A0A0A] border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="reveal-from-top flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-widest font-mono font-medium text-[#86868B]">
                Curated Properties
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
                Experience Relay in action.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#86868B] max-w-sm">
              Select any residence below to launch its live digital guest assistant.
            </p>
          </div>

          {/* Properties Grid (Fading in from above with staggered delays) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {propertiesList.map((prop, idx) => (
              <div
                key={prop.slug}
                onClick={() => onLaunchDemo(prop.slug)}
                className="reveal-from-top group rounded-3xl overflow-hidden bg-[#1C1C1E] border border-white/10 shadow-sm hover:shadow-2xl hover:border-white/25 transition-all cursor-pointer flex flex-col justify-between"
                style={{ transitionDelay: `${idx * 140}ms` }}
              >
                <div>
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#2C2C2E] relative">
                    <img
                      src={prop.heroImage}
                      alt={prop.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide text-white border border-white/10">
                      {prop.location}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-white/80 transition-colors">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-[#86868B] line-clamp-2 leading-relaxed">
                      {prop.tagline}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 flex items-center justify-between text-xs font-semibold text-white">
                  <span>Launch Guest View</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── CLEAN FAQ ACCORDION (SMOOTH CSS GRID ANIMATION) ─── */}
      <section id="faq" className="py-24 sm:py-32 max-w-3xl mx-auto px-6">
        <div className="reveal-from-top text-center space-y-3 mb-14">
          <span className="text-[11px] uppercase tracking-widest font-mono font-medium text-[#86868B]">
            Questions & Details
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Frequently Asked
          </h2>
        </div>

        <div className="divide-y divide-white/10">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="reveal-from-top py-6"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left group cursor-pointer select-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg font-bold text-white group-hover:text-white/80 transition-colors pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#86868B] shrink-0 transition-transform duration-300 ease-out ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                
                {/* Smooth Height Expansion & Fade using CSS Grid */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-xs sm:text-sm text-[#86868B] leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── MINIMALIST FOOTER (WITH FRAMEWRKLABS REPUTATION) ─── */}
      <footer className="reveal-from-top py-14 bg-[#0A0A0A] border-t border-white/10 text-xs text-[#86868B]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-white">
                relay
              </span>
              <span className="text-[11px] text-[#86868B]">
                · The intelligent guest concierge
              </span>
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="text-[11px] text-[#86868B]">
              A software product by <strong className="text-white font-medium">FramewrkLabs</strong>
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium text-[11px] text-[#86868B]">
            <button
              onClick={() => onLaunchDemo('cedar-house')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Demo
            </button>
            <button
              onClick={onOpenClientPortal}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Host Portal
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Admin
            </button>
          </div>

          <p className="text-[11px] text-[#86868B]">
            © {new Date().getFullYear()} FramewrkLabs. All rights reserved.
          </p>

        </div>
      </footer>

      {/* ─── PLAN MODAL (WHEN A USER CLICKS TO SELECT OR INQUIRE ABOUT A PLAN) ─── */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#1C1C1E] border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#86868B]">
                Setup Plan Selected
              </span>
              <button
                onClick={() => setSelectedPlanModal(null)}
                className="text-white/60 hover:text-white p-1 rounded-full text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-white mb-2">
              {selectedPlanModal}
            </h3>
            <p className="text-xs text-[#86868B] mb-6 leading-relaxed">
              Every tier comes with our hybrid remote setup guarantee. Scan the QR code, preview guest experience, and configure your property details in minutes.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedPlanModal(null);
                  onLaunchDemo(selectedDemoSlug);
                }}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#E5E5EA] text-black font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setSelectedPlanModal(null);
                  onOpenClientPortal();
                }}
                className="w-full py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Host Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
