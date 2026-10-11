let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return () => {};
  }

  // Stop any ongoing speech
  window.speechSynthesis.cancel();

  // Strip markdown symbols for clean natural reading
  const cleanText = text
    .replace(/[*_#`~]/g, '')
    .replace(/•/g, ', ')
    .replace(/⚠️/g, 'Warning: ')
    .replace(/⭐/g, 'rating: ')
    .replace(/\n+/g, '. ');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  currentUtterance = utterance;

  // Attempt to select a natural English voice
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(
    v => (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Karen') || v.name.includes('Daniel') || v.name.includes('Ava')) && v.lang.startsWith('en')
  ) || voices.find(v => v.lang.startsWith('en'));

  if (naturalVoice) {
    utterance.voice = naturalVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    onError?.();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  };
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
}
