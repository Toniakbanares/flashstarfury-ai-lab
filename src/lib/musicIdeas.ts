// Idea engine for the AI Music Studio.
// Presets are editable and combinations are effectively infinite.

export const GENRES = [
  "Pop", "Indie Pop", "Rock", "Hard Rock", "Alternative", "Hip Hop", "Trap", "R&B",
  "Soul", "Funk", "Sertanejo", "MPB", "Samba", "Pagode", "Forró", "Bossa Nova",
  "Reggae", "Reggaeton", "Country", "Folk", "Blues", "Jazz", "Gospel", "Worship",
  "Lo-fi", "Synthwave", "House", "Techno", "Drum & Bass", "Afrobeat", "K-Pop",
  "Metal", "Punk", "Ambient", "Cinematic", "Phonk", "Bolero", "Cumbia",
] as const;

export const MOODS = [
  "Melancólico", "Eufórico", "Romântico", "Nostálgico", "Sombrio", "Esperançoso",
  "Raivoso", "Sensual", "Épico", "Relaxante", "Motivacional", "Solitário",
  "Festivo", "Introspectivo", "Dramático", "Doce", "Rebelde",
] as const;

export const VOICES = [
  "Voz masculina grave", "Voz masculina suave", "Voz feminina potente",
  "Voz feminina suave", "Dueto masculino/feminino", "Coral gospel",
  "Rap falado", "Voz sussurrada", "Voz rasgada/rouca", "Vocal andrógino",
] as const;

export const TEMPOS = [
  { id: "ballad", label: "Balada (60-75 BPM)", bpm: 68 },
  { id: "slow", label: "Lento (76-95 BPM)", bpm: 85 },
  { id: "mid", label: "Médio (96-115 BPM)", bpm: 105 },
  { id: "upbeat", label: "Animado (116-135 BPM)", bpm: 124 },
  { id: "fast", label: "Rápido (136-165 BPM)", bpm: 148 },
] as const;

export const LANGUAGES = ["Português", "English", "Español", "Français", "Italiano"] as const;

export const STRUCTURES = [
  "Intro / Verso / Pré-refrão / Refrão / Verso / Refrão / Ponte / Refrão final",
  "Verso / Refrão / Verso / Refrão / Ponte / Refrão",
  "Intro / Verso / Refrão / Verso / Refrão / Outro",
  "Hook / Verso / Hook / Verso / Bridge / Hook",
] as const;

export const THEMES = [
  "um amor que terminou por orgulho",
  "voltar à cidade natal depois de anos",
  "recomeçar do zero aos 30",
  "amizade que virou algo mais",
  "superar a ansiedade numa madrugada",
  "a última conversa com um pai",
  "viagem de estrada com a pessoa amada",
  "sair da pobreza e não esquecer de onde veio",
  "amor à distância e fuso horário",
  "festa onde você se sente sozinho",
  "carta que nunca foi enviada",
  "fé em meio ao caos",
  "primeiro beijo debaixo de chuva",
  "traição descoberta por acaso",
  "orgulho de ser quem você é",
  "verão que mudou tudo",
  "insônia e pensamentos às 3 da manhã",
  "reencontro dez anos depois",
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

// Curated starting points — each one is fully editable after being loaded.
export const PRESETS: { name: string; idea: SongIdea }[] = [
  {
    name: "Balada pop emotiva",
    idea: { genre: "Pop", mood: "Melancólico", voice: "Voz feminina suave", tempo: TEMPOS[0].label, bpm: 68, language: "Português", structure: STRUCTURES[0], theme: "um amor que terminou por orgulho" },
  },
  {
    name: "Sertanejo sofrência",
    idea: { genre: "Sertanejo", mood: "Nostálgico", voice: "Voz masculina grave", tempo: TEMPOS[1].label, bpm: 88, language: "Português", structure: STRUCTURES[1], theme: "a última mensagem apagada às 3 da manhã" },
  },
  {
    name: "Trap motivacional",
    idea: { genre: "Trap", mood: "Motivacional", voice: "Rap falado", tempo: TEMPOS[2].label, bpm: 140, language: "Português", structure: STRUCTURES[3], theme: "sair da pobreza e não esquecer de onde veio" },
  },
  {
    name: "Indie verão",
    idea: { genre: "Indie Pop", mood: "Esperançoso", voice: "Dueto masculino/feminino", tempo: TEMPOS[3].label, bpm: 120, language: "English", structure: STRUCTURES[1], theme: "verão que mudou tudo" },
  },
  {
    name: "Worship intimista",
    idea: { genre: "Worship", mood: "Introspectivo", voice: "Coral gospel", tempo: TEMPOS[0].label, bpm: 72, language: "Português", structure: STRUCTURES[2], theme: "fé em meio ao caos" },
  },
  {
    name: "R&B sensual noturno",
    idea: { genre: "R&B", mood: "Sensual", voice: "Voz feminina potente", tempo: TEMPOS[1].label, bpm: 92, language: "English", structure: STRUCTURES[1], theme: "amor à distância e fuso horário" },
  },
  {
    name: "Rock épico de arena",
    idea: { genre: "Rock", mood: "Épico", voice: "Voz rasgada/rouca", tempo: TEMPOS[3].label, bpm: 128, language: "English", structure: STRUCTURES[0], theme: "recomeçar do zero aos 30" },
  },
  {
    name: "Lo-fi madrugada",
    idea: { genre: "Lo-fi", mood: "Solitário", voice: "Voz sussurrada", tempo: TEMPOS[1].label, bpm: 80, language: "Português", structure: STRUCTURES[2], theme: "insônia e pensamentos às 3 da manhã" },
  },
];

export function buildStylePrompt(i: SongIdea): string {
  return `${i.genre}, ${i.mood.toLowerCase()}, ${i.voice.toLowerCase()}, ${i.bpm} BPM, produção moderna de alta fidelidade, mix comercial, dinâmica humana com respirações naturais e pequenas imperfeições vocais`;
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

export const SONG_SYSTEM = `Você é um compositor profissional premiado, especialista em música comercial que emociona e viraliza.
Escreva letras HUMANAS: linguagem coloquial, imagens concretas e sensoriais, detalhes específicos (objetos, lugares, horas, cheiros), e não clichês genéricos.
Regras:
- Respeite exatamente a estrutura pedida, marcando cada seção com [Intro], [Verso 1], [Pré-refrão], [Refrão], [Ponte], [Outro] etc.
- O refrão deve ser curto, cantável e repetível, com um gancho memorável.
- Métrica consistente e rimas naturais (evite rimas forçadas ou pobres).
- Escreva a letra no idioma pedido.
- Não explique nada. Não use markdown de título. Devolva apenas a música.
Formato de saída:
TÍTULO: <título>
[seções com a letra]
---
PROMPT DE ESTILO: <uma linha em inglês, pronta para colar em geradores de música por IA (Suno/Udio), descrevendo gênero, instrumentação, voz, BPM, mix>
TAGS: <6 tags separadas por vírgula>`;
