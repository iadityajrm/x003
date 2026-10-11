import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  ArrowUp, 
  Mic, 
  Trash2, 
  Camera, 
  Image as ImageIcon, 
  X, 
  Send
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
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{ url: string; caption: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 4 lines
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // 4 lines at ~22px per line is ~88-96px max height
      textareaRef.current.style.height = `${Math.min(scrollHeight, 96)}px`;
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
        draftText.trim() || '🎤 Voice message for ' + property.name,
        attachedImage || undefined,
        { url: result.url || 'data:audio/wav;base64,mock', duration: result.duration }
      );
      setAttachedImage(null);
      onDraftChange('');
      setRecordDuration(0);
    }
  };

  const handleSend = () => {
    if ((!draftText.trim() && !attachedImage) || disabled) return;
    onSendMessage(draftText.trim(), attachedImage || undefined);
    onDraftChange('');
    setAttachedImage(null);
    setShowAttachMenu(false);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachedImage({
          url: reader.result as string,
          caption: file.name,
        });
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPresetPhoto = (type: 'thermostat' | 'lock' | 'coffee') => {
    if (type === 'thermostat') {
      setAttachedImage({
        url: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?auto=format&fit=crop&w=600&q=80',
        caption: 'Nest Thermostat screen display',
      });
      if (!draftText) onDraftChange('How do I adjust the temperature?');
    } else if (type === 'lock') {
      setAttachedImage({
        url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
        caption: 'Front door keypad lock',
      });
      if (!draftText) onDraftChange('Keypad is not unlocking the door');
    } else if (type === 'coffee') {
      setAttachedImage({
        url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
        caption: 'Kitchen Nespresso machine',
      });
      if (!draftText) onDraftChange('How do I brew coffee with this machine?');
    }
    setShowAttachMenu(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full max-w-md mx-auto px-4 pb-4 safe-bottom pointer-events-none">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Attachment Options Popover */}
      {showAttachMenu && (
        <div className="pointer-events-auto mb-2 p-3.5 rounded-2xl bg-white border border-black/10 shadow-2xl animate-slide-up">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
            <span className="text-xs font-bold text-[#1C1B18]">Attach photo or problem</span>
            <button
              onClick={() => setShowAttachMenu(false)}
              className="p-1 text-[#78756E] hover:text-[#1C1B18] rounded-full hover:bg-black/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-xs font-semibold text-[#1C1B18] border border-black/5 transition-all text-left"
            >
              <ImageIcon className="w-4 h-4 text-[#2A4436]" />
              <span>Choose Photo</span>
            </button>

            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F6F4F0] hover:bg-[#ECE8E1] text-xs font-semibold text-[#1C1B18] border border-black/5 transition-all text-left"
            >
              <Camera className="w-4 h-4 text-[#2A4436]" />
              <span>Take Photo</span>
            </button>
          </div>

          <div className="pt-2 border-t border-black/5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78756E] block mb-1.5">
              Quick Sample Fixtures
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => handleSelectPresetPhoto('thermostat')}
                className="px-2.5 py-1 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[11px] font-medium text-[#3D3B36] border border-black/5 transition-colors"
              >
                🌡 Thermostat
              </button>
              <button
                onClick={() => handleSelectPresetPhoto('lock')}
                className="px-2.5 py-1 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[11px] font-medium text-[#3D3B36] border border-black/5 transition-colors"
              >
                🔑 Door Keypad
              </button>
              <button
                onClick={() => handleSelectPresetPhoto('coffee')}
                className="px-2.5 py-1 rounded-lg bg-[#F6F4F0] hover:bg-[#ECE8E1] text-[11px] font-medium text-[#3D3B36] border border-black/5 transition-colors"
              >
                ☕ Coffee Machine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Thumbnail Tag above input */}
      {attachedImage && (
        <div className="pointer-events-auto mb-2 flex items-center justify-between p-2 rounded-xl bg-white border border-[#2A4436]/30 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={attachedImage.url}
              alt="Preview"
              className="w-9 h-9 rounded-lg object-cover border border-black/10 shrink-0"
            />
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-[#1C1B18] truncate">{attachedImage.caption}</span>
              <span className="text-[10px] text-[#2A4436] font-medium">Photo attached for assistant</span>
            </div>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1.5 rounded-full text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5"
            title="Remove photo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* The Main Rounded Pill Composer (Matching reference) */}
      <div className="pointer-events-auto relative flex items-end gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-[28px] bg-white/95 backdrop-blur-2xl border border-black/10 shadow-composer transition-all">
        {/* Attachment '+' Button in soft beige circular circle */}
        {!isRecording && (
          <button
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#F4EFEA] hover:bg-[#EAE4DD] active:scale-95 text-[#3D3B36] transition-all shrink-0 ml-0.5"
            title="Attach photo or report"
            aria-label="Attach Photo"
          >
            <Plus className="w-5 h-5 stroke-[2.2]" />
          </button>
        )}

        {/* Dynamic Composer Body: Normal Text Input VS Active Recording Mode */}
        {isRecording ? (
          <div className="flex-1 flex items-center justify-between px-3 py-1">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold text-red-600">
                0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
              </span>
              {/* Dynamic Waveform Bars */}
              <div className="flex items-center gap-0.5 h-4 ml-2">
                {[0.4, 0.8, 1, 0.6, 0.9, 0.5, 0.7, 0.95, 0.6, 0.4].map((scale, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${Math.max(4, audioLevel * scale * 20)}px`,
                    }}
                    className="w-0.5 bg-red-500 rounded-full transition-all duration-75"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCancelRecording}
                className="p-1.5 rounded-full text-[#78756E] hover:text-red-500 hover:bg-black/5 transition-colors"
                title="Cancel voice message"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleStopAndSendRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2A4436] hover:bg-[#20362B] text-white text-xs font-semibold shadow-sm active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Textarea Field: Auto-wraps, max-h 4 lines, scrollable, submit on Enter */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={draftText}
              onChange={(e) => onDraftChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Anything..."
              disabled={disabled}
              className="flex-1 bg-transparent px-2.5 py-2 text-sm text-[#1C1B18] placeholder-[#8E8B82] focus:outline-none focus:ring-0 min-w-0 resize-none max-h-[96px] overflow-y-auto leading-relaxed my-auto"
            />

            {/* Right Action Controls Group (Perfect horizontal and vertical alignment) */}
            <div className="flex items-center gap-1 shrink-0 self-end mb-0.5">
              {/* Image photo picker button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5 active:scale-95 transition-all"
                title="Select photo"
                aria-label="Upload photo"
              >
                <ImageIcon className="w-[18px] h-[18px] stroke-[1.8]" />
              </button>

              {/* Mic / Waveform Audio Button */}
              <button
                onClick={handleStartRecording}
                className="flex items-center justify-center w-8 h-8 rounded-full text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5 active:scale-95 transition-all"
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
                disabled={(!draftText.trim() && !attachedImage) || disabled}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all shrink-0 ${
                  draftText.trim() || attachedImage
                    ? 'bg-[#2A4436] hover:bg-[#20362B] text-white shadow-sm active:scale-95 cursor-pointer'
                    : 'bg-[#2A4436]/80 text-white/70 cursor-not-allowed'
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
