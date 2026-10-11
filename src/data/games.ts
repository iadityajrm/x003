import { IntensityLevel } from '../types';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  lives: number; // for Never Have I Ever (default 5)
  score: number;
}

export const DEFAULT_PLAYERS: string[] = ['Alex', 'Jordan', 'Taylor', 'Sam'];

export const AVATAR_COLORS = [
  'bg-[#2A4436] text-white',
  'bg-[#9E5A3F] text-white',
  'bg-[#7A684D] text-white',
  'bg-[#3E5C76] text-white',
  'bg-[#588157] text-white',
  'bg-[#BC6C25] text-white',
  'bg-[#4A5568] text-white',
  'bg-[#6B705C] text-white',
];

export const INTENSITY_INFO: Record<IntensityLevel, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  casual: {
    label: 'Casual',
    emoji: '☕',
    color: 'text-[#2A4436]',
    bg: 'bg-[#EBF2EC]',
    border: 'border-[#2A4436]/20',
  },
  interesting: {
    label: 'Interesting',
    emoji: '✨',
    color: 'text-[#3E5C76]',
    bg: 'bg-[#EBF3F8]',
    border: 'border-[#3E5C76]/20',
  },
  embarrassing: {
    label: 'Embarrassing',
    emoji: '🙈',
    color: 'text-[#9E5A3F]',
    bg: 'bg-[#F7EBE4]',
    border: 'border-[#9E5A3F]/20',
  },
  spicy: {
    label: 'Spicy',
    emoji: '🌶️',
    color: 'text-[#C53030]',
    bg: 'bg-[#FDE8E8]',
    border: 'border-[#C53030]/20',
  },
};

export const GLOW_PALETTES = [
  'radial-gradient(circle at center, rgba(42, 68, 54, 0.35) 0%, rgba(42, 68, 54, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(158, 90, 63, 0.35) 0%, rgba(158, 90, 63, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(62, 92, 118, 0.35) 0%, rgba(62, 92, 118, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(197, 48, 48, 0.35) 0%, rgba(197, 48, 48, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(188, 108, 37, 0.35) 0%, rgba(188, 108, 37, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(109, 40, 217, 0.32) 0%, rgba(109, 40, 217, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(13, 148, 136, 0.32) 0%, rgba(13, 148, 136, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
  'radial-gradient(circle at center, rgba(217, 119, 6, 0.32) 0%, rgba(217, 119, 6, 0.08) 45%, rgba(246, 244, 240, 0) 70%)',
];

export const TRUTH_PROMPTS_BY_INTENSITY: Record<IntensityLevel, string[]> = {
  casual: [
    'What is one item you always overpack for trips but almost never end up using?',
    'What is your ultimate guilty pleasure TV show or movie to watch on a rainy vacation day?',
    'If you could teleport this entire property anywhere in the world right now, where would you place it?',
    'What is the most memorable road trip snack or gas-station treat you always buy?',
    'What is a song you will passionately sing along with whenever it plays?',
    'What is your favorite comfort food to make or order when relaxing on holiday?',
    'Which fictional house or movie setting would you most like to spend a long weekend at?',
    'What is the best scenic spot or nature view you have ever visited?'
  ],
  interesting: [
    'What was your honest first impression of the person sitting to your left?',
    'If you could master any skill or hobby overnight with zero effort, what would it be?',
    'What is the most adventurous thing currently sitting on your bucket list?',
    'If you had to swap lives with someone in this room for 24 hours, who would it be and why?',
    'What is a belief or opinion you held strongly five years ago that you have completely changed your mind on?',
    'If you were given $1,000 to spend in the next 1 hour in this local town, how would you spend it?',
    'What is the most bizarre coincidence that has ever happened to you?',
    'What is a weird talent or useless trivia knowledge that you are secretly proud of?'
  ],
  embarrassing: [
    'What is the most ridiculous excuse you have ever invented just to cancel plans and stay home?',
    'What was your most awkward or cringe-worthy misunderstanding while traveling?',
    'What is the silliest thing you believed was true well into adulthood?',
    'What was your absolute worst fashion choice or hairstyle phase?',
    'Have you ever sent a text talking about someone to the exact person you were talking about?',
    'What is the most embarrassing thing in your search history or saved bookmarks right now?',
    'What is the funniest way you have ever accidentally injured yourself or made a fool of yourself in public?',
    'What was your most memorable panic moment when trying to parallel park or drive in a new city?'
  ],
  spicy: [
    'Who in this room would you trust least to keep a massive secret, and why?',
    'What is the most controversial opinion or hot take you hold about friendship or dating?',
    'Have you ever snooped through someone’s phone, room, or medicine cabinet while visiting?',
    'If you had to confess one petty lie you told someone in this group, what would it be?',
    'Who in this room would survive the shortest amount of time in a deserted cabin scenario?',
    'What is something you pretend to like just to avoid arguing or looking uncultured?',
    'Have you ever ghosted someone for an unbelievably petty or silly reason?',
    'If you had to rate the vibe of everyone in this room right now from most chaotic to most chill, what would the order be?'
  ]
};

export const DARE_PROMPTS_BY_INTENSITY: Record<IntensityLevel, string[]> = {
  casual: [
    'Speak in a dramatic nature-documentary narrator voice for the next two rounds.',
    'Make up a 30-second commercial praising the best feature of this vacation house.',
    'Do your best impression of someone trying to wake up early on vacation before coffee.',
    'Give a genuine and thoughtful compliment to every single player in the room.',
    'Teach the group a 15-second silly custom handshake or celebratory victory dance.',
    'Tell a 30-second fictional bedtime story about a friendly creature living in the woods nearby.',
    'Sing the chorus of your favorite pop song in an opera singer style.',
    'Strike 3 high-fashion runway model poses using items found in this room as props.'
  ],
  interesting: [
    'Invent an epic superhero name and origin story for the person sitting across from you.',
    'Give a passionate 1-minute speech convincing the group why breakfast is the superior meal.',
    'Do a dramatic slow-motion replay of a famous movie scene using hand gestures only.',
    'Pretend you are a Michelin-star gourmet food critic sampling a plain glass of tap water.',
    'Recite the alphabet backwards starting from Z to P as quickly as you can.',
    'Speak only in rhymes for your next full turn.',
    'Do your best impression of a GPS navigation assistant making a wrong turn recalculation.',
    'Come up with a 3-part cabin pledge or house motto that everyone must repeat together out loud.'
  ],
  embarrassing: [
    'Show the group the last photo in your camera roll (or describe it in vivid dramatic detail if private).',
    'Let the person to your right pose your arms and legs like a mannequin for 1 whole minute.',
    'Call or voice-note a mutual friend and leave a dramatic 15-second monologue without context.',
    'Read aloud the last 3 text messages you received with extreme emotional acting.',
    'Do your best interpretive dance of someone stepping on a hot sidewalk barefoot.',
    'Let the group scroll through your Spotify or music app recently played history for 20 seconds.',
    'Attempt to juggle 3 random small objects from around the room.',
    'Speak with a funny accent chosen by the player to your right until your next turn.'
  ],
  spicy: [
    'Let the player to your left send a 1-word emoji reaction to any random story on your Instagram/social feed.',
    'Truthfully rank the 3 most chaotic habits of people in this room.',
    'Swap an item of clothing or accessory (hat, jacket, socks) with the person across from you for the rest of the game.',
    'Let the group look at your screen time report and judge your most-used apps.',
    'Reenact your most dramatic romantic rejection or awkward pickup line.',
    'Whisper a juicy secret or harmless hot-take into the ear of the person to your left.',
    'Let another player take an unflattering candid photo of you to set as your avatar.',
    'Trade seats with anyone and adopt their personality whenever someone talks to you for the next round.'
  ]
};

export const NEVER_HAVE_I_EVER_PROMPTS_BY_INTENSITY: Record<IntensityLevel, string[]> = {
  casual: [
    'Never have I ever packed for a trip the morning of departure.',
    'Never have I ever gotten completely turned around or lost on a hiking trail.',
    'Never have I ever eaten dessert before dinner while on vacation.',
    'Never have I ever binge-watched an entire TV series in a single weekend.',
    'Never have I ever stayed up past 3:00 AM stargazing or chatting around a fire.',
    'Never have I ever forgotten where I parked my car in a massive parking lot.',
    'Never have I ever taken a road trip with zero planned stops or schedule.',
    'Never have I ever stayed in pajamas for an entire 24-hour day.'
  ],
  interesting: [
    'Never have I ever traveled to a foreign country completely alone.',
    'Never have I ever met or had a conversation with a celebrity in person.',
    'Never have I ever won a contest, raffle, or game show prize.',
    'Never have I ever gone skinny dipping in a natural lake or ocean.',
    'Never have I ever pulled an all-nighter to finish a creative project or video game.',
    'Never have I ever had a psychic reading or tarot card prediction come true.',
    'Never have I ever successfully cooked a multi-course gourmet dinner from scratch.',
    'Never have I ever gone bungee jumping, skydiving, or white-water rafting.'
  ],
  embarrassing: [
    'Never have I ever accidentally locked myself out of a house or rental.',
    'Never have I ever pretended to know the words to a song by just mumbling confidently.',
    'Never have I ever walked into a glass sliding door or screen window.',
    'Never have I ever re-gifted a present to someone else.',
    'Never have I ever dropped my phone directly onto my face while lying in bed.',
    'Never have I ever burned microwave popcorn and made the whole place smell for hours.',
    'Never have I ever waved back enthusiastically at someone who was waving at someone behind me.',
    'Never have I ever walked in on someone or had someone walk in on me in the bathroom.'
  ],
  spicy: [
    'Never have I ever snooped through someone’s phone or messages without them knowing.',
    'Never have I ever pretended to be sick or had a fake emergency to get out of a terrible date.',
    'Never have I ever blamed a loud noise or bad smell on a pet or innocent friend.',
    'Never have I ever had a crush on a friend’s sibling or ex-partner.',
    'Never have I ever lied about my age, job, or credentials to impress someone at a bar.',
    'Never have I ever accidentally "liked" an old photo from years ago while stalking social media.',
    'Never have I ever sent a risky text and immediately turned my phone on Airplane Mode in panic.',
    'Never have I ever deleted a group chat message because I regretted it 2 seconds later.'
  ]
};

export const GAME_RULES = {
  truthOrDare: {
    title: 'Truth or Dare Rules',
    tagline: 'Classic rotating pass-and-play fun with 4 intensity levels',
    steps: [
      'Choose your preferred **intensity level** (Casual, Interesting, Embarrassing, or Spicy).',
      'Take turns in order with the shared phone.',
      'When your name appears, choose either **Truth** (answer honestly) or **Dare** (complete the challenge).',
      'Enjoy the dynamic ambient glowing card backdrop as prompts change.',
      'Tap **Done** once completed, or **Skip** anytime without judgment. Pass the phone to the next player!'
    ]
  },
  neverHaveIEver: {
    title: 'Never Have I Ever Rules',
    tagline: 'Group reveal & react with 5 life tokens and intensity levels',
    steps: [
      'Select an **intensity level** for the room.',
      'Each player starts with **5 life tokens** (fingers).',
      'A statement is shown: "Never have I ever..." with dynamic glowing ambient background.',
      'Pass the phone privately: each player taps **I Have** or **Never**.',
      'Once everyone has voted, the group responses are revealed together!',
      'Anyone who selected **I Have** loses 1 token. Last player with tokens remaining wins!'
    ]
  }
};
