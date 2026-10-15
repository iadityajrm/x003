import { PropertyData, ChatMessage } from '../types';

interface GenerateResponseOptions {
  messageText: string;
  property: PropertyData;
  image?: { url: string; caption: string };
  isAudioMessage?: boolean;
}

/**
 * Fallback response generator in case of network offline, server failure, or rate-limit.
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

  if (
    query.includes('door') ||
    query.includes('code') ||
    query.includes('check in') ||
    query.includes('check-in') ||
    query.includes('key')
  ) {
    const isUnlocked = typeof window !== 'undefined' ? 
      (sessionStorage.getItem(`dwellio_unlocked_guest_${property.slug}`) === 'true' || 
       localStorage.getItem(`dwellio_unlocked_guest_${property.slug}`) === 'true') : false;

    if (!isUnlocked) {
      return {
        id,
        sender: 'assistant',
        timestamp,
        content: `To protect your security, door keypad codes and physical lockbox codes are protected.\n\nPlease open the **Getting Inside** guide and verify your booking phone number to reveal the code!`,
        hasAudioResponse: true,
        actionChips: [
          { label: '🔑 Verify & Reveal Code', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call Host (${property.host.name})`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        ],
      };
    }

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
 * Main AI response generator.
 * Calls the secure server-side Netlify Function at `/.netlify/functions/ai-response`.
 * The function securely uses GEMINI_API_KEY without exposing secrets to the client.
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
    const response = await fetch('/.netlify/functions/ai-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageText,
        property,
        image,
        isAudioMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Netlify Function error: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.error && !data.reply) {
      throw new Error(data.error);
    }

    return {
      id,
      sender: 'assistant',
      timestamp,
      content: data.reply || `I'm here to help with your stay at **${property.name}**!`,
      hasAudioResponse: true,
      copiedText: data.copiedText || undefined,
      actionChips: Array.isArray(data.actionChips) && data.actionChips.length > 0
        ? data.actionChips
        : [
            { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
            { label: '📶 Wi-Fi Details', prompt: 'Show Wi-Fi details', action: 'open_wifi' },
            { label: '🎲 Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
          ],
    };
  } catch (err) {
    console.warn('ai-response function unavailable or failed, falling back to local guide response:', err);
    return getOfflineFallbackResponse(messageText, property, !!image);
  }
}
