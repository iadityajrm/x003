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
/**
 * Smart offline backup response generator.
 * When the server-side AI or network is unavailable, this backup uses all dynamic property
 * data entered by the host (Wi-Fi, keypad, lockbox, parking, EV charger, house guide, rules, recommendations)
 * to accurately answer guest inquiries.
 * If there is not enough data or no match found, it clearly lets the guest know they are experiencing
 * a temporary connection error and advises them to try again later or contact the host.
 */
export function getSmartPropertyBackup(
  messageText: string,
  property: PropertyData,
  hasImage?: boolean,
  isAudio?: boolean
): {
  content: string;
  copiedText?: string;
  actionChips: Array<{
    label: string;
    prompt: string;
    action?: 'open_wifi' | 'open_checkin' | 'open_guide' | 'open_host' | 'open_call' | 'open_play' | 'open_recommendations';
  }>;
  isError?: boolean;
} {
  const raw = (messageText || '').trim();
  const q = raw.toLowerCase();

  // Helper: check if guest unlocked protected codes
  const isUnlocked = typeof window !== 'undefined' ? 
    (sessionStorage.getItem(`relay_unlocked_guest_${property.slug}`) === 'true' || 
     localStorage.getItem(`relay_unlocked_guest_${property.slug}`) === 'true' ||
     sessionStorage.getItem(`dwellio_unlocked_guest_${property.slug}`) === 'true' || 
     localStorage.getItem(`dwellio_unlocked_guest_${property.slug}`) === 'true') : true;

  // 1. Photo Attachment
  if (hasImage) {
    return {
      content: `I received your photo for **${property.name}**!\n\nIf you are troubleshooting an appliance, thermostat, or entry lock, please consult our House Guide or contact your host **${property.host.name}** directly.`,
      actionChips: [
        { label: '📖 House Guide', prompt: 'Open house guide', action: 'open_guide' },
        { label: `📞 Contact ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  // 2. Physical Key & Emergency Lockbox ("where are the keys", "lockbox", "physical key", "backup key")
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
    if (!isUnlocked) {
      return {
        content: `To protect guest security and privacy, emergency keybox locations and codes are protected.\n\nPlease open the **Getting Inside** guide and verify your reservation phone number to reveal the code!`,
        actionChips: [
          { label: '🔑 Verify & Reveal Code', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call Host (${property.host.name})`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        ],
      };
    }

    const keybox = property.checkIn?.emergencyKeybox?.trim();
    if (keybox) {
      return {
        content: `### 🔑 Physical Key & Emergency Lockbox\n\n${keybox}\n\n• **Main Door Lock**: ${property.checkIn?.lockType || 'Keypad Smart Lock'}\n• **Keypad Code**: \`${property.checkIn?.accessCode || ''}\``,
        copiedText: property.checkIn?.accessCode,
        actionChips: [
          { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call ${property.host.name}`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        ],
      };
    } else {
      return {
        content: `### 🔑 Physical Key Info\n\nThis property uses **${property.checkIn?.lockType || 'Keypad Digital Lock'}**, so physical keys are usually not required for entry.\n\n• **Door Code**: \`${property.checkIn?.accessCode}\`\n\nIf you need emergency physical key assistance, please call your host **${property.host.name}** directly.`,
        copiedText: property.checkIn?.accessCode,
        actionChips: [
          { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call Host`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        ],
      };
    }
  }

  // 3. Door Keypad / Access Code / How to unlock
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
    if (!isUnlocked) {
      return {
        content: `To protect your security, door keypad codes and physical lockbox codes are protected.\n\nPlease open the **Getting Inside** guide and verify your booking phone number to reveal the code!`,
        actionChips: [
          { label: '🔑 Verify & Reveal Code', prompt: 'Open check-in guide', action: 'open_checkin' },
          { label: `📞 Call Host (${property.host.name})`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        ],
      };
    }

    const instructions = (property.checkIn?.doorInstructions || [])
      .map((ins, i) => `${i + 1}. ${ins}`)
      .join('\n');

    return {
      content: `### 🔑 Door Entry & Keypad Code for ${property.name}\n\n• **Access Code**: \`${property.checkIn?.accessCode}\`\n• **Lock System**: ${property.checkIn?.lockType}\n• **Check-in Time**: ${property.checkIn?.time}\n\n${instructions ? `**Instructions**:\n${instructions}` : 'Enter the code on the door keypad and turn the latch.'}`,
      copiedText: property.checkIn?.accessCode,
      actionChips: [
        { label: '🔑 Check-in Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
        { label: `📞 Call ${property.host.name}`, prompt: `Call ${property.host.name}`, action: 'open_call' },
      ],
    };
  }

  // 4. Wi-Fi & Internet
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
      content: `### 📶 Wi-Fi Network & Password\n\n• **Network**: \`${property.wifi.network}\`\n• **Password**: \`${property.wifi.password}\`\n\n*Tap the password to copy, or view QR code in the Wi-Fi screen.*`,
      copiedText: property.wifi.password,
      actionChips: [
        { label: '📋 Copy Password', prompt: 'Copy wifi password' },
        { label: '📶 Wi-Fi Details', prompt: 'Show Wi-Fi QR', action: 'open_wifi' },
      ],
    };
  }

  // 5. Parking & EV Charger
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
      content: `### 🚗 Parking & Vehicle Instructions\n\n${parking}${ev}`,
      actionChips: [
        { label: '🚗 Check-In Guide', prompt: 'Open check-in guide', action: 'open_checkin' },
        { label: `📞 Contact ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  // 6. Check-In Time & Check-Out Time / Policies
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
      content: `### 🕒 Check-In & Check-Out Schedule for ${property.name}\n\n• **Standard Check-In**: ${property.checkIn?.time || '4:00 PM'}\n• **Standard Check-Out**: 11:00 AM\n• **Early Arrival / Late Departure**: ${property.checkIn?.earlyCheckInPolicy || 'Please contact your host in advance to coordinate timing.'}`,
      actionChips: [
        { label: '🔑 Check-In Info', prompt: 'Show check-in details', action: 'open_checkin' },
        { label: `📞 Message ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  // 7. Host Contact & Emergency Directory
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
      .map(c => `• **${c.label}** (${c.name}): ${c.number} ${c.description ? `— ${c.description}` : ''}`)
      .join('\n');

    return {
      content: `### 📞 Host & Emergency Contacts\n\n• **Host**: ${property.host.name} (${property.host.superhost ? '⭐ Superhost' : 'Host'})\n• **Phone**: ${property.host.phoneFormatted}\n• **Emergency Phone**: ${property.host.emergencyPhone || property.host.phoneFormatted}\n• **Email**: ${property.host.email}\n• **Avg Response Time**: ${property.host.responseTime}\n\n${emergencyList ? `**Emergency Directory**:\n${emergencyList}` : ''}`,
      actionChips: [
        { label: `📞 Call ${property.host.name}`, prompt: `Call ${property.host.name}`, action: 'open_call' },
        { label: '🚨 Emergency Contacts', prompt: 'Open emergency call screen', action: 'open_call' },
      ],
    };
  }

  // 8. House Rules
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
      content: `### 📋 House Rules for ${property.name}\n\n${rulesList || '• Please treat the home with care.\n• Quiet hours from 10:00 PM to 8:00 AM.\n• No smoking or unauthorized parties.'}`,
      actionChips: [
        { label: '📖 Full House Guide', prompt: 'Open house guide', action: 'open_guide' },
        { label: `📞 Message Host`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  // 9. Features, Appliances & House Guide Search
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
    // Search paragraphs in the house guide for the keyword
    const paragraphs = property.houseGuideText.split(/\n\s*\n/);
    const relevant = paragraphs.filter(p => p.toLowerCase().includes(matchedAppliance));
    if (relevant.length > 0) {
      return {
        content: `### 📖 House Guide: ${matchedAppliance.toUpperCase()}\n\n${relevant.slice(0, 2).join('\n\n')}\n\n*For more instructions, tap below to view the complete guide.*`,
        actionChips: [
          { label: '📖 Open House Guide', prompt: 'Open house guide', action: 'open_guide' },
          { label: `📞 Ask ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
        ],
      };
    }
  }

  // Also check custom AI instructions if host configured any specific answers
  if (property.customAiInstructions) {
    const customParas = property.customAiInstructions.split(/\n\s*\n/);
    const customMatch = customParas.find(p => {
      const words = q.split(/\s+/).filter(w => w.length > 3);
      return words.some(w => p.toLowerCase().includes(w));
    });
    if (customMatch) {
      return {
        content: `### 💡 Host Instructions\n\n${customMatch}\n\n*Provided directly by ${property.host.name}.*`,
        actionChips: [
          { label: '📖 Open House Guide', prompt: 'Open house guide', action: 'open_guide' },
          { label: `📞 Contact Host`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
        ],
      };
    }
  }

  // 10. Local Recommendations (Food, Coffee, Groceries, Dining, Hiking, Activities)
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
      const text = `${r.name} ${r.type} ${r.category} ${r.description}`.toLowerCase();
      if (q.includes('coffee') || q.includes('cafe')) return text.includes('coffee') || text.includes('cafe') || r.category === 'coffee';
      if (q.includes('food') || q.includes('restaurant') || q.includes('dinner') || q.includes('eat') || q.includes('lunch')) return r.category === 'dining' || text.includes('food') || text.includes('restaurant');
      if (q.includes('grocery') || q.includes('groceries') || q.includes('market')) return r.category === 'essentials' || text.includes('market') || text.includes('grocery');
      if (q.includes('hike') || q.includes('trail') || q.includes('outdoors')) return r.category === 'outdoors' || text.includes('hike') || text.includes('trail');
      return true;
    });

    if (matches.length === 0) {
      matches = property.recommendations;
    }

    const recsList = matches
      .slice(0, 3)
      .map(r => `• **${r.name}** (${r.type || r.category}, ${r.distance})\n  ${r.description} ★ ${r.rating || 4.8}${r.highlight ? `\n  *Highlight*: ${r.highlight}` : ''}`)
      .join('\n\n');

    return {
      content: `### 📍 Recommended Spots Near ${property.name}\n\n${recsList}`,
      actionChips: [
        { label: '📍 All Recommendations', prompt: 'Show all recommendations', action: 'open_recommendations' },
        { label: `📞 Ask ${property.host.name}`, prompt: `Contact ${property.host.name}`, action: 'open_host' },
      ],
    };
  }

  // 11. Games / Entertainment
  const isGamesQuery =
    q.includes('game') ||
    q.includes('games') ||
    q.includes('bored') ||
    q.includes('truth or dare') ||
    q.includes('never have i ever') ||
    (q.includes('play') && !q.includes('how to play'));

  if (isGamesQuery) {
    return {
      content: `### 🎲 Cabin Entertainment & Party Games\n\nLooking for something fun to do? We have built-in pass-and-play party games ready to launch:\n\n• **Truth or Dare** (4 intensities: Casual to Spicy)\n• **Never Have I Ever** (Tailored for groups)\n\nTap below to start playing!`,
      actionChips: [
        { label: '🎲 Open Cabin Games', prompt: 'Open cabin games', action: 'open_play' },
      ],
    };
  }

  // 12. Standard Greetings
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
      content: `Hello! I'm **${property.assistantName}**, your digital concierge for **${property.name}**.\n\nI can help you with Wi-Fi passwords, door keypad codes, parking, home features, rules, and local food spots. What can I help you with?`,
      actionChips: [
        { label: '🔑 Door Code', prompt: 'What is the door code?', action: 'open_checkin' },
        { label: '📶 Wi-Fi Info', prompt: 'What is the wifi password?', action: 'open_wifi' },
        { label: '🚗 Parking Info', prompt: 'Where do I park?', action: 'open_checkin' },
      ],
    };
  }

  // 13. NO MATCH / Not enough data
  // User specification: "for anything that doesnt have enough data no match just respond, youre experiancing an error and try again later."
  return {
    content: `You're experiencing an error and our AI assistant is temporarily unavailable. We couldn't find a direct match for your question in the offline property guide.\n\nPlease try again later, or contact your host **${property.host.name}** directly.`,
    actionChips: [
      { label: `📞 Call ${property.host.name}`, prompt: `Call ${property.host.name}`, action: 'open_call' },
      { label: '📖 House Guide', prompt: 'Open house guide', action: 'open_guide' },
      { label: '🔑 Check-In Info', prompt: 'Open check-in guide', action: 'open_checkin' },
    ],
    isError: true,
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
    console.warn('ai-response function unavailable or failed, falling back to smart property backup response:', err);
    const backup = getSmartPropertyBackup(messageText, property, !!image, isAudioMessage);
    return {
      id,
      sender: 'assistant',
      timestamp,
      content: backup.content,
      hasAudioResponse: true,
      copiedText: backup.copiedText,
      actionChips: backup.actionChips as any,
      isError: backup.isError,
    };
  }
}
