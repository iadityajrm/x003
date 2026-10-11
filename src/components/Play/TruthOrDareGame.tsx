import React, { useState } from 'react';
import { 
  Flame, 
  MessageCircle, 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Users, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { 
  Player, 
  TRUTH_PROMPTS_BY_INTENSITY, 
  DARE_PROMPTS_BY_INTENSITY, 
  INTENSITY_INFO, 
  GLOW_PALETTES 
} from '../../data/games';
import { IntensityLevel } from '../../types';

interface TruthOrDareGameProps {
  players: Player[];
  initialIntensity?: IntensityLevel;
  onBackToLobby: () => void;
  onOpenRules: () => void;
  onEditPlayers: () => void;
}

export const TruthOrDareGame: React.FC<TruthOrDareGameProps> = ({
  players,
  initialIntensity = 'casual',
  onBackToLobby,
  onOpenRules,
  onEditPlayers,
}) => {
  const [intensity, setIntensity] = useState<IntensityLevel>(initialIntensity);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [step, setStep] = useState<'choice' | 'prompt' | 'pass'>('choice');
  const [selectedType, setSelectedType] = useState<'truth' | 'dare' | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [glowIndex, setGlowIndex] = useState(0);
  const [usedPrompts, setUsedPrompts] = useState<{ truth: string[]; dare: string[] }>({
    truth: [],
    dare: [],
  });
  const [justCompletedAction, setJustCompletedAction] = useState<string | null>(null);

  const activePlayer = players[activePlayerIndex] || players[0];

  const getRandomPrompt = (type: 'truth' | 'dare', lvl: IntensityLevel): string => {
    const pool = type === 'truth' ? TRUTH_PROMPTS_BY_INTENSITY[lvl] : DARE_PROMPTS_BY_INTENSITY[lvl];
    const used = usedPrompts[type];
    const available = pool.filter(p => !used.includes(p));

    // Cycle the background glow color index smoothly
    setGlowIndex(prev => (prev + 1) % GLOW_PALETTES.length);

    if (available.length === 0) {
      const rand = pool[Math.floor(Math.random() * pool.length)];
      setUsedPrompts(prev => ({ ...prev, [type]: [rand] }));
      return rand;
    }

    const rand = available[Math.floor(Math.random() * available.length)];
    setUsedPrompts(prev => ({ ...prev, [type]: [...prev[type], rand] }));
    return rand;
  };

  const handleSelectChoice = (type: 'truth' | 'dare') => {
    setSelectedType(type);
    setCurrentPrompt(getRandomPrompt(type, intensity));
    setStep('prompt');
  };

  const handleRerollPrompt = () => {
    if (!selectedType) return;
    setCurrentPrompt(getRandomPrompt(selectedType, intensity));
  };

  const handleNextTurn = (actionType: 'done' | 'skip') => {
    setJustCompletedAction(actionType === 'done' ? 'Completed! 👏' : 'Skipped (No pressure!)');
    
    const nextIndex = (activePlayerIndex + 1) % players.length;
    if (nextIndex === 0) {
      setRoundNumber(r => r + 1);
    }
    setActivePlayerIndex(nextIndex);
    setSelectedType(null);
    setCurrentPrompt('');
    setStep('pass');
  };

  const handleReadyForNextPlayer = () => {
    setJustCompletedAction(null);
    setStep('choice');
  };

  const handleIntensityChange = (lvl: IntensityLevel) => {
    setIntensity(lvl);
    if (selectedType && step === 'prompt') {
      setCurrentPrompt(getRandomPrompt(selectedType, lvl));
    }
  };

  const nextPlayer = players[activePlayerIndex];
  const intensityDetails = INTENSITY_INFO[intensity];

  return (
    <div className="relative flex flex-col flex-1 w-full max-w-md mx-auto p-4 sm:p-5 space-y-4 animate-fade-in text-[#1C1B18] overflow-hidden">
      {/* Dynamic Animated Gradient Glow Background */}
      <div 
        className="pointer-events-none absolute inset-0 transition-all duration-1000 ease-out opacity-80"
        style={{
          background: GLOW_PALETTES[glowIndex],
        }}
      />

      {/* Top Game Bar */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-black/5">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#EBF2EC] text-[#2A4436] text-xs font-bold font-mono uppercase tracking-wider">
            Round {roundNumber}
          </span>
          <span className="text-xs text-[#78756E]">Truth or Dare</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenRules}
            className="p-2 rounded-full hover:bg-black/5 text-[#78756E] hover:text-[#1C1B18] transition-colors"
            title="Rules"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onEditPlayers}
            className="p-2 rounded-full hover:bg-black/5 text-[#78756E] hover:text-[#1C1B18] transition-colors"
            title="Players roster"
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={onBackToLobby}
            className="px-3 py-1.5 rounded-full hover:bg-black/5 text-[#78756E] hover:text-[#1C1B18] transition-colors text-xs font-semibold"
            title="Exit game"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Intensity Selector Level Bar */}
      <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(INTENSITY_INFO) as IntensityLevel[]).map((lvl) => {
          const info = INTENSITY_INFO[lvl];
          const isSelected = intensity === lvl;
          return (
            <button
              key={lvl}
              onClick={() => handleIntensityChange(lvl)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? `${info.bg} ${info.color} border ${info.border} shadow-sm font-bold scale-105`
                  : 'bg-white/80 text-[#5C5A55] border border-black/5 hover:bg-white'
              }`}
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Turn Order Avatars Strip */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {players.map((p, idx) => {
          const isActive = idx === activePlayerIndex;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-xs transition-all ${
                isActive
                  ? 'bg-[#2A4436] text-white shadow-sm font-bold scale-105'
                  : 'bg-white/80 text-[#5C5A55] border border-black/5'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-[#1C1B18]'
              }`}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span>{p.name}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Choice Step (Truth or Dare) */}
      {step === 'choice' && (
        <div className="relative z-10 flex-1 flex flex-col justify-center space-y-4 py-4 animate-slide-up">
          {/* Active Player Callout */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EBF2EC] text-[#2A4436] font-serif text-2xl font-bold mb-1 shadow-soft-sm">
              {activePlayer.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1B18]">
              {activePlayer.name}&apos;s Turn
            </h2>
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#5C5A55]">
              <span>Intensity:</span>
              <span className={`font-semibold ${intensityDetails.color}`}>{intensityDetails.emoji} {intensityDetails.label}</span>
            </div>
          </div>

          {/* Two Large Bold Choice Cards */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            {/* TRUTH CARD */}
            <button
              onClick={() => handleSelectChoice('truth')}
              className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-white border-2 border-black/5 hover:border-[#2A4436] shadow-soft-card text-left transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MessageCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#1C1B18] group-hover:text-[#2A4436] transition-colors">
                    Truth
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EBF2EC] text-[#2A4436]">
                    Answer
                  </span>
                </div>
                <p className="text-xs text-[#78756E] mt-0.5">
                  Answer an honest, {intensityDetails.label.toLowerCase()} question.
                </p>
              </div>
            </button>

            {/* DARE CARD */}
            <button
              onClick={() => handleSelectChoice('dare')}
              className="group relative flex items-center gap-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-white border-2 border-black/5 hover:border-[#9E5A3F] shadow-soft-card text-left transition-all active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F7EBE4] text-[#9E5A3F] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-[#1C1B18] group-hover:text-[#9E5A3F] transition-colors">
                    Dare
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F7EBE4] text-[#9E5A3F]">
                    Challenge
                  </span>
                </div>
                <p className="text-xs text-[#78756E] mt-0.5">
                  Take on a playful, safe {intensityDetails.label.toLowerCase()} challenge.
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Prompt Card Display */}
      {step === 'prompt' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 py-2 animate-slide-up">
          {/* Header Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedType === 'truth'
                  ? 'bg-[#EBF2EC] text-[#2A4436]'
                  : 'bg-[#F7EBE4] text-[#9E5A3F]'
              }`}>
                {selectedType === 'truth' ? '💬 Truth' : '🔥 Dare'}
              </span>
              <span className="text-xs font-bold text-[#1C1B18]">for {activePlayer.name}</span>
            </div>

            <button
              onClick={handleRerollPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF8F5] border border-black/5 text-xs text-[#78756E] hover:text-[#1C1B18] shadow-soft-sm transition-all"
              title="Get a different prompt"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Swap card</span>
            </button>
          </div>

          {/* Main Glowing Prompt Card */}
          <div className="relative p-6 sm:p-8 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl flex flex-col items-center justify-center text-center my-auto min-h-[220px] transition-all">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-[#9E5A3F]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#78756E]">
                {intensityDetails.emoji} {intensityDetails.label} {selectedType === 'truth' ? 'Truth' : 'Dare'}
              </span>
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1B18] leading-relaxed">
              &ldquo;{currentPrompt}&rdquo;
            </p>
          </div>

          {/* Action Buttons: Done, Skip */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleNextTurn('done')}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] active:scale-[0.98] text-white font-bold text-sm shadow-sm transition-all"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Completed · Next Player</span>
            </button>

            <button
              onClick={() => handleNextTurn('skip')}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/80 hover:bg-white text-[#5C5A55] hover:text-[#1C1B18] text-xs font-semibold border border-black/5 transition-all"
            >
              <span>Skip (Pass without penalty)</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Pass Phone Transition Step */}
      {step === 'pass' && (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8 animate-slide-up">
          {justCompletedAction && (
            <span className="px-3.5 py-1 rounded-full bg-[#EBF2EC] text-[#2A4436] text-xs font-bold">
              {justCompletedAction}
            </span>
          )}

          <div className="p-6 rounded-[26px] bg-white border border-black/5 shadow-soft-card w-full max-w-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F4EFE6] text-[#7A684D] font-serif text-2xl font-bold mx-auto flex items-center justify-center shadow-soft-sm">
              {nextPlayer.name.charAt(0).toUpperCase()}
            </div>
            
            <h3 className="font-serif text-2xl font-bold text-[#1C1B18]">
              Pass to {nextPlayer.name}
            </h3>
            
            <p className="text-xs text-[#78756E] leading-relaxed">
              Hand the phone to {nextPlayer.name} when they are ready for their turn!
            </p>

            <button
              onClick={handleReadyForNextPlayer}
              className="w-full mt-2 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <span>I&apos;m Ready!</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
