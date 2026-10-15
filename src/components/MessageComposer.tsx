import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  Mic, 
  Trash2, 
  X, 
  Send,
  Sparkles,
  Wifi,
  KeyRound,
  Thermometer,
  Coffee,
  HelpCircle
} from 'lucide-react';
import { VoiceRecorder } from '../utils/audioRecorder';
import { PropertyData } from '../types';

interface MessageComposerProps {
  property: PropertyData;
  draftText: string;
  onDraftChange: (text: string) => void;
  onSendMessage: (text: string, image?: { url: string; caption: string }, audio?: { url: string; duration: number }) => void;
  disabled?: boolean;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  property,
  draftText,
  onDraftChange,
  onSendMessage,
  disabled,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0.3);
  const [showPromptsMenu, setShowPromptsMenu] = useState(false);

  const timerRef = useRef<number | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 4 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 24), 96)}px`;
    }
  }, [draftText]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.cancel();
    };
  }, []);

  const handleStartRecording = async () => {
    const recorder = new VoiceRecorder();
    recorderRef.current = recorder;
    setIsRecording(true);
    setRecordDuration(0);

    timerRef.current = window.setInterval(() => {
      setRecordDuration(prev => prev + 1);
    }, 1000);

    await recorder.start((level) => {
      setAudioLevel(Math.max(0.15, level));
    });
  };

  const handleCancelRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    recorderRef.current?.cancel();
    setIsRecording(false);
    setRecordDuration(0);
  };

  const handleStopAndSendRecording = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current) {
      const result = await recorderRef.current.stop();
      setIsRecording(false);
      onSendMessage(
        draftText.trim() || '🎤 Voice message for Assistant',
        undefined,
        { url: result.url || 'data:audio/wav;base64,mock', duration: result.duration }
      );
      onDraftChange('');
      setRecordDuration(0);
    }
  };

  const handleSend = () => {
    if (!draftText.trim() || disabled) return;
    onSendMessage(draftText.trim());
    onDraftChange('');
    setShowPromptsMenu(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectQuickPrompt = (prompt: string, autoSend: boolean = false) => {
    if (autoSend) {
      onSendMessage(prompt);
      onDraftChange('');
    } else {
      onDraftChange(prompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
    setShowPromptsMenu(false);
  };

  const samplePrompts = [
    { label: 'Wi-Fi Password', prompt: 'What is the Wi-Fi network and password?', icon: Wifi },
    { label: 'Keypad Instructions', prompt: 'How do I unlock the front door keypad?', icon: KeyRound },
    { label: 'Thermostat / Heating', prompt: 'How do I adjust the thermostat and temperature?', icon: Thermometer },
    { label: 'Coffee & Breakfast', prompt: 'Where is the best breakfast or coffee nearby?', icon: Coffee },
    { label: 'Checkout Time', prompt: 'What time is checkout and what are the checkout steps?', icon: HelpCircle },
    { label: 'Trash & Recycling', prompt: 'Where are the trash bins and what is the pickup schedule?', icon: Sparkles },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-md mx-auto px-4 pb-4 safe-bottom pointer-events-none">
      {/* Quick Sample Prompts Popover (Triggered by '+') */}
      {showPromptsMenu && (
        <div className="pointer-events-auto mb-2 p-3.5 rounded-2xl bg-white dark:bg-[#201F1C] border border-black/10 dark:border-white/10 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#2A4436] dark:text-[#78A88E]" />
              <span className="text-xs font-bold text-[#1C1B18] dark:text-white">Quick Prompts for Assistant</span>
            </div>
            <button
              onClick={() => setShowPromptsMenu(false)}
              className="p-1 text-[#78756E] dark:text-neutral-400 hover:text-[#1C1B18] dark:hover:text-white rounded-full hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {samplePrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickPrompt(item.prompt, true)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#F6F4F0] dark:bg-white/5 hover:bg-[#EBF2EC] dark:hover:bg-white/10 text-xs font-semibold text-[#1C1B18] dark:text-white border border-black/5 dark:border-white/5 transition-all text-left cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 text-[#2A4436] dark:text-[#78A88E] flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#2A4436] group-hover:text-white transition-colors">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The Main Rounded Pill Composer - Perfectly Centered Height & Children */}
      <div className="pointer-events-auto relative flex items-center gap-2 px-2.5 py-1.5 rounded-[32px] bg-white/95 dark:bg-[#1E1D1A]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-composer transition-all">
        {/* Attachment '+' Button in soft beige circular circle */}
        {!isRecording && (
          <button
            onClick={() => setShowPromptsMenu(!showPromptsMenu)}
            className={`flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0 cursor-pointer ${
              showPromptsMenu
                ? 'bg-[#2A4436] text-white rotate-45'
                : 'bg-[#F4EFEA] dark:bg-white/10 hover:bg-[#EAE4DD] dark:hover:bg-white/15 text-[#3D3B36] dark:text-neutral-200'
            }`}
            title="Quick sample prompts"
            aria-label="Quick Prompts"
          >
            <Plus className="w-5 h-5 stroke-[2.2] transition-transform" />
          </button>
        )}

        {/* Dynamic Composer Body: Normal Text Input VS Active Recording Mode */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-2 py-0.5 min-h-[36px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-red-600 dark:text-red-400">
                0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
              </span>
              {/* Dynamic Waveform Bars */}
              <div className="flex items-center gap-0.5 h-4 ml-1">
                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 0.95, 0.6, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(4, audioLevel * scale * 18)}px`,
                    }}
                    className="w-0.5 bg-red-500 rounded-full transition-all duration-75"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCancelRecording}
                className="p-1.5 rounded-full text-[#78756E] dark:text-neutral-400 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Cancel voice message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleStopAndSendRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Textarea Field: Vertically centered, auto-wraps, no excess height */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={draftText}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              disabled={disabled}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm text-[#1C1B18] dark:text-white placeholder-[#8E8B82] dark:placeholder-neutral-500 focus:outline-none focus:ring-0 min-w-0 resize-none max-h-[96px] overflow-y-auto leading-normal self-center"
            />

            {/* Right Action Controls Group */}
            <div className="flex items-center gap-1 shrink-0 self-center">
              {/* Mic / Waveform Audio Button */}
              <button
                onClick={handleStartRecording}
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#78756E] dark:text-neutral-400 hover:text-[#1C1B18] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                title="Record audio message"
                aria-label="Record audio message"
              >
                <div className="flex items-center justify-center gap-0.5 h-4 px-0.5">
                  <span className="w-0.5 h-2 bg-current rounded-full" />
                  <span className="w-0.5 h-3.5 bg-current rounded-full" />
                  <span className="w-0.5 h-2 bg-current rounded-full" />
                  <span className="w-0.5 h-1.5 bg-current rounded-full" />
                </div>
              </button>

              {/* Send Button */}
              <button
                onClick={handleSend}
                disabled={!draftText.trim() || disabled}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0 ${
                  draftText.trim()
                    ? 'bg-[#2A4436] hover:bg-[#20362B] text-white shadow-sm active:scale-95 cursor-pointer'
                    : 'bg-[#2A4436]/60 dark:bg-[#2A4436]/40 text-white/50 cursor-not-allowed'
                }`}
                title="Send message"
                aria-label="Send message"
              >
                <ArrowUp className="w-5 h-5 stroke-[2.2]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
