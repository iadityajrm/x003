import { GoogleGenAI } from '@google/genai';
import { PropertyData, ChatMessage } from '../types';

interface GenerateResponseOptions {
  messageText: string;
  property: PropertyData;
  image?: { url: string; caption: string };
  isAudioMessage?: boolean;
}

// Read API key from Vite environment variable (or fallback to provided key)
const apiKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
  'AIzaSyDeIiDslnnwBf1L9IXJC16UzPgJS54ys98';

let genAIClient: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

/**
 * Builds a concise, context-rich system instruction for the property.
 */
function buildSystemInstruction(property: PropertyData): string {
  const recsSummary = property.recommendations
    .map(
      (r) =>
        `- ${r.name} (${r.type}, ${r.distance}): ${r.description} (Highlight: ${r.highlight}, Rating: ${r.rating})`
    )
    .join('\n');

  const contactsSummary = property.emergencyContacts
    .map((c) => `- ${c.label} (${c.name}): ${c.number} - ${c.description}`)
    .join('\n');

  return `You are "${property.assistantName}", the warm, hospitable, and knowledgeable AI guest concierge for "${property.name}" located in "${property.location}".

PROPERTY DETAILS:
- Tagline: ${property.tagline}
- Host: ${property.host.name} (${property.host.phoneFormatted}, Superhost: ${property.host.superhost}, Avg response: ${property.host.responseTime})
- Emergency Phone: ${property.host.emergencyPhone}
- Wi-Fi: Network "${property.wifi.network}", Password "${property.wifi.password}"
- Check-in: Standard check-in time is ${property.checkIn.time}. Lock system is "${property.checkIn.lockType}". Door keypad code is "${property.checkIn.accessCode}".
- Door instructions: ${property.checkIn.doorInstructions.join(' | ')}
- Parking: ${property.checkIn.parkingInfo}
- EV Charger: ${property.checkIn.evCharger}
- Emergency Lockbox: ${property.checkIn.emergencyKeybox}
- Early Check-in Policy: ${property.checkIn.earlyCheckInPolicy}

HOUSE RULES & GUIDE:
- Rules: ${property.houseRules.join('; ')}
- House manual:
${property.houseGuideText}

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
6. Keep replies concise, accurate, and specific to ${property.name}.
`;
}

/**
 * Converts a data URL (e.g. data:image/jpeg;base64,...) to inlineData part.
 */
function parseDataUrlToPart(dataUrl: string): { inlineData: { mimeType: string; data: string } } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      inlineData: {
        mimeType: match[1],
        data: match[2],
      },
    };
  }
  return null;
}

/**
 * Fallback response generator in case of network offline or API rate-limit.
 */
function getOfflineFallbackResponse(
  messageText: string,
  property: PropertyData,
  hasImage?: boolean
): ChatMessage {
  const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const query = (messageText || '').toLowerCase();

  if (hasImage) {
    return {
      id,
      sender: 'assistant',
      timestamp,
      content: `I received your photo for **${property.name}**!\n\nIf you are troubleshooting an appliance or smart lock, please refer to our House Guide or contact host **${property.host.name}** directly.`,
      hasAudioResponse: true,
      actionChips: [
        { label: '📖 House Guide', prompt: 'Open house guide', action: 'open_guide' },
        { label: `📞 Contact ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  if (query.includes('wifi') || query.includes('internet') || query.includes('password')) {
    return {
      id,
      sender: 'assistant',
      timestamp,
      content: `Here are your Wi-Fi credentials for **${property.name}**:\n\n• **Network**: \`${property.wifi.network}\`\n• **Password**: \`${property.wifi.password}\``,
      hasAudioResponse: true,
      copiedText: property.wifi.password,
      actionChips: [
        { label: '📋 Copy Password', prompt: 'Copy wifi password' },
        { label: '📶 Wi-Fi Details', prompt: 'Show wifi QR code', action: 'open_wifi' },
      ],
    };
  }

  if (query.includes('door') || query.includes('code') || query.includes('check in') || query.includes('check-in') || query.includes('key')) {
    return {
      id,
      sender: 'assistant',
      timestamp,
      content: `Here are the entry details for **${property.name}**:\n\n• **Keypad Code**: \`${property.checkIn.accessCode}\`\n• **Lock**: ${property.checkIn.lockType}\n• **Check-in Time**: ${property.checkIn.time}`,
      hasAudioResponse: true,
      copiedText: property.checkIn.accessCode,
      actionChips: [
        { label: '🔑 View Check-in Guide', prompt: 'Show check-in details', action: 'open_checkin' },
        { label: `📞 Call ${property.host.name}`, prompt: `Call ${property.host.name}`, action: 'open_call' },
      ],
    };
  }

  return {
    id,
    sender: 'assistant',
    timestamp,
    content: `I'm **${property.assistantName}**, here to help you enjoy your stay at **${property.name}**!\n\nFeel free to ask about Wi-Fi, door codes, appliance guides, pass-and-play party games, or local recommendations.`,
    hasAudioResponse: true,
    actionChips: [
      { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
      { label: '📶 Wi-Fi Info', prompt: 'What is the wifi password?', action: 'open_wifi' },
      { label: '🎲 Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
    ],
  };
}

/**
 * Main AI response generator using Gemini 3.1 Flash-Lite (model: gemini-3.1-flash-lite).
 */
export async function generateAssistantResponse({
  messageText,
  property,
  image,
  isAudioMessage,
}: GenerateResponseOptions): Promise<ChatMessage> {
  const id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const client = getClient();
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
    let userPrompt = messageText;
    if (image?.caption && !userPrompt.includes(image.caption)) {
      userPrompt = `[Attached photo: ${image.caption}] ${userPrompt}`.trim();
    }
    if (isAudioMessage && !userPrompt) {
      userPrompt = 'The guest just sent a voice message asking for help with their stay.';
    }
    if (!userPrompt.trim()) {
      userPrompt = 'Hello! What can you help me with during my stay?';
    }

    parts.push({ text: userPrompt });

    // Call gemini-3.1-flash-lite with Google GenAI SDK
    const response = await client.models.generateContent({
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
        action?: 'open_wifi' | 'open_checkin' | 'open_guide' | 'open_host' | 'open_call' | 'open_play' | 'open_recommendations';
      }>;
      copiedText?: string;
    } = {};

    try {
      parsed = JSON.parse(responseText);
    } catch {
      // If JSON parsing fails, use the raw response text
      parsed = { reply: responseText };
    }

    const replyContent = parsed.reply || responseText || `I'm here to help with your stay at **${property.name}**!`;

    // Ensure action chips have valid actions if present
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

    // Auto-detect door code or wifi password in copiedText if not supplied
    let copiedText = parsed.copiedText;
    if (!copiedText) {
      if (replyContent.includes(property.checkIn.accessCode)) {
        copiedText = property.checkIn.accessCode;
      } else if (replyContent.includes(property.wifi.password)) {
        copiedText = property.wifi.password;
      }
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      content: replyContent,
      hasAudioResponse: true,
      copiedText,
      actionChips: formattedChips.length > 0 ? formattedChips : [
        { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
        { label: '📶 Wi-Fi Details', prompt: 'Show Wi-Fi details', action: 'open_wifi' },
        { label: '🎲 Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
      ],
    };
  } catch (err) {
    console.warn('Gemini 3.1 Flash-Lite API request error, falling back to local guide response:', err);
    return getOfflineFallbackResponse(messageText, property, !!image);
  }
}
