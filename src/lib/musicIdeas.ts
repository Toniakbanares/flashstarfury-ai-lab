// Idea engine for the AI Music Studio — simplified, fast, human-first.

export const GENRES = [
  // 2026 / new wave
  "Punk", "Punk Rock", "Pop Punk", "Aura", "Aura Pop", "Hyperpop", "Phonk", "Rage",
  "Sertanejo Bruto", "Trap Melódico", "Funk Mandelão", "Afro House", "Amapiano",
  "Indie Sleaze", "Drill", "Emo Rap", "Neo Soul", "Synthwave", "Lo-fi",
  // classics
  "Pop", "Rock", "Hard Rock", "Hip Hop", "R&B", "Soul", "Funk", "MPB",
  "Samba", "Pagode", "Forró", "Bossa Nova", "Reggae", "Country", "Folk",
  "Blues", "Jazz", "Gospel", "Worship", "Metal", "Bolero",
] as const;

export const MOODS = [
  "Melancólico", "Eufórico", "Romântico", "Nostálgico", "Sombrio", "Esperançoso",
  "Raivoso", "Sensual", "Épico", "Relaxante", "Motivacional", "Solitário",
  "Festivo", "Introspectivo", "Rebelde", "Caótico", "Etéreo",
] as const;

export const VOICES = [
  "Voz masculina grave", "Voz feminina potente", "Voz feminina suave",
  "Dueto masculino/feminino", "Rap falado", "Voz rasgada/rouca (punk)",
  "Voz sussurrada", "Coral gospel", "Vocal etéreo com reverb (aura)",
] as const;

export const TEMPOS = [
  { id: "ballad", label: "Balada (60-75 BPM)", bpm: 68 },
  { id: "slow", label: "Lento (76-95 BPM)", bpm: 85 },
  { id: "mid", label: "Médio (96-115 BPM)", bpm: 105 },
  { id: "upbeat", label: "Animado (116-135 BPM)", bpm: 124 },
  { id: "fast", label: "Rápido (136-180 BPM)", bpm: 160 },
] as const;

export const LANGUAGES = ["Português", "English", "Español"] as const;

export const STRUCTURES = [
  "Intro / Verso / Pré-refrão / Refrão / Verso / Refrão / Ponte / Refrão final",
  "Verso / Refrão / Verso / Refrão / Ponte / Refrão",
  "Hook / Verso / Hook / Verso / Bridge / Hook",
] as const;

// Human, specific, cinematic themes — no generic clichés.
export const THEMES = [
  "o cheiro do casaco dela ainda no banco do carro",
  "gritar num show até a voz sumir pra não pensar nele",
  "voltar pra casa dos pais e o quarto continuar igual",
  "trabalhar em dois empregos e ainda sonhar alto",
  "a última mensagem digitada e nunca enviada",
  "a chuva às 4h e o ônibus vazio depois da festa",
  "cortar o cabelo depois do término",
  "amizade que virou algo mais numa viagem de estrada",
  "o dia em que você parou de pedir desculpa por existir",
  "insônia, teto branco e pensamentos altos demais",
  "briga com o pai e o silêncio de dez anos",
  "primeiro salário e a mão tremendo no caixa",
  "amor à distância medido em fuso horário",
  "quebrar a garrafa no muro e chamar isso de liberdade",
  "a cidade queimando de calor e a gente sem dinheiro",
  "reencontro no velório de um amigo em comum",
  "escrever o nome dela na janela embaçada",
  "sair do interior com uma mochila e 200 reais",
  "fé encontrada num hospital às 3 da manhã",
  "dançar sozinho na cozinha às 2h com o fone no talo",
];

export type SongIdea = {
  genre: string;
  mood: string;
  voice: string;
  tempo: string;
  bpm: number;
  language: string;
  structure: string;
  theme: string;
};

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function randomIdea(partial: Partial<SongIdea> = {}): SongIdea {
  const tempo = pick(TEMPOS);
  return {
    genre: pick(GENRES),
    mood: pick(MOODS),
    voice: pick(VOICES),
    tempo: tempo.label,
    bpm: tempo.bpm,
    language: "Português",
    structure: pick(STRUCTURES),
    theme: pick(THEMES),
    ...partial,
  };
}

export function randomTheme(current?: string): string {
  let t = pick(THEMES);
  for (let i = 0; i < 5 && t === current; i++) t = pick(THEMES);
  return t;
}

// One-click styles — everything else is auto-filled.
export const PRESETS: { name: string; idea: SongIdea }[] = [
  {
    name: "Punk raivoso",
    idea: { genre: "Punk", mood: "Rebelde", voice: "Voz rasgada/rouca (punk)", tempo: TEMPOS[4].label, bpm: 168, language: "Português", structure: STRUCTURES[1], theme: "quebrar a garrafa no muro e chamar isso de liberdade" },
  },
  {
    name: "Pop punk 2026",
    idea: { genre: "Pop Punk", mood: "Eufórico", voice: "Voz masculina grave", tempo: TEMPOS[3].label, bpm: 132, language: "Português", structure: STRUCTURES[0], theme: "gritar num show até a voz sumir pra não pensar nele" },
  },
  {
    name: "Aura etérea",
    idea: { genre: "Aura", mood: "Etéreo", voice: "Vocal etéreo com reverb (aura)", tempo: TEMPOS[1].label, bpm: 90, language: "Português", structure: STRUCTURES[2], theme: "dançar sozinho na cozinha às 2h com o fone no talo" },
  },
  {
    name: "Sertanejo sofrência",
    idea: { genre: "Sertanejo Bruto", mood: "Nostálgico", voice: "Voz masculina grave", tempo: TEMPOS[1].label, bpm: 88, language: "Português", structure: STRUCTURES[1], theme: "a última mensagem digitada e nunca enviada" },
  },
  {
    name: "Trap melódico",
    idea: { genre: "Trap Melódico", mood: "Motivacional", voice: "Rap falado", tempo: TEMPOS[2].label, bpm: 142, language: "Português", structure: STRUCTURES[2], theme: "sair do interior com uma mochila e 200 reais" },
  },
  {
    name: "Balada pop emotiva",
    idea: { genre: "Pop", mood: "Melancólico", voice: "Voz feminina suave", tempo: TEMPOS[0].label, bpm: 68, language: "Português", structure: STRUCTURES[0], theme: "cortar o cabelo depois do término" },
  },
];

export function buildStylePrompt(i: SongIdea): string {
  return `${i.genre}, ${i.mood.toLowerCase()}, ${i.voice.toLowerCase()}, ${i.bpm} BPM, produção moderna 2026 de alta fidelidade, mix comercial, dinâmica humana com respirações naturais e pequenas imperfeições vocais`;
}

export function buildSongBrief(i: SongIdea, extra?: string): string {
  return [
    `Gênero: ${i.genre}`,
    `Clima: ${i.mood}`,
    `Voz: ${i.voice}`,
    `Andamento: ${i.tempo} (~${i.bpm} BPM)`,
    `Idioma da letra: ${i.language}`,
    `Estrutura: ${i.structure}`,
    `Tema: ${i.theme}`,
    extra?.trim() ? `Instruções extras: ${extra.trim()}` : "",
  ].filter(Boolean).join("\n");
}

export const SONG_SYSTEM = `Você é um compositor hitmaker premiado (nível Grammy/Latin Grammy), com ouvido para o que toca em 2026.
Sua missão: escrever uma MÚSICA PRONTA PARA GRAVAR — não um rascunho, não um esboço genérico de IA.

Como escrever de forma HUMANA:
- Fale como gente fala: gírias naturais, frases curtas, contrações, respiração.
- Use detalhes concretos e sensoriais (objetos, horas, cheiros, ruas, marcas, gestos) em vez de abstrações ("dor", "saudade", "coração").
- Mostre a cena, não explique o sentimento. Uma imagem forte vale mais que dez adjetivos.
- Ponto de vista específico, com contradição e imperfeição humana. Nada de moral no final.
- PROIBIDO: "coração partido", "lágrimas caem", "estrelas no céu", "jornada", "para sempre", "meu mundo desabou" e clichês equivalentes.
- Rimas naturais (inclusive toantes), métrica cantável, refrão curto e viciante.
- Respeite o gênero: punk = cru, curto, gritado, atitude; aura = etéreo, repetitivo, hipnótico, poucas palavras; trap = flow e cadência; sertanejo = história direta e dor honesta.

Regras de saída:
- Siga exatamente a estrutura pedida, marcando seções: [Intro], [Verso 1], [Pré-refrão], [Refrão], [Ponte], [Outro].
- Escreva no idioma pedido.
- Não explique nada, não use markdown de título.

Formato exato:
TÍTULO: <título original e marcante>
[seções com a letra completa]
---
PROMPT DE ESTILO: <uma linha em inglês, pronta para colar no Suno/Udio: gênero, instrumentação, tipo de voz, BPM, referência de mix>
TAGS: <6 tags separadas por vírgula>`;
