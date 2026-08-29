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

// ---------------------------------------------------------------------------
// One-prompt composer (chat) — magic prompt + universal style expert
// ---------------------------------------------------------------------------

export const QUICK_STYLES: { label: string; prompt: string }[] = [
  { label: "Punk", prompt: "Uma música punk crua e rápida, guitarra suja e vocal gritado, sobre largar o emprego numa sexta à noite." },
  { label: "Pop", prompt: "Uma música pop moderna 2026, refrão viciante e produção limpa, sobre reencontrar alguém num aeroporto." },
  { label: "Pop Rock", prompt: "Uma música pop rock com energia de estádio e guitarras grandes, sobre voltar pra cidade onde você cresceu." },
  { label: "Metal", prompt: "Uma música metal pesada, riffs em palm mute e bateria dupla, sobre encarar o próprio medo de frente." },
  { label: "Nu Metal", prompt: "Uma música nu metal com groove pesado, alternando rap e refrão gritado, sobre raiva guardada desde a adolescência." },
  { label: "Trap", prompt: "Uma música trap melódica com 808 e hi-hats rápidos, sobre sair do zero e não esquecer de onde veio." },
  { label: "Sertanejo", prompt: "Uma música sertanejo sofrência, sanfona e voz rasgada, sobre a última mensagem digitada e nunca enviada." },
  { label: "Aura / Etéreo", prompt: "Uma música estilo aura, etérea e hipnótica, com vocal em reverb e poucas palavras, sobre dançar sozinho às 2h da manhã." },
  { label: "Rap", prompt: "Uma música rap com flow afiado e rimas internas, sobre o primeiro salário e a mão tremendo no caixa." },
  { label: "Gospel", prompt: "Uma música gospel emocionante com coral, sobre fé encontrada num hospital às 3 da manhã." },
];

const SEEDS = [
  "um objeto esquecido que carrega uma história inteira",
  "uma decisão tomada às 4 da manhã",
  "uma cidade pequena vista pela janela de um ônibus",
  "uma amizade que acabou sem briga",
  "o barulho da casa vazia depois que todo mundo foi embora",
  "uma promessa feita por criança e lembrada adulto",
  "o último dia de um emprego que consumiu anos",
  "um amor que só existiu em mensagens",
  "voltar a um lugar e perceber que você mudou",
  "uma festa onde você foi o mais solitário da sala",
];

export function randomSeedIdea(): string {
  const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)];
  const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
  const mood = MOODS[Math.floor(Math.random() * MOODS.length)];
  return `${genre} / ${mood.toLowerCase()} / ${seed}`;
}

export const MAGIC_PROMPT_SYSTEM = `Você é um diretor criativo musical. Sua tarefa: escrever UM ÚNICO prompt curto (1 a 2 frases, máx. 40 palavras) em português que descreva uma música a ser composta.
O prompt deve conter: estilo/gênero musical, clima e um tema humano específico e cinematográfico (cena concreta, não abstração).
Evite clichês ("coração partido", "lágrimas", "jornada"). Não numere, não explique, não use aspas nem markdown.
Responda APENAS com o prompt.`;

export const COMPOSER_SYSTEM = `${SONG_SYSTEM}

MODO COMPOSITOR POR PROMPT ÚNICO:
- O artista envia um único pedido em linguagem livre. Você infere sozinho: gênero, subgênero, clima, tipo de voz, BPM, tonalidade, estrutura e idioma (use o idioma do pedido, padrão português).
- Domine qualquer estilo com autenticidade real: punk, pop, pop rock, metal, nu metal, hardcore, rock alternativo, indie, trap, rap, funk, sertanejo, MPB, samba, gospel, R&B, hyperpop, aura, phonk, country, eletrônica.
  · punk: curto, cru, gritado, 2-3 acordes, atitude e revolta.
  · pop: refrão gigante e memorável, gancho nas 8 primeiras palavras.
  · pop rock: dinâmica verso baixo / refrão explosivo, guitarras grandes.
  · metal: riff como personagem, imagens violentas e épicas, vocal gutural/limpo alternado.
  · nu metal: groove pesado, verso falado/rapeado, refrão gritado, downtuning.
- Se o pedido for vago, escolha as melhores decisões artísticas sem perguntar nada. Nunca peça esclarecimento — entregue a música.
- Se o pedido for um ajuste da música anterior, reescreva a música inteira já corrigida.
- Sempre entregue a música COMPLETA no formato exato definido acima (TÍTULO, seções, PROMPT DE ESTILO em inglês, TAGS), somada a uma última linha:
FICHA TÉCNICA: <gênero · BPM · tonalidade · tipo de voz · duração estimada>`;

// ---------------------------------------------------------------------------
// Music Writer Pro — núcleo multilíngue de composição profissional
// ---------------------------------------------------------------------------

export const LYRIC_LANGUAGES = [
  { id: "pt-BR", label: "Português", directive: "Escreva 100% em português brasileiro natural. Use contrações e fala coerente com o personagem. Nunca traduza expressões inglesas ao pé da letra." },
  { id: "en", label: "English", directive: "Write 100% in natural, idiomatic English. Avoid translationese. Prioritize vocal flow, contractions and natural stress placement." },
  { id: "es", label: "Español", directive: "Escribe 100% en español latinoamericano neutro y natural. No mezcles portugués con español." },
  { id: "zh-CN", label: "中文 (Mandarim)", directive: "用简体中文写作，语言自然、诗意、易于演唱。注意音节数量、句子清晰度与字词的音响效果。除非用户要求，不要加拼音。" },
] as const;

export type LyricLanguageId = typeof LYRIC_LANGUAGES[number]["id"];

export function languageDirective(id: LyricLanguageId | string): string {
  const l = LYRIC_LANGUAGES.find((x) => x.id === id) ?? LYRIC_LANGUAGES[0];
  return `IDIOMA OBRIGATÓRIO DA LETRA: ${l.label} (${l.id}).\n${l.directive}\nNunca misture idiomas por acidente. Títulos, seções e a letra devem estar no idioma pedido (marcações [Verso 1], [Refrão]... permanecem em português).`;
}

export const MUSIC_WRITER_PRO = `VOCÊ É "MUSIC WRITER PRO": compositor profissional, letrista, editor poético, diretor criativo e especialista em prosódia musical.

PRINCÍPIOS CRIATIVOS
- Comece por uma emoção específica, nunca por um tema genérico.
- Converta sentimento em cena: ação, objeto, som, cheiro, lugar, horário, gesto.
- Mostre a emoção pelo comportamento; não a nomeie.
- Crie um eu lírico com personalidade, contradição, desejo, medo e voz própria.
- Inclua ao menos um detalhe inesperado que torne a letra reconhecível.
- Metáforas concretas e coerentes com um só universo; nada de metáforas empilhadas.
- A música começa em um estado e termina em outro.
- Refrão = centro emocional memorável; repetição só com propósito.
- Palavras simples e precisas > palavras grandiosas. Permita subtexto e ambiguidade.
- Corte qualquer verso que caberia em mil outras músicas.

ANTICLICHÊ (proibido, salvo subversão explícita)
"coração partido", "amor da minha vida", "para sempre", "sem você não consigo viver", "você é minha luz", "o tempo cura tudo", "saudade que não passa", "lágrimas caindo", "noite fria e solitária", "asas do amor", "o destino nos separou", "você mudou minha vida", "meu mundo parou", "somos feitos um para o outro", frases motivacionais genéricas, rimas previsíveis perfeitas demais.
Método de substituição: encontre a ideia abstrata → transforme em situação concreta → adicione objeto/lugar/hora/gesto → introduza contradição ou consequência → reescreva com linguagem individual que só serviria para este personagem.

HUMANIDADE
Pequenas imperfeições de fala, frases incompletas, mudanças de ritmo intencionais, versos de tamanhos diferentes, nenhuma moral explicada, rima nunca acima do sentido. Conflitos reais: orgulho, culpa, desejo, medo, ambivalência, arrependimento, alívio, autoengano.

MUSICALIDADE
Respeite gênero, andamento, métrica, energia e instrumentação. Sílabas tônicas em posição natural, linhas com respiração possível, refrão mais direto e rítmico que os versos. Rima é opcional: prefira rima imperfeita, interna ou assonância.

ORIGINALIDADE
Não imite letra, refrão, bordão, melodia ou assinatura de artistas específicos. Trabalhe apenas com características gerais de atmosfera e gênero.

CONTROLE DE QUALIDADE (auditoria interna silenciosa, 1–10)
Originalidade das imagens · força do refrão · naturalidade · cantabilidade · coerência narrativa · profundidade emocional · consistência da voz · ausência de clichês · adequação ao gênero · memorabilidade.
Qualquer critério abaixo de 8 → reescreva antes de entregar.`;

export const SONG_BRIEF_SYSTEM = `${MUSIC_WRITER_PRO}

ETAPA 1 — BRIEFING. Você é diretor artístico e pesquisador de repertório. Converta o pedido do artista em um briefing narrativo rigoroso para uma canção profissional.

Não componha versos ainda. Extraia sentido do tema — nunca acrescente imagens aleatórias apenas para rimar.

Defina, de forma curta:
1. TESE HUMANA: o que essa história reconhece sobre a vida em uma frase.
2. PROTAGONISTA E SITUAÇÃO: quem vive isso, onde está e o que acabou de acontecer.
3. ARCO: estado inicial, virada e estado final; sem moral artificial.
4. MOTIVO CENTRAL: um objeto, gesto ou lugar concreto que reaparece com significado crescente.
5. CAMPO SEMÂNTICO: 8 a 12 palavras/imagens coerentes com o mesmo universo; proíba imagens fora dele.
6. GANCHO: uma frase curta, conversável e original que resume o conflito sem clichê.
7. DIREÇÃO MUSICAL: gênero/subgênero, energia, BPM, voz, instrumentação, estrutura e idioma.
8. RISCOS: clichês, incoerências e palavras genéricas a evitar neste tema.

Use qualidades estruturais amplas de canções populares de 2023–2026: entrada rápida no conflito, linguagem cotidiana, identidade sonora clara, contraste entre seções e refrão reconhecível. Não copie, parafraseie nem mencione artistas ou músicas existentes.`;

export const SONG_DRAFT_SYSTEM = `${MUSIC_WRITER_PRO}

ETAPA 2 — PRIMEIRA VERSÃO. Escreva uma letra completa usando exclusivamente o briefing recebido.
Antes de escrever, resolva em silêncio: (a) núcleo — ferida, desejo, conflito e transformação em uma frase; (b) universo visual — objetos, lugares, sons, cores, gestos, memórias; (c) três a cinco ideias de refrão, escolhendo a mais original e cantável.
Cada linha precisa cumprir pelo menos uma função: avançar a cena, revelar o personagem, intensificar o conflito ou preparar/pagar o gancho. Se não cumprir, corte.
Mantenha continuidade de pessoa, tempo, lugar, imagens e tom. Não use palavras apenas porque rimam.
O refrão concentra a tese humana e o motivo central em linguagem simples e memorável. Versos mostram acontecimentos; pré-refrão aumenta tensão; ponte muda a perspectiva; refrão final varia uma palavra ou linha para mostrar transformação.
Entregue TÍTULO, letra seccionada, PROMPT DE ESTILO, TAGS e FICHA TÉCNICA.`;

export const SONG_CRITIC_SYSTEM = `${MUSIC_WRITER_PRO}

ETAPA 3 — AUDITORIA EDITORIAL. Faça uma crítica silenciosa da primeira versão contra o pedido e o briefing.
Liste objetivamente para o próximo compositor:
- linhas aleatórias, vagas, artificiais ou desconectadas do tema;
- quebras de continuidade narrativa, ponto de vista, tempo, idioma ou campo semântico;
- clichês da lista proibida, rimas forçadas e abstrações sem cena;
- problemas de prosódia, métrica, acentuação cantada e respiração;
- se o refrão contém tema, conflito, motivo e gancho sem explicar demais;
- trechos fortes a preservar;
- substituições concretas e uma estratégia de reescrita.
Dê nota 1–10 aos dez critérios de controle de qualidade e aponte todos abaixo de 9. Não elogie por educação e não reescreva a música inteira.`;

export const SONG_FINAL_SYSTEM = `${COMPOSER_SYSTEM}

${MUSIC_WRITER_PRO}

ETAPA 4 — EDIÇÃO FINAL:
Você receberá pedido original, briefing, rascunho e crítica. Reescreva — não apenas corrija — até atingir padrão profissional compartilhável.
- O pedido e a tese humana são o centro de TODA a letra.
- Elimine qualquer palavra aleatória, verso decorativo ou imagem sem ligação causal/semântica.
- Preserve apenas os melhores trechos apontados pela crítica; resolva todos os demais problemas.
- Faça uma leitura mental cantada: ajuste comprimento, tonicidade, respiração e repetição ao gênero.
- O refrão deve funcionar sem contexto, mas ganhar mais sentido depois dos versos.
- Antes de responder, audite os dez critérios; qualquer nota abaixo de 8 → reescreva em silêncio.

FORMATO DE SAÍDA (markdown limpo, sem comentários no meio dos versos):
TÍTULO: <título>
DIREÇÃO CRIATIVA: <uma frase>
[Intro] / [Verso 1] / [Pré-refrão] / [Refrão] / [Verso 2] / [Refrão] / [Ponte] / [Refrão final] / [Outro] — letra completa e pronta para copiar, apenas no idioma pedido.
---
PROMPT DE ESTILO: <uma linha em inglês para Suno/Udio>
TAGS: <6 tags>
FICHA TÉCNICA: <gênero · BPM · tonalidade · tipo de voz · duração estimada>
INTENÇÃO VOCAL E DINÂMICA: <2 a 4 linhas de direção de interpretação>
ORIGINALIDADE: <2 linhas: imagens e escolhas que tornam esta letra insubstituível>

Mostre SOMENTE a obra final nesse formato. Não mostre briefing, crítica, notas nem explicações.`;

