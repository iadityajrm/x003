export type IntensityLevel = 'casual' | 'interesting' | 'embarrassing' | 'spicy';

export interface QuickCard {
  id: string;
  icon: string;
  category: string;
  title: string;
  description: string;
  prompt: string;
  accentColor?: string;
}

export interface Recommendation {
  id: string;
  category: 'coffee' | 'dining' | 'outdoors' | 'essentials' | 'activity' | 'attraction';
  name: string;
  type: string;
  distance: string;
  address: string;
  description: string;
  rating: number;
  highlight: string;
  mapsUrl?: string;
  isStarred?: boolean;
  lat?: number;
  lng?: number;
}

export type GuestStayStatus = 'not_checked_in' | 'checked_in' | 'checked_out';

export interface PropertyCoordinates {
  lat: number;
  lng: number;
  address?: string;
  houseNumber?: string;
  road?: string;
  landmark?: string;
  area?: string;
  city?: string;
  state?: string;
  postcode?: string;
  tag?: string;
}

export interface PropertyData {
  slug: string;
  name: string;
  tagline: string;
  location: string;
  coordinates?: PropertyCoordinates;
  heroImage: string;
  doorImage?: string;
  assistantName: string;
  customAiInstructions?: string;
  host: {
    name: string;
    avatar: string;
    phone: string;
    phoneFormatted: string;
    emergencyPhone: string;
    email: string;
    responseTime: string;
    superhost: boolean;
    rating: number;
    reviewCount: number;
  };
  wifi: {
    network: string;
    password: string;
    qrCodeText: string;
  };
  checkIn: {
    time: string;
    lockType: string;
    accessCode: string;
    doorInstructions: string[];
    parkingInfo: string;
    evCharger: string;
    earlyCheckInPolicy: string;
    emergencyKeybox: string;
  };
  houseGuideText: string;
  recommendations: Recommendation[];
  houseRules: string[];
  emergencyContacts: {
    label: string;
    name: string;
    number: string;
    description: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'guest' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  imageUrl?: string;
  imageCaption?: string;
  audioUrl?: string;
  audioDuration?: number;
  hasAudioResponse?: boolean;
  audioResponseUrl?: string;
  actionChips?: {
    label: string;
    prompt: string;
    action?: 'open_wifi' | 'open_checkin' | 'open_guide' | 'open_host' | 'open_call' | 'open_play' | 'open_recommendations';
  }[];
  isError?: boolean;
  copiedText?: string;
}

export interface ClientAccount {
  id: string;
  name: string;
  email: string;
  passcode: string;
  assignedPropertySlugs: string[];
  createdAt: string;
}
