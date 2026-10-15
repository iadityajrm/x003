import React, { useEffect, useRef, useState } from 'react';
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ChatMessage, PropertyData } from '../types';
import { speakText, stopSpeaking } from '../utils/speech';

interface ChatViewProps {
  messages: ChatMessage[];
  property: PropertyData;
  isTyping: boolean;
  onSendPrompt: (promptText: string) => void;
  onActionChipClick: (chip: { prompt: string; action?: string }) => void;
  onImageClick: (imageUrl: string) => void;
  onBackToHome: () => void;
  onClearChat: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  property,
  isTyping,
  onActionChipClick,
  onImageClick,
  onBackToHome,
  onClearChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 30);
    return () => clearTimeout(timer);
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleSpeech = (msg: ChatMessage) => {
    if (speakingMsgId === msg.id) {
      stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      stopSpeaking();
      setSpeakingMsgId(msg.id);
      speakText(
        msg.content,
        () => setSpeakingMsgId(msg.id),
        () => setSpeakingMsgId(null),
        () => setSpeakingMsgId(null)
      );
    }
  };

  const handleToggleAudioPlay = (msg: ChatMessage) => {
    if (!msg.audioUrl) return;

    if (playingAudioMsgId === msg.id) {
      audioPlayerRef.current?.pause();
      setPlayingAudioMsgId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(msg.audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setPlayingAudioMsgId(null);
      audio.onerror = () => setPlayingAudioMsgId(null);
      audio.play().catch(() => setPlayingAudioMsgId(null));
      setPlayingAudioMsgId(msg.id);
    }
  };

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      if (!line.trim()) {
        return <div key={lineIndex} className="h-2" />;
      }

      const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={partIndex} className="font-semibold text-[#1C1B18] dark:text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          const codeVal = part.slice(1, -1);
          return (
            <button
              key={partIndex}
              onClick={() => handleCopy(codeVal, `${lineIndex}-${partIndex}`)}
              className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-[#EBF2EC] dark:bg-[#2A4436]/40 hover:bg-[#DCEDE0] dark:hover:bg-[#2A4436]/60 border border-[#2A4436]/20 dark:border-[#78A88E]/30 text-[#2A4436] dark:text-[#78A88E] font-mono text-xs font-semibold cursor-pointer transition-colors active:scale-95"
              title="Click to copy"
            >
              <span>{codeVal}</span>
              {copiedId === `${lineIndex}-${partIndex}` ? (
                <Check className="w-3 h-3 text-[#2A4436] dark:text-[#78A88E] inline" />
              ) : (
                <Copy className="w-3 h-3 text-[#2A4436]/70 dark:text-[#78A88E]/70 inline" />
              )}
            </button>
          );
        }
        return part;
      });

      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-0.5 text-[#3D3B36] dark:text-neutral-200">
            <span className="text-[#2A4436] dark:text-[#78A88E] mt-1 select-none text-xs">●</span>
            <div className="flex-1">{formattedLine.slice(1)}</div>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)/);
        if (match) {
          return (
            <div key={lineIndex} className="flex items-start gap-2 my-1 text-[#3D3B36] dark:text-neutral-200">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#EBF2EC] dark:bg-[#2A4436]/40 text-[#2A4436] dark:text-[#78A88E] font-bold text-[10px] mt-0.5 shrink-0 select-none">
                {match[1]}
              </span>
              <div className="flex-1">{formattedLine}</div>
            </div>
          );
        }
      }

      return (
        <p key={lineIndex} className="my-1 leading-relaxed text-[#3D3B36] dark:text-neutral-200">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <div className="relative flex-1 flex flex-col w-full max-w-md mx-auto px-4 pb-36 pt-1 animate-screen-in">
      {/* Chat Actions Sub-Bar */}
      <div className="flex items-center justify-between py-2 mb-2 border-b border-black/5 dark:border-white/10">
        <span className="text-[11px] font-medium text-[#78756E] dark:text-neutral-400">
          Direct conversation with {property.name} AI Concierge
        </span>

        <button
          onClick={onClearChat}
          className="flex items-center gap-1 text-[11px] font-medium text-[#78756E] dark:text-neutral-400 hover:text-[#1C1B18] dark:hover:text-white transition-colors px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 border border-black/5 dark:border-white/10 shadow-soft-sm active:scale-95 cursor-pointer"
          title="Start fresh conversation"
        >
          <RefreshCw className="w-3 h-3 text-[#78756E] dark:text-neutral-400" />
          <span>Clear chat</span>
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 flex flex-col gap-3">
        {messages.map((msg, index) => {
          const isGuest = msg.sender === 'guest';
          const prevMsg = index > 0 ? messages[index - 1] : null;

          // Instagram-like central timestamp divider if first message or if time gap > 15 mins (or timestamps differ noticeably)
          const showCentralTimestamp = !prevMsg || prevMsg.timestamp !== msg.timestamp;

          return (
            <React.Fragment key={msg.id}>
              {showCentralTimestamp && (
                <div className="flex items-center justify-center my-2 select-none">
                  <span className="text-[10px] font-semibold tracking-wider text-[#78756E]/80 dark:text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full uppercase">
                    {msg.timestamp}
                  </span>
                </div>
              )}

              <div
                className={`flex flex-col ${isGuest ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                {/* Sender label (no per-message timestamp) */}
                <div className="flex items-center gap-1.5 px-1 mb-1 text-[11px] text-[#78756E] dark:text-neutral-400">
                  {!isGuest ? (
                    <span className="font-semibold text-[#2A4436] dark:text-[#78A88E]">Assistant</span>
                  ) : (
                    <span className="font-medium text-[#5C5A55] dark:text-neutral-400">You</span>
                  )}
                </div>

                {/* Message Bubble Container */}
                <div className="flex items-start gap-2 max-w-[92%] sm:max-w-[88%]">
                  {!isGuest && (
                    <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-0.5 shadow-sm border border-emerald-500/30 ring-1 ring-emerald-400/20">
                      <img
                        src="/aspfp.png"
                        alt="Assistant"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to stylized sparkle if image missing
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                <div
                  className={`relative rounded-[22px] p-4 text-xs sm:text-sm shadow-soft-card transition-all ${
                    isGuest
                      ? 'bg-[#2A4436] text-white rounded-tr-sm'
                      : 'bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 text-[#1C1B18] dark:text-neutral-100 rounded-tl-sm'
                  }`}
                >
                  {/* Attached Image inside bubble */}
                  {msg.imageUrl && (
                    <div className="mb-2.5 overflow-hidden rounded-xl border border-black/5 dark:border-white/10 group cursor-pointer" onClick={() => onImageClick(msg.imageUrl!)}>
                      <img
                        src={msg.imageUrl}
                        alt={msg.imageCaption || 'Attached photo'}
                        className="w-full max-h-56 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      {msg.imageCaption && (
                        <div className="p-1.5 bg-black/40 text-[11px] text-white truncate">
                          📷 {msg.imageCaption}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audio message player */}
                  {msg.audioUrl && (
                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border mb-2 min-w-[200px] ${
                      isGuest ? 'bg-black/15 border-white/20' : 'bg-[#F6F4F0] dark:bg-white/10 border-black/5 dark:border-white/10'
                    }`}>
                      <button
                        onClick={() => handleToggleAudioPlay(msg)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors cursor-pointer ${
                          isGuest ? 'bg-white/20 hover:bg-white/30 text-white' : 'bg-[#2A4436] text-white'
                        }`}
                      >
                        {playingAudioMsgId === msg.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className={isGuest ? 'text-white' : 'text-[#1C1B18] dark:text-white'}>Voice note</span>
                          <span className={isGuest ? 'text-white/80' : 'text-[#78756E] dark:text-neutral-400'}>
                            {msg.audioDuration ? `0:0${msg.audioDuration}` : 'Audio'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 h-3">
                          {[40, 70, 90, 60, 30, 80, 100, 50, 75, 45, 85, 30, 65, 95, 40].map((h, i) => (
                            <div
                              key={i}
                              style={{ height: `${h}%` }}
                              className={`flex-1 rounded-full ${
                                isGuest 
                                   ? (playingAudioMsgId === msg.id ? 'bg-white animate-pulse' : 'bg-white/40')
                                   : (playingAudioMsgId === msg.id ? 'bg-[#2A4436] animate-pulse' : 'bg-black/20 dark:bg-white/30')
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text Message Content */}
                  {msg.content && (
                    <div className="space-y-1">
                      {isGuest ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        renderFormattedContent(msg.content)
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Chips underneath Assistant messages */}
              {!isGuest && msg.actionChips && msg.actionChips.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap mt-2 pl-9">
                  {msg.actionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionChipClick(chip)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1D1A] hover:bg-[#F6F4F0] dark:hover:bg-white/10 text-[11px] font-semibold text-[#2A4436] dark:text-[#78A88E] border border-black/10 dark:border-white/10 shadow-soft-sm transition-all active:scale-95 text-left cursor-pointer"
                    >
                      <span>{chip.label}</span>
                      <ChevronRight className="w-3 h-3 text-[#2A4436]/60 dark:text-[#78A88E]/60" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

        {/* Loading / Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2.5 animate-fade-in pl-1">
            <div className="rounded-[20px] rounded-tl-sm px-4 py-3 bg-white dark:bg-[#1E1D1A] border border-black/5 dark:border-white/10 flex items-center shadow-soft-card">
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full bg-[#2A4436] dark:bg-[#78A88E] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#2A4436] dark:bg-[#78A88E] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-[#2A4436] dark:bg-[#78A88E] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2 shrink-0 pointer-events-none" />
      </div>
    </div>
  );
};
