export const COMMUNITY_RULES = [
  "Compartilhe somente imagens suas ou que você tenha autorização para publicar.",
  "Respeite as pessoas: não publique ódio, assédio, violência explícita ou conteúdo sexual.",
  "Não exponha dados pessoais nem imagens íntimas de outras pessoas.",
  "Identifique conteúdo gerado por IA; não use imagens para enganar ou se passar por alguém.",
  "Evite spam e denuncie conteúdos que descumpram estas regras.",
];
export function validateCommunityPost(title: string, accepted: boolean) {
  if (!title.trim() || title.trim().length > 120) return "Use um título de 1 a 120 caracteres.";
  if (!accepted) return "Aceite as boas práticas antes de publicar.";
  return null;
}
export function validateCommunityFile(file: Pick<File, "size" | "type">) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Escolha uma imagem JPG, PNG ou WebP.";
  if (file.size > 10 * 1024 * 1024) return "A imagem deve ter no máximo 10 MB.";
  return null;
}
export function canModeratePost(owner: string, viewer: string | undefined, admin: boolean) {
  return Boolean(viewer && (owner === viewer || admin));
}