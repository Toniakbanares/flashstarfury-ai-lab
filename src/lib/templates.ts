import { Sparkles, Palette, Image, Wand2, Gamepad2, Shield } from "lucide-react";

export const TEMPLATES = [
  { id: "anime", icon: Sparkles, name: "Personagem Anime", prompt: "anime character, vibrant colors, detailed eyes, studio ghibli style, highly detailed" },
  { id: "logo", icon: Shield, name: "Logo Minimalista", prompt: "minimalist logo design, clean lines, modern, vector style, flat colors" },
  { id: "thumbnail", icon: Image, name: "Thumbnail YouTube", prompt: "youtube thumbnail, bold text, dramatic lighting, eye-catching, high contrast" },
  { id: "tattoo", icon: Wand2, name: "Design de Tatuagem", prompt: "tattoo design, black ink, detailed linework, traditional style" },
  { id: "game", icon: Gamepad2, name: "Game Asset", prompt: "game asset, fantasy rpg, concept art, detailed texture, 4k" },
  { id: "fantasy", icon: Palette, name: "Personagem Fantasia", prompt: "fantasy character, epic armor, magical aura, dramatic pose, digital art" },
] as const;

export const CATEGORY_FILTERS = [
  { id: "all", label: "Tudo" },
  { id: "image", label: "Imagens" },
  { id: "logo", label: "Logos" },
  { id: "avatar", label: "Personagens" },
  { id: "art", label: "Arte" },
] as const;
