import { GoogleGenAI } from '@google/genai';

export interface NetlifyContext {
  ip?: string;
  [key: string]: any;
}

interface RequestBody {
  messageText?: string;
  property?: {
    slug?: string;
    name?: string;
    tagline?: string;
    location?: string;
    assistantName?: string;
    host?: {
      name?: string;
      phoneFormatted?: string;
      emergencyPhone?: string;
      superhost?: boolean;
      responseTime?: string;
      email?: string;
    };
    wifi?: {
      network?: string;
      password?: string;
    };
    checkIn?: {
      time?: string;
      lockType?: string;
      accessCode?: string;
      doorInstructions?: string[];
      parkingInfo?: string;
      evCharger?: string;
      emergencyKeybox?: string;
      earlyCheckInPolicy?: string;
    };
    houseGuideText?: string;
    customAiInstructions?: string;
    houseRules?: string[];
    recommendations?: Array<{
      name?: string;
      type?: string;
      distance?: string;
      description?: string;
      highlight?: string;
      rating?: number;
    }>;
    emergencyContacts?: Array<{
      label?: string;
      name?: string;
      number?: string;
      description?: string;
    }>;
  };
  image?: {
    url?: string;
    caption?: string;
  };
  isAudioMessage?: boolean;
}

// In-memory rate limiting map for basic abuse protection (IP based)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  record.count += 1;
  return false;
}

// Clean up expired rate limit entries inline (serverless-safe, no setInterval)
function cleanupRateLimitMap(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}

function parseDataUrlToPart(dataUrl: string): { inlineData: { mimeType: string; data: string } } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    // Validate image mime type
    const mimeType = match[1];
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
      return {
        inlineData: {
          mimeType,
          data: match[2],
        },
      };
    }
  }
  return null;
}

function buildSystemInstruction(property: NonNullable<RequestBody['property']>): string {
  const recsSummary = (property.recommendations || [])
    .map(
      (r) =>
        `- ${r.name || 'Spot'} (${r.type || 'Local'}, ${r.distance || 'Nearby'}): ${r.description || ''} (Highlight: ${r.highlight || ''}, Rating: ${r.rating || 4.8})`
    )
    .join('\n');

  const contactsSummary = (property.emergencyContacts || [])
    .map((c) => `- ${c.label || 'Contact'} (${c.name || ''}): ${c.number || ''} - ${c.description || ''}`)
    .join('\n');

  return `You are "${property.assistantName || 'AI Concierge'}", the warm, hospitable, and knowledgeable AI guest concierge for "${property.name || 'this property'}" located in "${property.location || 'our area'}".

PROPERTY DETAILS:
- Tagline: ${property.tagline || ''}
- Host: ${property.host?.name || 'Your Host'} (${property.host?.phoneFormatted || ''}, Superhost: ${Boolean(property.host?.superhost)}, Avg response: ${property.host?.responseTime || 'fast'})
- Emergency Phone: ${property.host?.emergencyPhone || ''}
- Wi-Fi: Network "${property.wifi?.network || ''}", Password "${property.wifi?.password || ''}"
- Check-in: Standard check-in time is ${property.checkIn?.time || '4:00 PM'}. Lock system is "${property.checkIn?.lockType || 'Keypad'}". Door keypad code is "${property.checkIn?.accessCode || ''}".
- Door instructions: ${(property.checkIn?.doorInstructions || []).join(' | ')}
- Parking: ${property.checkIn?.parkingInfo || ''}
- EV Charger: ${property.checkIn?.evCharger || ''}
- Emergency Lockbox: ${property.checkIn?.emergencyKeybox || ''}
- Early Check-in Policy: ${property.checkIn?.earlyCheckInPolicy || ''}

HOUSE RULES & GUIDE:
- Rules: ${(property.houseRules || []).join('; ')}
- House manual:
${property.houseGuideText || ''}

HOST'S SPECIFIC INSTRUCTIONS FOR DWELLIO AI CONCIERGE:
${property.customAiInstructions?.trim() ? `"""\n${property.customAiInstructions.trim()}\n"""\nCRITICAL DIRECTIVE: You MUST strictly prioritize and adhere to the host's specific instructions above when answering guests!` : 'None provided by host. Follow standard hospitable guidelines.'}

RECOMMENDATIONS:
${recsSummary}

EMERGENCY CONTACTS:
${contactsSummary}

AVAILABLE IN-APP SCREEN SHORTCUTS (use these in actionChips when relevant):
- "open_wifi": Opens the full Wi-Fi details screen with QR code
- "open_checkin": Opens the step-by-step entry guide and parking details
- "open_guide": Opens the complete house guide manual
- "open_host": Opens host contact details
- "open_call": Opens emergency dialer
- "open_play": Opens the cabin games lobby (Truth or Dare & Never Have I Ever)
- "open_recommendations": Opens local dining, coffee & outdoor recommendations

INSTRUCTIONS FOR YOUR RESPONSE:
1. Speak in a hospitable, helpful, and concise tone appropriate for a luxury short-term rental concierge.
2. Format your response with clean markdown (bold key phrases, bullet points when listing steps, backticks for codes or wifi passwords).
3. Always return your answer as a JSON object with:
   {
     "reply": "string (your markdown formatted answer to the guest)",
     "actionChips": [
       { "label": "Short button label with emoji (e.g. 📶 Wi-Fi Details)", "prompt": "Follow-up question or action", "action": "open_screen_action_if_applicable" }
     ],
     "copiedText": "string (optional: code or password if guest asked for key code or wifi password, else omit or empty)"
   }
4. Provide 1 to 3 relevant actionChips to help the guest navigate smoothly.
5. If the guest mentions games, bored, activities, or Truth or Dare / Never Have I Ever, recommend the games and include the "open_play" action.
6. Keep replies concise, accurate, and specific to ${property.name || 'this property'}.
`;
}

function getSmartServerBackup(
  messageText: string = '',
  property: NonNullable<RequestBody['property']>
): {
  reply: string;
  copiedText?: string;
  actionChips: Array<{ label: string; prompt: string; action?: string }>;
} {
  const q = (messageText || '').trim().toLowerCase();

  // 1. Physical Key & Emergency Lockbox ("where are the keys", "lockbox", "physical key", "backup key")
  const isKeyboxQuery = 
    q.includes('where are the key') ||
    q.includes('where is the key') ||
    q.includes('where are key') ||
    q.includes('where is key') ||
    q.includes('where keys') ||
    q.includes('where the key') ||
    q.includes('keybox') ||
    q.includes('lockbox') ||
    q.includes('physical key') ||
    q.includes('backup key') ||
    q.includes('spare key') ||
    q.includes('lost key') ||
    q.includes('box code') ||
    q.includes('emergency key');

  if (isKeyboxQuery) {
    const keybox = property.checkIn?.emergencyKeybox?.trim();
    if (keybox) {
      return {
        reply: `### 🔑 Physical Key & Emergency Lockbox\n\n${keybox}\n\n• **Main Door Lock**: ${property.checkIn?.lockType || 'Keypad Smart Lock'}\n• **Keypad Code**: \`${property.checkIn?.accessCode || ''}\``,
        copiedText: property.checkIn?.accessCode,
        actionChips: [
          { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call ${property.host?.name || 'Host'}`, prompt: `Call ${property.host?.name || 'Host'}`, action: 'open_call' },
        ],
      };
    } else {
      return {
        reply: `### 🔑 Physical Key Info\n\nThis property uses **${property.checkIn?.lockType || 'Keypad Digital Lock'}**, so physical keys are usually not required for entry.\n\n• **Door Code**: \`${property.checkIn?.accessCode}\`\n\nIf you need emergency physical key assistance, please call your host **${property.host?.name || 'your host'}** directly.`,
        copiedText: property.checkIn?.accessCode,
        actionChips: [
          { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: '📞 Call Host', prompt: `Call ${property.host?.name || 'Host'}`, action: 'open_call' },
        ],
      };
    }
  }

  // 2. Door Keypad / Access Code / How to unlock
  const isDoorCodeQuery = 
    q.includes('key code') ||
    q.includes('door code') ||
    q.includes('doorcode') ||
    q.includes('keycode') ||
    q.includes('access code') ||
    q.includes('code for the door') ||
    q.includes('code for door') ||
    q.includes('passcode') ||
    q.includes('pin code') ||
    q.includes('entry code') ||
    q.includes('how to get in') ||
    q.includes('how do i get in') ||
    q.includes('how to enter') ||
    q.includes('how to unlock') ||
    q.includes('unlock the door') ||
    q.includes('unlock door') ||
    q.includes('open the door') ||
    q.includes('open door') ||
    q.includes('door instruction') ||
    q.includes('front door') ||
    (q.includes('code') && (q.includes('door') || q.includes('lock') || q.includes('entry')));

  if (isDoorCodeQuery) {
    const instructions = (property.checkIn?.doorInstructions || [])
      .map((ins, i) => `${i + 1}. ${ins}`)
      .join('\n');

    return {
      reply: `### 🔑 Door Entry & Keypad Code for ${property.name}\n\n• **Access Code**: \`${property.checkIn?.accessCode}\`\n• **Lock System**: ${property.checkIn?.lockType}\n• **Check-in Time**: ${property.checkIn?.time}\n\n${instructions ? `**Instructions**:\n${instructions}` : 'Enter the code on the door keypad and turn the latch.'}`,
      copiedText: property.checkIn?.accessCode,
      actionChips: [
        { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
        { label: `📞 Call ${property.host?.name || 'Host'}`, prompt: `Call ${property.host?.name || 'Host'}`, action: 'open_call' },
      ],
    };
  }

  // 3. Wi-Fi & Internet
  const isWifiQuery = 
    q.includes('wifi') ||
    q.includes('wi-fi') ||
    q.includes('internet') ||
    q.includes('password') ||
    q.includes('network') ||
    q.includes('ssid') ||
    q.includes('wlan') ||
    (q.includes('connect') && (q.includes('net') || q.includes('web') || q.includes('phone')));

  if (isWifiQuery) {
    return {
      reply: `### 📶 Wi-Fi Network & Password\n\n• **Network**: \`${property.wifi?.network || ''}\`\n• **Password**: \`${property.wifi?.password || ''}\`\n\n*Tap the password to copy, or view QR code in the Wi-Fi screen.*`,
      copiedText: property.wifi?.password,
      actionChips: [
        { label: '📋 Copy Password', prompt: 'Copy wifi password' },
        { label: '📶 Wi-Fi Details', prompt: 'Show Wi-Fi QR', action: 'open_wifi' },
      ],
    };
  }

  // 4. Parking & EV Charger
  const isParkingQuery =
    q.includes('parking') ||
    q.includes('where to park') ||
    q.includes('park') ||
    q.includes('garage') ||
    q.includes('driveway') ||
    q.includes('car') ||
    q.includes('vehicle') ||
    q.includes('ev ') ||
    q.includes('charger') ||
    q.includes('charging') ||
    q.includes('tesla') ||
    q.includes('electric vehicle');

  if (isParkingQuery) {
    const parking = property.checkIn?.parkingInfo || 'Parking is available on property in the designated spaces or driveway.';
    const ev = property.checkIn?.evCharger ? `\n\n• **EV Charging**: ${property.checkIn.evCharger}` : '';
    return {
      reply: `### 🚗 Parking & Vehicle Instructions\n\n${parking}${ev}`,
      actionChips: [
        { label: '🚗 Check-In Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
        { label: `📞 Contact ${property.host?.name || 'Host'}`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
      ],
    };
  }

  // 5. Check-In Time & Check-Out Time / Policies
  const isCheckInOutQuery =
    q.includes('check-in') ||
    q.includes('checkin') ||
    q.includes('check in') ||
    q.includes('check-out') ||
    q.includes('checkout') ||
    q.includes('check out') ||
    q.includes('departure') ||
    q.includes('leave') ||
    q.includes('leaving') ||
    q.includes('early arrival') ||
    q.includes('late checkout') ||
    q.includes('late check-out');

  if (isCheckInOutQuery) {
    return {
      reply: `### 🕒 Check-In & Check-Out Schedule for ${property.name}\n\n• **Standard Check-In**: ${property.checkIn?.time || '4:00 PM'}\n• **Standard Check-Out**: 11:00 AM\n• **Early Arrival / Late Departure**: ${property.checkIn?.earlyCheckInPolicy || 'Please contact your host in advance to coordinate timing.'}`,
      actionChips: [
        { label: '🔑 Check-In Info', prompt: 'Show check-in details', action: 'open_checkin' },
        { label: `📞 Message ${property.host?.name || 'Host'}`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
      ],
    };
  }

  // 6. Host Contact & Emergency Directory
  const isHostQuery =
    q.includes('host') ||
    q.includes('manager') ||
    q.includes('owner') ||
    q.includes('contact') ||
    q.includes('call') ||
    q.includes('phone') ||
    q.includes('emergency') ||
    q.includes('urgent') ||
    q.includes('police') ||
    q.includes('fire') ||
    q.includes('hospital');

  if (isHostQuery) {
    const emergencyList = (property.emergencyContacts || [])
      .map(c => `• **${c.label || 'Contact'}** (${c.name || ''}): ${c.number || ''} ${c.description ? `— ${c.description}` : ''}`)
      .join('\n');

    return {
      reply: `### 📞 Host & Emergency Contacts\n\n• **Host**: ${property.host?.name || 'Your Host'} (${property.host?.superhost ? '⭐ Superhost' : 'Host'})\n• **Phone**: ${property.host?.phoneFormatted || ''}\n• **Emergency Phone**: ${property.host?.emergencyPhone || property.host?.phoneFormatted || ''}\n• **Email**: ${property.host?.email || ''}\n• **Avg Response Time**: ${property.host?.responseTime || 'within 1 hour'}\n\n${emergencyList ? `**Emergency Directory**:\n${emergencyList}` : ''}`,
      actionChips: [
        { label: `📞 Call Host`, prompt: `Call ${property.host?.name || 'Host'}`, action: 'open_call' },
        { label: '🚨 Emergency Contacts', prompt: 'Open emergency call screen', action: 'open_call' },
      ],
    };
  }

  // 7. House Rules
  const isRulesQuery =
    q.includes('rule') ||
    q.includes('quiet hour') ||
    q.includes('noise') ||
    q.includes('smoking') ||
    q.includes('smoke') ||
    q.includes('pet') ||
    q.includes('dog') ||
    q.includes('cat') ||
    q.includes('party') ||
    q.includes('parties');

  if (isRulesQuery) {
    const rulesList = (property.houseRules || [])
      .map(r => `• ${r}`)
      .join('\n');

    return {
      reply: `### 📋 House Rules for ${property.name}\n\n${rulesList || '• Please treat the home with care.\n• Quiet hours from 10:00 PM to 8:00 AM.\n• No smoking or unauthorized parties.'}`,
      actionChips: [
        { label: '📖 Full House Guide', prompt: 'Open house guide', action: 'open_guide' },
        { label: `📞 Message Host`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
      ],
    };
  }

  // 8. Features, Appliances & House Guide Search
  const applianceKeywords = [
    'thermostat', 'heat', 'heating', 'heater', 'ac', 'air condition', 'temperature', 'cold', 'warm',
    'tv', 'television', 'remote', 'streaming', 'netflix', 'cable',
    'trash', 'garbage', 'rubbish', 'bin', 'recycling', 'recycle',
    'coffee', 'maker', 'keurig', 'nespresso',
    'dishwasher', 'washer', 'dryer', 'laundry', 'wash',
    'fireplace', 'fire', 'stove', 'oven', 'microwave',
    'hot tub', 'pool', 'jacuzzi', 'spa', 'grill', 'bbq', 'barbecue',
    'fan', 'blinds', 'shower', 'water', 'towel', 'towels', 'linens', 'blanket',
    'iron', 'kitchen'
  ];

  const matchedAppliance = applianceKeywords.find(keyword => q.includes(keyword));
  if (matchedAppliance && property.houseGuideText) {
    const paragraphs = property.houseGuideText.split(/\n\s*\n/);
    const relevant = paragraphs.filter(p => p.toLowerCase().includes(matchedAppliance));
    if (relevant.length > 0) {
      return {
        reply: `### 📖 House Guide: ${matchedAppliance.toUpperCase()}\n\n${relevant.slice(0, 2).join('\n\n')}\n\n*For more instructions, tap below to view the complete guide.*`,
        actionChips: [
          { label: '📖 Open House Guide', prompt: 'Open house guide', action: 'open_guide' },
          { label: `📞 Ask Host`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
        ],
      };
    }
  }

  // Custom AI instructions search
  if (property.customAiInstructions) {
    const customParas = property.customAiInstructions.split(/\n\s*\n/);
    const customMatch = customParas.find(p => {
      const words = q.split(/\s+/).filter(w => w.length > 3);
      return words.some(w => p.toLowerCase().includes(w));
    });
    if (customMatch) {
      return {
        reply: `### 💡 Host Instructions\n\n${customMatch}\n\n*Provided directly by ${property.host?.name || 'Host'}.*`,
        actionChips: [
          { label: '📖 Open House Guide', prompt: 'Open house guide', action: 'open_guide' },
          { label: `📞 Contact Host`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
        ],
      };
    }
  }

  // 9. Local Recommendations
  const isRecQuery =
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('restaurant') ||
    q.includes('dinner') ||
    q.includes('lunch') ||
    q.includes('breakfast') ||
    q.includes('brunch') ||
    q.includes('coffee') ||
    q.includes('cafe') ||
    q.includes('espresso') ||
    q.includes('grocery') ||
    q.includes('groceries') ||
    q.includes('supermarket') ||
    q.includes('market') ||
    q.includes('drink') ||
    q.includes('drinks') ||
    q.includes('bar') ||
    q.includes('pub') ||
    q.includes('beer') ||
    q.includes('wine') ||
    q.includes('hike') ||
    q.includes('hiking') ||
    q.includes('trail') ||
    q.includes('activity') ||
    q.includes('activities') ||
    q.includes('recommend') ||
    q.includes('spot') ||
    q.includes('spots');

  if (isRecQuery && property.recommendations && property.recommendations.length > 0) {
    let matches = property.recommendations.filter(r => {
      const text = `${r.name || ''} ${r.type || ''} ${r.description || ''}`.toLowerCase();
      if (q.includes('coffee') || q.includes('cafe')) return text.includes('coffee') || text.includes('cafe');
      if (q.includes('food') || q.includes('restaurant') || q.includes('dinner') || q.includes('eat') || q.includes('lunch')) return text.includes('food') || text.includes('restaurant') || text.includes('dining');
      if (q.includes('grocery') || q.includes('groceries') || q.includes('market')) return text.includes('market') || text.includes('grocery');
      if (q.includes('hike') || q.includes('trail') || q.includes('outdoors')) return text.includes('hike') || text.includes('trail');
      return true;
    });

    if (matches.length === 0) {
      matches = property.recommendations;
    }

    const recsList = matches
      .slice(0, 3)
      .map(r => `• **${r.name}** (${r.type || 'Local'}, ${r.distance || 'Nearby'})\n  ${r.description || ''} ★ ${r.rating || 4.8}${r.highlight ? `\n  *Highlight*: ${r.highlight}` : ''}`)
      .join('\n\n');

    return {
      reply: `### 📍 Recommended Spots Near ${property.name}\n\n${recsList}`,
      actionChips: [
        { label: '📍 All Recommendations', prompt: 'Show all recommendations', action: 'open_recommendations' },
        { label: `📞 Ask Host`, prompt: `Contact ${property.host?.name || 'Host'}`, action: 'open_host' },
      ],
    };
  }

  // 10. Games / Entertainment
  const isGamesQuery =
    q.includes('game') ||
    q.includes('games') ||
    q.includes('bored') ||
    q.includes('truth or dare') ||
    q.includes('never have i ever') ||
    (q.includes('play') && !q.includes('how to play'));

  if (isGamesQuery) {
    return {
      reply: `### 🎲 Cabin Entertainment & Party Games\n\nLooking for something fun to do? We have built-in pass-and-play party games ready to launch:\n\n• **Truth or Dare** (4 intensities: Casual to Spicy)\n• **Never Have I Ever** (Tailored for groups)\n\nTap below to start playing!`,
      actionChips: [
        { label: '🎲 Open Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
      ],
    };
  }

  // 11. Standard Greetings
  const isGreetingQuery =
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q.startsWith('hi ') ||
    q.startsWith('hello ') ||
    q.startsWith('hey ') ||
    q.includes('good morning') ||
    q.includes('good afternoon') ||
    q.includes('good evening') ||
    q.includes('what can you do') ||
    q.includes('who are you');

  if (isGreetingQuery) {
    return {
      reply: `Hello! I'm **${property.assistantName || 'AI Concierge'}**, your digital guide for **${property.name}**.\n\nI can help you with Wi-Fi passwords, door keypad codes, parking, home features, rules, and local food spots. What can I help you with?`,
      actionChips: [
        { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
        { label: '📶 Wi-Fi Info', prompt: 'What is the wifi password?', action: 'open_wifi' },
        { label: '🚗 Parking Info', prompt: 'Where do I park?', action: 'open_checkin' },
      ],
    };
  }

  // 12. NO MATCH / Not enough data
  return {
    reply: `You're experiencing an error and our AI assistant is temporarily unavailable. We couldn't find a direct match for your question in the offline property guide.\n\nPlease try again later, or contact your host **${property.host?.name || 'your host'}** directly.`,
    actionChips: [
      { label: `📞 Call Host`, prompt: `Call ${property.host?.name || 'Host'}`, action: 'open_call' },
      { label: '📖 House Guide', prompt: 'Open house guide', action: 'open_guide' },
      { label: '🔑 Check-In Info', prompt: 'Open check-in guide', action: 'open_checkin' },
    ],
  };
}

export default async function handler(req: Request, context: NetlifyContext): Promise<Response> {
  // CORS Headers
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }

  // Rate Limiting / Abuse Protection
  cleanupRateLimitMap(); // serverless-safe inline cleanup
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || context.ip || 'anonymous';
  if (isRateLimited(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a moment before sending another message.',
      }),
      {
        status: 429,
        headers: corsHeaders,
      }
    );
  }

  // Parse and validate request body first
  let body: RequestBody;
  try {
    const rawBody = await req.text();
    // Payload size guard: max 5MB (for base64 photos)
    if (rawBody.length > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Payload too large.' }),
        { status: 413, headers: corsHeaders }
      );
    }
    body = JSON.parse(rawBody);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON request body.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  const { messageText, property, image, isAudioMessage } = body;

  if (!property || typeof property !== 'object' || !property.name) {
    return new Response(
      JSON.stringify({ error: 'Invalid property payload.' }),
      { status: 400, headers: corsHeaders }
    );
  }

  // Server-side environment variable (supports GEMINI_API_KEY, VITE_GEMINI_API_KEY, GOOGLE_API_KEY)
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY;

  // If no Gemini API key configured on server, seamlessly provide the smart property backup answer
  if (!apiKey || apiKey.trim() === '') {
    console.warn('GEMINI_API_KEY is not configured on server. Serving smart dynamic property backup response.');
    const backup = getSmartServerBackup(messageText, property);
    return new Response(
      JSON.stringify({
        reply: backup.reply,
        copiedText: backup.copiedText || null,
        actionChips: backup.actionChips,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }


  try {
    const aiClient = new GoogleGenAI({ apiKey });
    const systemInstruction = buildSystemInstruction(property);

    // Prepare content parts
    const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

    // Multimodal image attachment
    if (image?.url) {
      const inlinePart = parseDataUrlToPart(image.url);
      if (inlinePart) {
        parts.push(inlinePart);
      }
    }

    // User query prompt
    let userPrompt = (messageText || '').trim();
    if (image?.caption && !userPrompt.includes(image.caption)) {
      userPrompt = `[Attached photo: ${image.caption}] ${userPrompt}`.trim();
    }
    if (isAudioMessage && !userPrompt) {
      userPrompt = 'The guest just sent a voice message asking for help with their stay.';
    }
    if (!userPrompt) {
      userPrompt = 'Hello! What can you help me with during my stay?';
    }

    // Input length limit guard (abuse protection)
    if (userPrompt.length > 3000) {
      userPrompt = userPrompt.substring(0, 3000);
    }

    parts.push({ text: userPrompt });

    // Call Gemini with model fallback (gemini-2.5-flash-lite -> gemini-2.5-flash)
    let response: any;
    try {
      response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: [
          {
            role: 'user',
            parts: parts as any,
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
    } catch (modelErr: any) {
      console.warn('gemini-2.5-flash-lite failed, attempting gemini-2.5-flash fallback:', modelErr?.message);
      response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: parts as any,
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        },
      });
    }

    const responseText = response.text || '';
    let parsed: {
      reply?: string;
      actionChips?: Array<{
        label: string;
        prompt: string;
        action?: string;
      }>;
      copiedText?: string;
    } = {};

    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = { reply: responseText };
    }

    const replyContent = parsed.reply || responseText || `I'm here to help with your stay at **${property.name}**!`;

    const validActions = new Set([
      'open_wifi',
      'open_checkin',
      'open_guide',
      'open_host',
      'open_call',
      'open_play',
      'open_recommendations',
    ]);

    const formattedChips = (parsed.actionChips || [])
      .filter((chip) => chip && chip.label && chip.prompt)
      .map((chip) => ({
        label: chip.label,
        prompt: chip.prompt,
        action: chip.action && validActions.has(chip.action) ? chip.action : undefined,
      }));

    let copiedText = parsed.copiedText;
    if (!copiedText) {
      if (property.checkIn?.accessCode && replyContent.includes(property.checkIn.accessCode)) {
        copiedText = property.checkIn.accessCode;
      } else if (property.wifi?.password && replyContent.includes(property.wifi.password)) {
        copiedText = property.wifi.password;
      }
    }

    return new Response(
      JSON.stringify({
        reply: replyContent,
        copiedText: copiedText || null,
        actionChips:
          formattedChips.length > 0
            ? formattedChips
            : [
                { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
                { label: '📶 Wi-Fi Details', prompt: 'Show Wi-Fi details', action: 'open_wifi' },
                { label: '🎲 Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
              ],
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err: any) {
    console.error('Error in Netlify Function ai-response calling Gemini API:', err);
    // Serve smart dynamic backup response directly from property data
    const backup = getSmartServerBackup(messageText, property);
    return new Response(
      JSON.stringify({
        reply: backup.reply,
        copiedText: backup.copiedText || null,
        actionChips: backup.actionChips,
        fallback: true,
      }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  }
}
