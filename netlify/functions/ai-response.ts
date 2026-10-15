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

// Periodic cleanup of expired rate limit entries
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitMap.entries()) {
      if (now > record.resetAt) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
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

  // Server-side environment variable exclusively
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    console.error('Server error: GEMINI_API_KEY environment variable is not configured.');
    return new Response(
      JSON.stringify({
        error: 'Server configuration error: Gemini API key not set.',
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }

  // Parse and validate request body
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

    // Call gemini-3.1-flash-lite server-side
    const response = await aiClient.models.generateContent({
      model: 'gemini-3.1-flash-lite',
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
    return new Response(
      JSON.stringify({
        error: 'Failed to generate AI response from Gemini model.',
      }),
      {
        status: 502,
        headers: corsHeaders,
      }
    );
  }
}
