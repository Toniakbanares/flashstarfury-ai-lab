// StarFury AI — Knowledge Core
// Base de conhecimento multidomínio usada para enriquecer prompts de imagem,
// vídeo, 3D, avatar, logo, texto, música e o chat da Lumy.
// Tudo é local (string), sem APIs pagas e sem limites de uso.

export type DomainId =
  | "anime"
  | "cinema"
  | "fineart"
  | "photography"
  | "scifi"
  | "fantasy"
  | "nature"
  | "architecture"
  | "product"
  | "portrait"
  | "music"
  | "game"
  | "cartoon"
  | "horror"
  | "street";

type Domain = {
  id: DomainId;
  match: RegExp;
  /** Palavras-chave em inglês que elevam a qualidade da geração visual. */
  visual: string;
  /** Conhecimento narrativo/estético para texto e chat. */
  lore: string;
};

export const DOMAINS: Domain[] = [
  {
    id: "anime",
    match: /anime|mang[áa]|manhwa|otaku|shonen|shoujo|seinen|isekai|ghibli|waifu|chibi|kawaii|cosplay|naruto|jujutsu|vtuber/i,
    visual:
      "anime key visual, clean cel shading, expressive large eyes with specular highlights, crisp line art, dynamic speed lines, detailed hair strands with rim light, painterly anime background, studio-quality production art, 2D animation cel, vibrant complementary palette",
    lore:
      "Anime/mangá: domine subgêneros (shonen, shoujo, seinen, isekai, slice of life, mecha), linguagem de painéis, arquétipos (tsundere, kuudere, senpai), ritmo de arco narrativo, tropos de escola/torneio/poder oculto e estética de estúdios (cel shading, sakuga, backgrounds pintados à mão).",
  },
  {
    id: "cinema",
    match: /cinem|filme|movie|film|trailer|cena|scene|noir|western|documentary|documentário/i,
    visual:
      "cinematic still, anamorphic lens, 35mm film grain, shallow depth of field, three-point lighting, teal and orange color grade, volumetric light rays, rule of thirds composition, professional color science",
    lore:
      "Cinema: linguagem de planos (estabelecedor, plano-detalhe, contraplano), continuidade de eixo, regra dos 180°, ritmo de montagem, blocking de atores, arcos de três atos e direção de fotografia (key/fill/rim, motivação de luz).",
  },
  {
    id: "fineart",
    match: /pintura|paint|aquarel|watercolor|[óo]leo|oil|impression|renascen|barroc|art nouveau|surreal|abstrat|abstract|ilustra|illustration|desenho|sketch/i,
    visual:
      "masterful fine-art illustration, visible brushwork and impasto texture, layered glazing, harmonious limited palette, museum-grade composition, gallery lighting, hand-painted detail, expressive value structure",
    lore:
      "Artes visuais: história dos movimentos (renascença, barroco, impressionismo, art nouveau, bauhaus, surrealismo, pop art), teoria de cor (temperatura, harmonias, valor), composição (regra dos terços, espiral áurea, leading lines) e técnicas (aquarela, óleo, guache, nanquim, digital).",
  },
  {
    id: "photography",
    match: /foto|photo|retrato fotogr|dslr|bokeh|lente|lens|golden hour|studio/i,
    visual:
      "photorealistic, shot on full-frame DSLR, 85mm f/1.4, natural skin texture and pores, soft window light with bounce fill, creamy bokeh, true-to-life color, ultra sharp focus on eyes, high dynamic range",
    lore:
      "Fotografia: triângulo de exposição, distâncias focais e compressão, esquemas de luz (Rembrandt, borboleta, split), golden/blue hour, direção de modelo e pós-produção (dodge & burn, curvas, grading).",
  },
  {
    id: "scifi",
    match: /sci-?fi|fic[çc][ãa]o cient|espacial|space|cyberpunk|futurist|robô|robot|android|nave|alien|neon city|mecha/i,
    visual:
      "sci-fi concept art, hard-surface design language, neon rim lighting, holographic UI elements, atmospheric fog with god rays, brushed metal and carbon materials, epic scale with tiny human for reference, cinematic sci-fi color grade",
    lore:
      "Ficção científica: hard vs soft sci-fi, worldbuilding coerente (tecnologia, economia, política), estética cyberpunk/solarpunk/space opera e design industrial plausível.",
  },
  {
    id: "fantasy",
    match: /fantas|dragão|dragon|mago|wizard|elfo|elf|medieval|reino|castelo|mitolog|deus|goddess/i,
    visual:
      "epic fantasy art, ornate costume and armor detail, magical particle glow, dramatic god rays, matte painting environment, mythic scale, rich jewel-tone palette, painterly realism",
    lore:
      "Fantasia: mitologias comparadas, sistemas de magia com custo e regras, arquétipos da jornada do herói, heráldica, criaturas folclóricas e worldbuilding cultural.",
  },
  {
    id: "nature",
    match: /natureza|nature|floresta|forest|montanha|mountain|oceano|ocean|paisagem|landscape|animal|flor|sunset|p[ôo]r do sol/i,
    visual:
      "breathtaking landscape photography, atmospheric depth layers, golden hour side lighting, volumetric mist, ultra-detailed foliage and rock texture, wide angle 24mm, polarized sky, high dynamic range",
    lore:
      "Natureza: biomas, comportamento de luz atmosférica, estações, fauna e flora regionais, composição de paisagem (primeiro plano forte, camadas, ponto de fuga).",
  },
  {
    id: "architecture",
    match: /arquitet|architect|interior|casa|house|pr[ée]dio|building|design de interiores|minimalista/i,
    visual:
      "architectural visualization, accurate perspective with two-point vanishing, natural daylight simulation, physically-based materials, clean lines, tasteful interior styling, wide 24mm tilt-shift, editorial magazine quality",
    lore:
      "Arquitetura: estilos (brutalismo, bauhaus, japandi, art déco), proporção e escala humana, fluxo de circulação, materiais e iluminação natural.",
  },
  {
    id: "product",
    match: /produto|product|mockup|packaging|embalagem|garrafa|tênis|sneaker|c[oó]smetic/i,
    visual:
      "premium product photography, seamless gradient backdrop, large softbox key with strip highlights, glossy reflections, perfect edge definition, macro detail, commercial advertising quality, subtle contact shadow",
    lore:
      "Design de produto: hierarquia visual de packaging, materiais e acabamentos, storytelling de marca e fotografia publicitária.",
  },
  {
    id: "portrait",
    match: /retrato|portrait|avatar|perfil|rosto|face|headshot|pessoa|homem|mulher|garota|garoto/i,
    visual:
      "striking portrait, natural skin texture with subsurface scattering, catchlights in the eyes, 85mm compression, soft key with gentle fill, flattering rim separation, authentic expression, sharp eyelashes",
    lore:
      "Retrato: direção de expressão, ângulo de câmera e psicologia, esquemas de luz para formatos de rosto, wardrobe e fundo que não competem com o rosto.",
  },
  {
    id: "music",
    match: /m[úu]sica|music|banda|band|cantor|singer|[áa]lbum|album|capa de disco|show|concert|dj|vinil/i,
    visual:
      "album cover art, bold graphic composition with negative space for typography, striking single focal subject, stylized color grade, analog grain, iconic and instantly memorable, art-direction level polish",
    lore:
      "Música: teoria (escalas, modos, cadências), produção (arranjo, mix, masterização), história de gêneros, cultura de cena e identidade visual de artista.",
  },
  {
    id: "game",
    match: /game|jogo|rpg|pixel art|low poly|voxel|console|fortnite|minecraft/i,
    visual:
      "game concept art, strong silhouette readability, orthographic-friendly design, stylized PBR materials, cohesive art direction, turnaround-ready detail, engine-quality lighting",
    lore:
      "Games: pipelines de arte (concept → modelagem → texturização), leitura de silhueta, game feel, level design e direção de arte estilizada vs realista.",
  },
  {
    id: "cartoon",
    match: /cartoon|desenho animado|pixar|disney|3d cute|mascote|mascot|caricatur/i,
    visual:
      "charming stylized 3D character, appealing exaggerated proportions, soft global illumination, subsurface skin shading, clean topology look, Pixar-quality render, warm inviting palette",
    lore:
      "Animação: 12 princípios (squash & stretch, antecipação, timing), design de apelo, expressões e linguagem corporal.",
  },
  {
    id: "horror",
    match: /terror|horror|sombrio|dark|medo|fantasma|ghost|zumbi|zombie|gore|assombr/i,
    visual:
      "unsettling horror atmosphere, low-key chiaroscuro lighting, deep crushed blacks, desaturated sickly palette, fog and grain, uncomfortable negative space, practical-effect realism",
    lore:
      "Terror: construção de tensão, o não-mostrado, som e silêncio, uncanny valley e subgêneros (folk horror, body horror, psicológico).",
  },
  {
    id: "street",
    match: /urban|street|grafite|graffiti|skate|hip hop|favela|cidade|city|neon/i,
    visual:
      "urban street photography, candid decisive moment, wet asphalt reflections, mixed neon and sodium lighting, 35mm reportage framing, gritty authentic texture, layered city depth",
    lore:
      "Cultura urbana: grafite e lettering, moda de rua, fotografia documental e estética das cenas hip hop, skate e baile.",
  },
];

export function detectDomains(prompt: string, max = 2): Domain[] {
  const hits = DOMAINS.filter((d) => d.match.test(prompt));
  return hits.slice(0, max);
}

/** Knowledge extra (inglês) para modelos de imagem/vídeo. */
export function visualKnowledge(prompt: string): string {
  const hits = detectDomains(prompt);
  if (!hits.length) return "";
  return hits.map((h) => h.visual).join(", ");
}

/** Conhecimento em português para prompts de texto/chat. */
export function loreKnowledge(prompt: string): string {
  const hits = detectDomains(prompt, 3);
  if (!hits.length) return "";
  return hits.map((h) => `• ${h.lore}`).join("\n");
}

const BASE_QUALITY =
  "ultra detailed, professional composition, balanced lighting, coherent anatomy and perspective, no watermark, no logo, no signature, no text overlay";

export type BoostMode = "image" | "video" | "3d" | "avatar" | "logo" | "text";

const MODE_BOOST: Record<BoostMode, string> = {
  image: `masterpiece quality, ${BASE_QUALITY}`,
  video: `cinematic film still, motion blur, dynamic composition, consistent character and wardrobe across shots, ${BASE_QUALITY}`,
  "3d": `3D render, isometric, octane render, studio HDRI lighting, physically based materials, soft contact shadows, ${BASE_QUALITY}`,
  avatar: `professional portrait, sharp focus on the eyes, centered headshot framing, flattering key light, natural skin texture, ${BASE_QUALITY}`,
  logo: `vector logo, flat design, on solid white background, minimal geometric construction, perfect symmetry and balance, scalable icon, no text unless requested, no mockup`,
  text: "",
};

/** Enriquece o prompt do usuário com conhecimento de domínio + qualidade. */
export function boostPrompt(mode: BoostMode, prompt: string): string {
  if (mode === "text") return prompt;
  const know = visualKnowledge(prompt);
  const parts = [prompt.trim(), know, MODE_BOOST[mode]].filter(Boolean);
  return parts.join(", ");
}

/** Bloco de conhecimento injetado nos otimizadores de prompt (Auto-prompt). */
export function knowledgeBriefing(prompt: string): string {
  const hits = detectDomains(prompt, 3);
  if (!hits.length) return "";
  return `\n\nDomain expertise to apply:\n${hits.map((h) => `- ${h.visual}`).join("\n")}`;
}

// ---------------------------------------------------------------------------
// Storyboard para geração de vídeo (sequência coerente de planos)
// ---------------------------------------------------------------------------

const SHOT_GRAMMAR = [
  "extreme wide establishing shot, 24mm, subject small in frame, atmospheric depth",
  "wide shot, slow dolly-in, 35mm, layered foreground element",
  "medium shot, subtle handheld drift, 50mm, subject centered",
  "medium close-up, slight pan right, 85mm, shallow depth of field",
  "close-up detail, macro texture, rack focus, dramatic rim light",
  "low angle hero shot, slow crane up, volumetric light rays",
  "over-the-shoulder framing, natural parallax, soft bokeh background",
  "final wide shot, slow pull back, golden backlight, cinematic resolution",
];

/** Prompt de keyframe #i de uma sequência, mantendo continuidade visual. */
export function shotPrompt(basePrompt: string, index: number, total: number): string {
  const grammar = SHOT_GRAMMAR[index % SHOT_GRAMMAR.length];
  const know = visualKnowledge(basePrompt);
  const beat =
    index === 0
      ? "opening beat of the scene"
      : index === total - 1
        ? "closing beat of the scene"
        : `beat ${index + 1} of ${total}, story progresses naturally from the previous shot`;
  return [
    basePrompt.trim(),
    grammar,
    beat,
    "same character, same wardrobe, same location, same time of day and identical color grade as the rest of the sequence",
    know,
    "cinematic film still, 35mm, professional color grading, ultra detailed, no watermark, no text, no logo",
  ]
    .filter(Boolean)
    .join(", ");
}

// ---------------------------------------------------------------------------
// Núcleo de conhecimento para a IA de chat (Lumy)
// ---------------------------------------------------------------------------

export const KNOWLEDGE_CORE = `CONHECIMENTO MULTIDOMÍNIO (aplique quando for relevante, sem citar esta lista):
- Música: teoria (escalas, modos, campo harmônico, cadências, prosódia), composição e letra, produção, mixagem e masterização, história e características de gêneros (pop, rock, punk, metal, nu metal, trap, rap, funk, sertanejo, MPB, samba, gospel, R&B, hyperpop, aura, phonk, eletrônica), estrutura de hits e distribuição/publishing.
- Anime e mangá: subgêneros, arquétipos, estrutura de arcos, linguagem de painéis, sakuga, cel shading, design de personagem e cultura otaku.
- Artes visuais: movimentos artísticos, teoria de cor, composição, técnicas tradicionais e digitais, ilustração e concept art.
- Cinema e vídeo: roteiro em três atos, linguagem de planos, continuidade, montagem, direção de fotografia, som e storyboard.
- Fotografia: exposição, lentes, esquemas de luz, direção e pós-produção.
- Design: tipografia, grid, identidade visual, logos, UI/UX e hierarquia.
- 3D e games: pipeline, materiais PBR, iluminação, silhueta, level design.
- Escrita: storytelling, copywriting, roteiro, poesia e edição.
- Tecnologia: programação, dados, IA e engenharia de prompt.

COMO RESPONDER
- Seja específico e prático; prefira exemplos concretos a explicações genéricas.
- Quando o pedido for criativo, entregue o resultado pronto (não peça esclarecimentos desnecessários).
- Quando for técnico, dê passos acionáveis; use markdown limpo e código em blocos com linguagem.
- Responda sempre no idioma do usuário.`;
