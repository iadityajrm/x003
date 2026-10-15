import { PropertyData } from '../types';

export const PROPERTIES: Record<string, PropertyData> = {
  'cedar-house': {
    slug: 'cedar-house',
    name: 'Cedar House',
    tagline: 'Modern Alpine Chalet & Forest Spa',
    location: 'Lake Tahoe, CA (West Shore)',
    coordinates: {
      lat: 39.1677,
      lng: -120.1452,
      address: '745 West Lake Blvd, Tahoe City, CA 96145',
    },
    heroImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    doorImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    assistantName: 'Cedar House Assistant',
    customAiInstructions: 'Always emphasize Tahoe bear safety: remind guests never to leave food, coolers, or trash outside on the deck or in cars. Highlight that the cedar hot tub is preheated to 102°F. Maintain a warm, welcoming alpine host tone.',
    host: {
      name: 'Sarah Jenkins',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      phone: '+15305550192',
      phoneFormatted: '(530) 555-0192',
      emergencyPhone: '(530) 555-0911',
      email: 'sarah@cedarhouse-tahoe.com',
      responseTime: 'under 5 mins',
      superhost: true,
      rating: 4.98,
      reviewCount: 142,
    },
    wifi: {
      network: 'Cedar_Guest',
      password: 'tahoepinecones!',
      qrCodeText: 'WIFI:T:WPA;S:Cedar_Guest;P:tahoepinecones!;;',
    },
    checkIn: {
      time: '4:00 PM',
      lockType: 'August Smart Keypad',
      accessCode: '*4829#',
      doorInstructions: [
        'Touch the August logo button on the keypad to light up the numbers.',
        'Enter your 4-digit code *4829# followed by the Checkmark button.',
        'Wait 2 seconds for the green glow and motorized click before pulling the door handle.',
        'To lock when leaving: Simply press the red August lock icon once.'
      ],
      parkingInfo: 'Driveway accommodates up to 3 standard vehicles. Please park on the paved asphalt only. Level 2 Tesla EV charger available on the garage wall.',
      evCharger: 'Tesla Wall Connector 48A (NACS + J1772 adapter provided in garage cabinet). Free for guests.',
      earlyCheckInPolicy: 'Early check-in from 1:00 PM is complimentary upon request if housekeeping finishes early.',
      emergencyKeybox: 'Physical lockbox located behind the woodpile on the side porch. Code: 7721.'
    },
    houseGuideText: `### Welcome to Cedar House 🌲
We are delighted to have you stay at our Lake Tahoe forest sanctuary. Below is your complete, all-in-one house manual covering our amenities, climate controls, and house guidelines.

---

#### 1. Cedar Hot Tub & Forest Spa
* **Location:** Private back deck overlooking the pine forest.
* **Operation:** Lift the insulated cover using the hydraulic assist arm. Press **JETS 1** on the Balboa side panel to begin hydrotherapy (20-minute cycle). Press **LIGHT** to cycle between warm amber, forest green, and evening blue ambiance.
* **Temperature:** Automatically preset to a soothing **102°F (39°C)**.
* **Important Guidelines:** Please rinse off lotions before entering. Acrylic drinkware is provided in the kitchen bar cabinet — please **no glass** near the hot tub. Always latch both wind clips when done to retain heat and safeguard local wildlife.

---

#### 2. Climate & Heating (Nest Dual-Zone)
* **Living Area & Loft:** Controlled via the main hallway Nest thermostat. Turn outer ring clockwise to increase heat (recommended: 68°F – 70°F).
* **Ground Floor Bedrooms:** Controlled via the bedroom corridor sub-thermostat.
* **Fireplace:** Turn the brass timer dial on the stone mantel wall clockwise (30 min / 60 min / 120 min). The pilot light will ignite instantly. Keep children and pets at a safe distance from the hot glass front.

---

#### 3. Kitchen & Coffee Bar
* **Nespresso Vertuo Machine:** Fill reservoir with filtered tap water. Lift chrome lever, insert any provided Vertuo pod (dome facing down), and press top button once.
* **Drip Coffee & French Press:** Whole bean local roast and burr grinder are stocked in the pantry.
* **Dishwasher:** Bosch 800 Series. Detergent pods are stored under the sink. Select "Auto" and press Start, then close door.

---

#### 4. Whole-Home Audio & Entertainment
* **Sonos Sound System:** Connect your device to "Cedar_Guest" Wi-Fi. Stream seamlessly via Apple AirPlay or Spotify Connect to "Cedar House Living" or "Deck Spa".
* **Living Room TV:** 75" LG OLED 4K TV. Powered by Apple TV 4K in Guest Mode with Netflix, HBO Max, Disney+, and Prime Video pre-installed.

---

#### 5. Tahoe Bear Safety & Trash Disposal
* Lake Tahoe is active black bear country. **Never leave trash, groceries, or food coolers outside on the deck or inside vehicles.**
* All household trash must be placed inside the steel bear-proof bin located at the foot of the driveway. Reach into the recessed top latch to unlock.

---

#### 6. House Guidelines & Quiet Hours
* **Quiet Hours:** 10:00 PM to 8:00 AM (strictly enforced by Placer County ordinance).
* **Smoking Policy:** 100% smoke-free and vape-free indoors and on all exterior decks.
* **Pet Policy:** Non-shedding hypoallergenic dogs allowed with prior host confirmation.`,
    recommendations: [
      {
        id: 'rec-1',
        category: 'coffee',
        name: 'Fire Sign Café',
        type: 'Hearty Breakfast & Alpine Bakery',
        distance: '4 mins drive (1.8 miles)',
        address: '1785 W Lake Blvd, Tahoe City, CA',
        description: 'Legendary cozy wood cabin cafe serving homemade cinnamon rolls, benedicts, and locally roasted coffee since 1978.',
        rating: 4.8,
        highlight: 'Try the smoked salmon scrambler with scratch buttermilk biscuits.',
        mapsUrl: 'https://maps.google.com/?q=Fire+Sign+Cafe+Tahoe+City'
      },
      {
        id: 'rec-2',
        category: 'dining',
        name: 'Sunnyside Restaurant & Lodge',
        type: 'Lakeside Fine Dining & Deck',
        distance: '6 mins drive (2.4 miles)',
        address: '1850 W Lake Blvd, Tahoe City, CA',
        description: 'Iconic waterfront dining with panoramic Lake Tahoe views, famous Fried Zucchini, fresh king salmon, and Duke\'s Mai Tais.',
        rating: 4.7,
        highlight: 'Sunset drinks on the lakeside wooden dock deck.',
        mapsUrl: 'https://maps.google.com/?q=Sunnyside+Restaurant+Tahoe+City'
      },
      {
        id: 'rec-3',
        category: 'outdoors',
        name: 'Eagle Rock Panoramic Trail',
        type: 'Scenic 1-Mile Vista Hike',
        distance: '3 mins drive / 15 mins walk',
        address: 'Hwy 89 Trailhead, Homewood, CA',
        description: 'Short 20-minute uphill hike on volcanic rock offering 360-degree breathtaking views over the entire Lake Tahoe basin.',
        rating: 4.9,
        highlight: 'Best morning sunrise and photography spot on the West Shore.',
        mapsUrl: 'https://maps.google.com/?q=Eagle+Rock+Trailhead+Lake+Tahoe'
      },
      {
        id: 'rec-4',
        category: 'essentials',
        name: 'Safeway & Pharmacy (Tahoe City)',
        type: '24/7 Supermarket & Pharmacy',
        distance: '7 mins drive (3.2 miles)',
        address: '850 N Lake Blvd, Tahoe City, CA',
        description: 'Full grocery store with deli counter, firewood bundles, winter tire chains, and pharmacy.',
        rating: 4.5,
        highlight: 'Open 24 hours daily with ample parking.',
        mapsUrl: 'https://maps.google.com/?q=Safeway+Tahoe+City'
      }
    ],
    houseRules: [
      'Quiet hours are strictly enforced between 10:00 PM and 8:00 AM by local Placer County ordinance.',
      'Strictly non-smoking & no vaping anywhere on the property (including outdoor decks and yard).',
      'No unregistered overnight guests or unauthorized parties.',
      'Hot tub hours: 7:00 AM - 10:00 PM to respect neighboring cabins.'
    ],
    emergencyContacts: [
      {
        label: 'Property Host',
        name: 'Sarah Jenkins (Direct Mobile)',
        number: '(530) 555-0192',
        description: 'Direct call or SMS for any stay questions or urgent property needs.'
      },
      {
        label: 'Tahoe Local Property Manager',
        name: 'Alpine Care Concierge 24/7',
        number: '(530) 555-4890',
        description: 'On-call maintenance, snowplow dispatch & lockouts.'
      },
      {
        label: 'Emergency Services',
        name: 'Police / Fire / Paramedics',
        number: '911',
        description: 'Placer County Sheriff & North Tahoe Fire District.'
      }
    ]
  },

  'pine-crest-villa': {
    slug: 'pine-crest-villa',
    name: 'Pine Crest Villa',
    tagline: 'Luxury Mountain Ridge Sanctuary',
    location: 'Blue Ridge Mountains, GA',
    coordinates: {
      lat: 34.8640,
      lng: -84.3241,
      address: '280 Ridge Crest Trail, Blue Ridge, GA 30513',
    },
    heroImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    doorImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    assistantName: 'Pine Crest Assistant',
    customAiInstructions: 'Highlight the vintage arcade cabinet in the upper loft and recommend sunset mountain views from the jacuzzi deck. Remind guests that quiet hours start at 10 PM and outdoor open fires are prohibited.',
    host: {
      name: 'David Miller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      phone: '+17065550843',
      phoneFormatted: '(706) 555-0843',
      emergencyPhone: '(706) 555-0911',
      email: 'david@pinecrest-blueridge.com',
      responseTime: 'under 10 mins',
      superhost: true,
      rating: 4.96,
      reviewCount: 98,
    },
    wifi: {
      network: 'PineCrest_5GHz',
      password: 'mountainmist77',
      qrCodeText: 'WIFI:T:WPA;S:PineCrest_5GHz;P:mountainmist77;;',
    },
    checkIn: {
      time: '3:00 PM',
      lockType: 'Schlage Encode Smart Lock',
      accessCode: '*9143#',
      doorInstructions: [
        'Touch the Schlage symbol at the top to wake the touchscreen.',
        'Type your entry code *9143# and press the lock icon.',
        'The bolt will retract with an audible double beep.'
      ],
      parkingInfo: 'Circular gravel driveway fits up to 4 SUVs.',
      evCharger: 'Standard 240V NEMA 14-50 outlet available on the exterior carport pillar.',
      earlyCheckInPolicy: 'Complimentary early check-in from 1:00 PM if property is vacant the night prior.',
      emergencyKeybox: 'Mounted underneath the generator shelter behind the cabin. Code: 5122.'
    },
    houseGuideText: `### Welcome to Pine Crest Villa ⛰️
Experience the peaceful beauty of the Blue Ridge Mountains. Here is your quick reference guide for enjoying our villa amenities.

---

#### 1. Sunset Ridge Jacuzzi
* Deck-mounted 6-person hot tub with direct western sunset ridge views.
* Temperature is set to **101°F**. Press **PUMP 1** on the Balboa panel for bubble jets.
* Please reattach child-safety clips when leaving the tub.

#### 2. Wood-Burning Hearth
* Seasoned mountain oak firewood is stacked beside the carport.
* Open the flue damper lever fully before lighting kindle.
* Use the wire mesh fire screen at all times.

#### 3. Arcade & Game Loft
* Upper loft features vintage arcade cabinet (over 60 classic games) and board games.
* Smart TV includes Roku streaming channels.

#### 4. Mountain Rules
* Quiet hours begin at 10:00 PM.
* No open bonfires or fireworks on the ridge due to forest fire regulations.`,
    recommendations: [
      {
        id: 'rec-1',
        category: 'dining',
        name: 'Harvest on Main',
        type: 'Farm-to-Table Mountain Dining',
        distance: '8 mins drive',
        address: '576 E Main St, Blue Ridge, GA',
        description: 'Locally sourced North Georgia trout, artisan cheeses, and Southern hospitality in a stunning log lodge.',
        rating: 4.8,
        highlight: 'Pecan crusted rainbow trout with sweet potato mash.',
        mapsUrl: 'https://maps.google.com/?q=Harvest+on+Main+Blue+Ridge'
      },
      {
        id: 'rec-2',
        category: 'outdoors',
        name: 'Blue Ridge Scenic Railway',
        type: 'Historic River Train Ride',
        distance: '10 mins drive',
        address: '241 Depot St, Blue Ridge, GA',
        description: 'Vintage train excursion following the winding Toccoa River through the Appalachian countryside.',
        rating: 4.7,
        highlight: 'Open-air passenger car during fall foliage.',
        mapsUrl: 'https://maps.google.com/?q=Blue+Ridge+Scenic+Railway'
      }
    ],
    houseRules: [
      'Quiet hours start at 10:00 PM.',
      'No fireworks or open bonfires on ridge.',
      'Strictly non-smoking.'
    ],
    emergencyContacts: [
      {
        label: 'Property Host',
        name: 'David Miller (Direct)',
        number: '(706) 555-0843',
        description: 'Direct mobile for any stay assistance.'
      },
      {
        label: 'Emergency',
        name: 'Emergency Services',
        number: '911',
        description: 'Local emergency dispatcher.'
      }
    ]
  },

  'seaside-haven': {
    slug: 'seaside-haven',
    name: 'Seaside Haven',
    tagline: 'Private Oceanfront Modern Villa',
    location: 'Malibu, CA (Broad Beach)',
    coordinates: {
      lat: 34.0259,
      lng: -118.7798,
      address: '30745 Pacific Coast Hwy, Malibu, CA 90265',
    },
    heroImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    doorImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    assistantName: 'Haven Assistant',
    customAiInstructions: 'Remind guests to rinse off ocean sand at the heated outdoor shower before entering. Emphasize that the private beach gate code is 3341 and glass is strictly prohibited on the beach.',
    host: {
      name: 'Elena Vance',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80',
      phone: '+13105550328',
      phoneFormatted: '(310) 555-0328',
      emergencyPhone: '(310) 555-0911',
      email: 'elena@seasidehaven-malibu.com',
      responseTime: 'under 3 mins',
      superhost: true,
      rating: 4.99,
      reviewCount: 180,
    },
    wifi: {
      network: 'SeasideHaven_Guest',
      password: 'pacificbreeze90265',
      qrCodeText: 'WIFI:T:WPA;S:SeasideHaven_Guest;P:pacificbreeze90265;;',
    },
    checkIn: {
      time: '4:00 PM',
      lockType: 'Yale Assure Smart Deadbolt',
      accessCode: '*6201#',
      doorInstructions: [
        'Touch Yale logo with palm to activate illuminated keypad.',
        'Enter 4-digit code *6201# followed by the Check key.',
        'Handle unlocks smoothly.'
      ],
      parkingInfo: 'Gated motor court with parking for 2 cars.',
      evCharger: 'Dual 50A Level 2 Universal EV chargers in the carport.',
      earlyCheckInPolicy: 'Early bag drop from 12:00 PM available upon advance request.',
      emergencyKeybox: 'Mounted inside the gated trash alcove on the right. Code: 8812.'
    },
    houseGuideText: `### Welcome to Seaside Haven 🌊
Your oceanfront sanctuary along Malibu’s Broad Beach.

---

#### 1. Private Beach Access & Outdoor Shower
* **Beach Gate:** Enter keypad code **3341** to unlock the private stairs down to the sand.
* **Warm Rinse Station:** Located on the lower deck. Please rinse off ocean sand before entering the villa.
* **Beach Gear:** Boogie boards, beach umbrellas, and plush towels are located in the deck storage bench.

#### 2. Motorized Oceanfront Glass Sliders
* Use the wall switches in the living room to open the 12-foot floor-to-ceiling glass sliders.
* In case of heavy coastal fog or high winds, sliders will automatically slow to protect seals.

#### 3. Gourmet Kitchen & Espresso
* Miele induction range and built-in espresso system.
* Sparkling and filtered alkaline water dispenser at the kitchen prep island.

#### 4. Malibu Coastal Guidelines
* No glass on the public or private beach.
* Quiet hours from 10:00 PM to 8:00 AM.`,
    recommendations: [
      {
        id: 'rec-1',
        category: 'dining',
        name: 'Malibu Farm Restaurant',
        type: 'Oceanfront Organic Pier Cafe',
        distance: '10 mins drive',
        address: '23000 Pacific Coast Hwy, Malibu, CA',
        description: 'Fresh organic farm-to-table coastal cuisine located right at the end of the Malibu Pier over the waves.',
        rating: 4.8,
        highlight: 'Avocado flatbread and coconut blackberry refresher.',
        mapsUrl: 'https://maps.google.com/?q=Malibu+Farm+Restaurant'
      },
      {
        id: 'rec-2',
        category: 'coffee',
        name: 'Broad Street Coffee & Bakery',
        type: 'Artisan Espresso & Pastries',
        distance: '3 mins drive',
        address: '30745 Pacific Coast Hwy, Malibu, CA',
        description: 'Chic beachside cafe serving single-origin cold brews, matcha lattes, and almond croissants.',
        rating: 4.9,
        highlight: 'Iced sea salt caramel latte.',
        mapsUrl: 'https://maps.google.com/?q=Broad+Street+Coffee+Malibu'
      }
    ],
    houseRules: [
      'No sand in indoor showers — please use heated exterior rinse station.',
      'Quiet hours 10:00 PM - 8:00 AM.'
    ],
    emergencyContacts: [
      {
        label: 'Property Host',
        name: 'Elena Vance (Direct)',
        number: '(310) 555-0328',
        description: 'Available 24/7 for guest assistance.'
      },
      {
        label: 'Emergency',
        name: 'Emergency Services',
        number: '911',
        description: 'Emergency response.'
      }
    ]
  }
};

export const DEFAULT_SLUG = 'cedar-house';

const STORAGE_KEY = 'rental_custom_properties_v1';

// Load any custom / modified properties from localStorage into memory on startup
function loadCustomPropertiesIntoMemory() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        Object.assign(PROPERTIES, parsed);
      }
    }
  } catch (err) {
    console.warn('Failed to load custom properties from localStorage:', err);
  }
}

// Initial sync on module load
loadCustomPropertiesIntoMemory();

export function getAllProperties(): Record<string, PropertyData> {
  loadCustomPropertiesIntoMemory();
  return PROPERTIES;
}

export function getPropertyBySlug(rawSlug?: string): PropertyData {
  loadCustomPropertiesIntoMemory();
  if (!rawSlug) return PROPERTIES[DEFAULT_SLUG];
  const cleaned = rawSlug
    .toLowerCase()
    .replace(/^\/(stay|client|host)\//, '')
    .replace(/^\//, '')
    .replace(/\/$/, '')
    .trim();
  
  if (!cleaned || cleaned === 'client' || cleaned === 'stay' || cleaned === 'host') {
    return PROPERTIES[DEFAULT_SLUG];
  }
  return PROPERTIES[cleaned] || PROPERTIES[DEFAULT_SLUG];
}

export function getAllPropertiesList(): { slug: string; name: string; location: string }[] {
  loadCustomPropertiesIntoMemory();
  return Object.values(PROPERTIES).map(p => ({
    slug: p.slug,
    name: p.name,
    location: p.location,
  }));
}

export function saveProperty(property: PropertyData): void {
  PROPERTIES[property.slug] = property;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : {};
      existing[property.slug] = property;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new CustomEvent('properties-updated', { detail: { slug: property.slug } }));
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error('Failed to save property to localStorage:', err);
    }
  }
}

export function deleteProperty(slug: string): boolean {
  if (slug === DEFAULT_SLUG) {
    return false; // protect default sample property
  }
  delete PROPERTIES[slug];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const existing = JSON.parse(raw);
        delete existing[slug];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      }
      window.dispatchEvent(new CustomEvent('properties-updated', { detail: { slug } }));
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (err) {
      console.error('Failed to delete property from localStorage:', err);
    }
  }
  return false;
}
