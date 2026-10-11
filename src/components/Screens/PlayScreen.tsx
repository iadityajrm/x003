import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  Hand, 
  Plus, 
  Trash2, 
  Shuffle, 
  ArrowUp, 
  ArrowDown, 
  ArrowRight, 
  HelpCircle,
  Play
} from 'lucide-react';
import { Player, DEFAULT_PLAYERS, AVATAR_COLORS, GAME_RULES, INTENSITY_INFO } from '../../data/games';
import { IntensityLevel } from '../../types';
import { TruthOrDareGame } from '../Play/TruthOrDareGame';
import { NeverHaveIEverGame } from '../Play/NeverHaveIEverGame';
import { ScreenHeader } from './ScreenHeader';

interface PlayScreenProps {
  propertyName: string;
  onBack: () => void;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({
  propertyName,
  onBack,
}) => {
  const [selectedGame, setSelectedGame] = useState<'truthOrDare' | 'neverHaveIEver'>('truthOrDare');
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel>('casual');
  const [gameMode, setGameMode] = useState<'lobby' | 'playing'>('lobby');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  // Player roster
  const [players, setPlayers] = useState<Player[]>(() =>
    DEFAULT_PLAYERS.map((name, i) => ({
      id: 'p-' + i,
      name,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
      lives: 5,
      score: 0,
    }))
  );

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    const newPlayer: Player = {
      id: 'p-' + Date.now(),
      name: trimmed,
      avatarColor: AVATAR_COLORS[players.length % AVATAR_COLORS.length],
      lives: 5,
      score: 0,
    };
    setPlayers(prev => [...prev, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleMovePlayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;

    const newPlayers = [...players];
    const temp = newPlayers[index];
    newPlayers[index] = newPlayers[targetIndex];
    newPlayers[targetIndex] = temp;
    setPlayers(newPlayers);
  };

  const handleShufflePlayers = () => {
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    setPlayers(shuffled);
  };

  const handleStartGame = () => {
    if (players.length < 2) return;
    setGameMode('playing');
  };

  const activeRules = GAME_RULES[selectedGame];

  return (
    <div className="flex-1 flex flex-col w-full max-w-md mx-auto animate-screen-in pb-32">
      {/* Top Header when in lobby */}
      {gameMode === 'lobby' && (
        <ScreenHeader
          title="Cabin Play & Games"
          subtitle={`${propertyName} Party Games`}
          onBack={onBack}
        />
      )}

      {/* LOBBY VIEW */}
      {gameMode === 'lobby' && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* 1. Choose Game */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#78756E]">
                1. Choose Game
              </span>
              <button
                onClick={() => setShowRulesModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-[#2A4436] hover:underline"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How to play</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Game 1: Truth or Dare */}
              <button
                onClick={() => setSelectedGame('truthOrDare')}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[135px] ${
                  selectedGame === 'truthOrDare'
                    ? 'bg-white border-[#2A4436] shadow-soft-card ring-2 ring-[#2A4436]/10'
                    : 'bg-white/80 hover:bg-white border-black/5 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF2EC] text-[#2A4436] flex items-center justify-center mb-2">
                  <Flame className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1C1B18]">Truth or Dare</h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5 leading-snug">
                    Rotating turn. Glowing animated cards.
                  </p>
                </div>
                {selectedGame === 'truthOrDare' && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#2A4436]" />
                )}
              </button>

              {/* Game 2: Never Have I Ever */}
              <button
                onClick={() => setSelectedGame('neverHaveIEver')}
                className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between min-h-[135px] ${
                  selectedGame === 'neverHaveIEver'
                    ? 'bg-white border-[#7A684D] shadow-soft-card ring-2 ring-[#7A684D]/10'
                    : 'bg-white/80 hover:bg-white border-black/5 opacity-80'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#7A684D] flex items-center justify-center mb-2">
                  <Hand className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-[#1C1B18]">Never Have I Ever</h3>
                  <p className="text-[11px] text-[#78756E] mt-0.5 leading-snug">
                    Secret voting & group reveal with 5 tokens.
                  </p>
                </div>
                {selectedGame === 'neverHaveIEver' && (
                  <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[#7A684D]" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Choose Intensity Level */}
          <div className="p-4 rounded-2xl bg-white border border-black/5 shadow-soft-card space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78756E] block">
              2. Select Intensity Level
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(INTENSITY_INFO) as IntensityLevel[]).map((lvl) => {
                const info = INTENSITY_INFO[lvl];
                const isSelected = selectedIntensity === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedIntensity(lvl)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? `${info.bg} ${info.color} border-current shadow-sm font-bold scale-[1.02]`
                        : 'bg-[#F6F4F0] text-[#5C5A55] border-black/5 hover:bg-[#ECE8E1]'
                    }`}
                  >
                    <span className="text-base">{info.emoji}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Players Setup Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-black/5 shadow-soft-card space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1C1B18]">3. Players Roster</h3>
                <p className="text-xs text-[#78756E]">
                  {players.length} players · Turn rotates in order
                </p>
              </div>

              <button
                onClick={handleShufflePlayers}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F6F4F0] hover:bg-[#ECE8E1] text-xs font-semibold text-[#5C5A55] transition-colors"
                title="Randomize turn order"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Shuffle</span>
              </button>
            </div>

            {/* Player List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F6F4F0] border border-black/5 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#78756E] w-4">{idx + 1}.</span>
                    <div className="w-6 h-6 rounded-full bg-[#2A4436] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-[#1C1B18] truncate">{p.name}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMovePlayer(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 text-[#78756E] hover:text-[#1C1B18] disabled:opacity-30"
                      title="Move turn earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovePlayer(idx, 'down')}
                      disabled={idx === players.length - 1}
                      className="p-1.5 text-[#78756E] hover:text-[#1C1B18] disabled:opacity-30"
                      title="Move turn later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      disabled={players.length <= 2}
                      className="p-1.5 text-[#78756E] hover:text-red-600 disabled:opacity-30 ml-1"
                      title="Remove player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Player Input */}
            <form onSubmit={handleAddPlayer} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name..."
                className="flex-1 bg-[#F6F4F0] border border-black/10 rounded-xl px-3.5 py-2.5 text-xs text-[#1C1B18] focus:outline-none focus:border-[#2A4436]"
                maxLength={18}
              />
              <button
                type="submit"
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-[#2A4436] hover:bg-[#20362B] disabled:opacity-40 text-white font-semibold text-xs transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Start Game Action Button */}
          <div className="pt-2">
            <button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#2A4436] hover:bg-[#20362B] disabled:opacity-40 text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                Start {selectedGame === 'truthOrDare' ? 'Truth or Dare' : 'Never Have I Ever'} ({INTENSITY_INFO[selectedIntensity].label})
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE GAME VIEW: TRUTH OR DARE */}
      {gameMode === 'playing' && selectedGame === 'truthOrDare' && (
        <TruthOrDareGame
          players={players}
          initialIntensity={selectedIntensity}
          onBackToLobby={() => setGameMode('lobby')}
          onOpenRules={() => setShowRulesModal(true)}
          onEditPlayers={() => setGameMode('lobby')}
        />
      )}

      {/* ACTIVE GAME VIEW: NEVER HAVE I EVER */}
      {gameMode === 'playing' && selectedGame === 'neverHaveIEver' && (
        <NeverHaveIEverGame
          initialPlayers={players}
          initialIntensity={selectedIntensity}
          onBackToLobby={() => setGameMode('lobby')}
          onOpenRules={() => setShowRulesModal(true)}
          onEditPlayers={() => setGameMode('lobby')}
        />
      )}

      {/* Embedded Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-black/10 space-y-3.5 max-h-[85vh] overflow-y-auto text-left safe-bottom">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">📖</span>
                <h3 className="font-serif text-xl font-bold text-[#1C1B18]">{activeRules.title}</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-full text-[#78756E] hover:text-[#1C1B18] hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5C5A55] font-medium">{activeRules.tagline}</p>

            <div className="space-y-2.5 text-xs text-[#3D3B36] pt-1">
              {activeRules.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#EBF2EC] text-[#2A4436] font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span 
                    className="leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: step.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-3 rounded-xl bg-[#2A4436] text-white font-bold text-xs shadow-sm hover:bg-[#20362B] transition-colors"
              >
                Got it · Back to Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
