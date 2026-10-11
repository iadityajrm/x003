import React, { useState } from 'react';
import { 
  Check, 
  X, 
  ArrowRight, 
  HelpCircle, 
  Users, 
  Trophy, 
  RotateCcw,
  Sparkles,
  Heart
} from 'lucide-react';
import { 
  Player, 
  NEVER_HAVE_I_EVER_PROMPTS_BY_INTENSITY, 
  INTENSITY_INFO, 
  GLOW_PALETTES 
} from '../../data/games';
import { IntensityLevel } from '../../types';

interface NeverHaveIEverGameProps {
  initialPlayers: Player[];
  initialIntensity?: IntensityLevel;
  onBackToLobby: () => void;
  onOpenRules: () => void;
  onEditPlayers: () => void;
}

export const NeverHaveIEverGame: React.FC<NeverHaveIEverGameProps> = ({
  initialPlayers,
  initialIntensity = 'casual',
  onBackToLobby,
  onOpenRules,
  onEditPlayers,
}) => {
  const [intensity, setIntensity] = useState<IntensityLevel>(initialIntensity);
  const [players, setPlayers] = useState<Player[]>(() =>
    initialPlayers.map(p => ({ ...p, lives: 5 }))
  );
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [glowIndex, setGlowIndex] = useState(0);
  
  // Game Steps: 'privacy-pass' | 'voting' | 'reveal' | 'finished'
  const [step, setStep] = useState<'privacy-pass' | 'voting' | 'reveal' | 'finished'>('privacy-pass');
  const [currentPlayerVotingIndex, setCurrentPlayerVotingIndex] = useState(0);
  const [currentRoundAnswers, setCurrentRoundAnswers] = useState<Record<string, 'have' | 'never'>>({});

  const promptPool = NEVER_HAVE_I_EVER_PROMPTS_BY_INTENSITY[intensity];
  const currentStatement = promptPool[currentPromptIndex % promptPool.length];
  const activeVotingPlayer = players[currentPlayerVotingIndex] || players[0];

  const handleIntensityChange = (lvl: IntensityLevel) => {
    setIntensity(lvl);
    setCurrentPromptIndex(0);
    setGlowIndex(prev => (prev + 1) % GLOW_PALETTES.length);
  };

  const handleVote = (answer: 'have' | 'never') => {
    const updatedAnswers = {
      ...currentRoundAnswers,
      [activeVotingPlayer.id]: answer,
    };
    setCurrentRoundAnswers(updatedAnswers);

    if (currentPlayerVotingIndex + 1 < players.length) {
      setCurrentPlayerVotingIndex(prev => prev + 1);
      setStep('privacy-pass');
    } else {
      // Deduct 1 life for 'have' votes
      setPlayers(prevPlayers =>
        prevPlayers.map(p => {
          const ans = updatedAnswers[p.id];
          if (ans === 'have') {
            return { ...p, lives: Math.max(0, p.lives - 1) };
          }
          return p;
        })
      );
      setStep('reveal');
    }
  };

  const handleNextStatement = () => {
    const alivePlayers = players.filter(p => p.lives > 0);
    if (alivePlayers.length <= 1 && players.length > 1) {
      setStep('finished');
      return;
    }

    setCurrentPromptIndex(prev => (prev + 1) % promptPool.length);
    setGlowIndex(prev => (prev + 1) % GLOW_PALETTES.length);
    setRoundNumber(r => r + 1);
    setCurrentPlayerVotingIndex(0);
    setCurrentRoundAnswers({});
    setStep('privacy-pass');
  };

  const handleRestart = () => {
    setPlayers(initialPlayers.map(p => ({ ...p, lives: 5 })));
    setRoundNumber(1);
    setCurrentPromptIndex(0);
    setCurrentPlayerVotingIndex(0);
    setCurrentRoundAnswers({});
    setGlowIndex(0);
    setStep('privacy-pass');
  };

  const aliveCount = players.filter(p => p.lives > 0).length;
  const haveCount = Object.values(currentRoundAnswers).filter(a => a === 'have').length;
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
          <span className="px-3 py-1 rounded-full bg-[#F4EFE6] text-[#7A684D] text-xs font-bold font-mono uppercase tracking-wider">
            Round {roundNumber}
          </span>
          <span className="text-xs text-[#78756E]">Never Have I Ever</span>
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

      {/* Players Life Tokens Strip */}
      <div className="relative z-10 flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
        {players.map((p, idx) => {
          const isCurrentVoting = step === 'voting' && idx === currentPlayerVotingIndex;
          const isOut = p.lives === 0;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl whitespace-nowrap text-xs transition-all ${
                isOut
                  ? 'bg-black/5 text-black/40 line-through'
                  : isCurrentVoting
                  ? 'bg-[#2A4436] text-white shadow-sm font-bold scale-105'
                  : 'bg-white/80 text-[#1C1B18] border border-black/5'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{p.name}</span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-3 h-3 ${
                        i < p.lives
                          ? isCurrentVoting
                            ? 'text-rose-300 fill-rose-300'
                            : 'text-rose-500 fill-rose-500'
                          : 'text-black/15'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STEP 1: Privacy Pass Phone */}
      {step === 'privacy-pass' && (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8 animate-slide-up">
          <div className="p-6 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl w-full max-w-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#F4EFE6] text-[#7A684D] font-serif text-2xl font-bold mx-auto flex items-center justify-center shadow-soft-sm">
              {activeVotingPlayer.name.charAt(0).toUpperCase()}
            </div>

            <span className="text-[11px] font-bold text-[#78756E] uppercase tracking-wider block">
              Player {currentPlayerVotingIndex + 1} of {players.length}
            </span>

            <h3 className="font-serif text-2xl font-bold text-[#1C1B18]">
              Pass to {activeVotingPlayer.name}
            </h3>

            <p className="text-xs text-[#78756E] leading-relaxed">
              Take the phone privately to cast your honest secret vote!
            </p>

            <button
              onClick={() => setStep('voting')}
              className="w-full mt-2 flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
            >
              <span>I Have the Phone</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Private Voting */}
      {step === 'voting' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 py-2 animate-slide-up">
          {/* Statement Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#2A4436]">
              {activeVotingPlayer.name}&apos;s Secret Turn
            </span>
            <span className="text-xs text-[#78756E]">
              {activeVotingPlayer.lives} lives remaining
            </span>
          </div>

          {/* Statement Card with Glowing Background */}
          <div className="p-6 sm:p-8 rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl flex flex-col items-center justify-center text-center my-auto min-h-[200px]">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-[#7A684D]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#78756E]">
                {intensityDetails.emoji} {intensityDetails.label} Statement
              </span>
            </div>
            <p className="font-serif text-xl sm:text-2xl font-bold text-[#1C1B18] leading-relaxed">
              &ldquo;{currentStatement}&rdquo;
            </p>
          </div>

          {/* Two Large Voting Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleVote('have')}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white/90 hover:bg-white border-2 border-rose-200 hover:border-rose-500 shadow-soft-card active:scale-[0.98] transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm text-[#1C1B18]">I HAVE</span>
              <span className="text-[10px] text-rose-600 font-semibold">-1 Life</span>
            </button>

            <button
              onClick={() => handleVote('never')}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl bg-white/90 hover:bg-white border-2 border-[#2A4436]/20 hover:border-[#2A4436] shadow-soft-card active:scale-[0.98] transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center group-hover:scale-105 transition-transform">
                <X className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm text-[#1C1B18]">NEVER</span>
              <span className="text-[10px] text-[#2A4436] font-semibold">Safe (0 loss)</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Reveal and React */}
      {step === 'reveal' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between space-y-4 py-2 animate-slide-up">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78756E]">
              Group Results
            </span>
            <h3 className="font-serif text-xl font-bold text-[#1C1B18]">
              {haveCount === 0 ? 'Nobody has done this! 😇' : `${haveCount} player${haveCount > 1 ? 's' : ''} have done this!`}
            </h3>
          </div>

          {/* Statement Reminder */}
          <div className="p-4 rounded-2xl bg-white/90 border border-black/5 text-center text-xs text-[#5C5A55] font-serif italic">
            &ldquo;{currentStatement}&rdquo;
          </div>

          {/* Player Responses Grid */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
            {players.map((p) => {
              const ans = currentRoundAnswers[p.id];
              const isHave = ans === 'have';
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/95 border border-black/5 shadow-soft-sm text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-[10px]">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#1C1B18]">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                      isHave ? 'bg-rose-100 text-rose-700' : 'bg-[#EBF2EC] text-[#2A4436]'
                    }`}>
                      {isHave ? 'I Have 🙋' : 'Never 🙅'}
                    </span>
                    <span className="text-[11px] text-[#78756E] font-mono">
                      {p.lives} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextStatement}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Next Statement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 4: Game Finished / Winner Screen */}
      {step === 'finished' && (
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8 animate-slide-up">
          <div className="w-16 h-16 rounded-3xl bg-[#F4EFE6] text-[#7A684D] flex items-center justify-center shadow-soft-md">
            <Trophy className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-3xl font-bold text-[#1C1B18]">
            Game Finished!
          </h2>

          <p className="text-xs text-[#5C5A55] max-w-xs">
            {aliveCount === 1
              ? `Congratulations to ${players.find(p => p.lives > 0)?.name} for surviving with tokens remaining!`
              : 'Great game everyone! Hope you learned some surprising cabin stories.'}
          </p>

          <div className="w-full space-y-2 pt-2">
            <button
              onClick={handleRestart}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] text-white font-bold text-xs shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again (Reset 5 Lives)</span>
            </button>

            <button
              onClick={onBackToLobby}
              className="w-full p-3 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#5C5A55] font-semibold text-xs border border-black/5"
            >
              Back to Games Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
