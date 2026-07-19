import { Heart, Copy, Wand2, Share2, Eye, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { copyToClipboard, shareLinks } from "@/lib/share";

type Gen = {
  id: string;
  prompt: string;
  image_url: string | null;
  likes_count: number;
  tool_type: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
};

type Props = {
  gen: Gen;
  isLiked: boolean;
  onLike: (id: string) => void;
};

const CreationCard = ({ gen, isLiked, onLike }: Props) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const creator = gen.profiles?.display_name || "Anônimo";
  const publicUrl = `${window.location.origin}/create/${gen.id}`;
  const links = shareLinks(publicUrl, `Confira esta criação no StarFury AI: ${gen.prompt.slice(0, 80)}`);

  const handleRemix = () => {
    navigate(`/tools?tool=image&prompt=${encodeURIComponent(gen.prompt)}&remix=${gen.id}`);
  };

  const handleCopy = async () => {
    if (await copyToClipboard(gen.prompt)) toast({ title: "Prompt copiado!" });
  };

  const handleShareCopy = async () => {
    if (await copyToClipboard(publicUrl)) toast({ title: "Link copiado!" });
    setShareOpen(false);
  };

  return (
    <div className="break-inside-avoid mb-4 rounded-xl border border-border bg-card overflow-hidden group relative">
      {gen.image_url && (
        <Link to={`/create/${gen.id}`} className="block relative">
          <img src={gen.image_url} alt={gen.prompt} className="w-full" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <Eye className="h-5 w-5 text-white" />
          </div>
        </Link>
      )}
      <div className="p-3 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{gen.prompt}</p>
        <p className="text-[10px] text-muted-foreground/70">por {creator}</p>
        <div className="flex items-center gap-1 flex-wrap">
          <button onClick={() => onLike(gen.id)} className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"}`} aria-label="Curtir">
            <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-current" : ""}`} /> {gen.likes_count}
          </button>
          <button onClick={handleRemix} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors" aria-label="Remix">
            <Wand2 className="h-3.5 w-3.5" /> Remix
          </button>
          <button onClick={handleCopy} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Copiar prompt"><Copy className="h-3.5 w-3.5" /></button>
          {gen.image_url && (
            <a href={gen.image_url} download target="_blank" rel="noreferrer" className="p-1 text-muted-foreground hover:text-foreground" aria-label="Download"><Download className="h-3.5 w-3.5" /></a>
          )}
          <div className="relative">
            <button onClick={() => setShareOpen(v => !v)} className="p-1 text-muted-foreground hover:text-foreground" aria-label="Compartilhar"><Share2 className="h-3.5 w-3.5" /></button>
            {shareOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-popover border border-border rounded-lg shadow-lg p-1 z-10 min-w-[140px]">
                <button onClick={handleShareCopy} className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-muted">Copiar link</button>
                <a href={links.twitter} target="_blank" rel="noreferrer" className="block text-xs px-2 py-1.5 rounded hover:bg-muted">Twitter / X</a>
                <a href={links.reddit} target="_blank" rel="noreferrer" className="block text-xs px-2 py-1.5 rounded hover:bg-muted">Reddit</a>
                <a href={links.whatsapp} target="_blank" rel="noreferrer" className="block text-xs px-2 py-1.5 rounded hover:bg-muted">WhatsApp</a>
              </div>
            )}
          </div>
          <Link to={`/create/${gen.id}`} className="p-1 text-muted-foreground hover:text-foreground ml-auto" aria-label="Ver detalhes"><Eye className="h-3.5 w-3.5" /></Link>
        </div>
      </div>
    </div>
  );
};

export default CreationCard;
