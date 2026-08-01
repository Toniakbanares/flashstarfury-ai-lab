import { useEffect, useState } from "react";
import { Music, Feather, FileText, Guitar, ScrollText, Rocket, ImageIcon, Database, LayoutDashboard, Sparkles } from "lucide-react";
import SongGenerator from "@/components/music/SongGenerator";
import Songwriter from "@/components/music/Songwriter";
import LyricsTools from "@/components/music/LyricsTools";
import ChordsTabs from "@/components/music/ChordsTabs";
import SheetMusic from "@/components/music/SheetMusic";
import PublishingAssistant from "@/components/music/PublishingAssistant";
import CoverDesigner from "@/components/music/CoverDesigner";
import MetadataTab from "@/components/music/MetadataTab";
import MusicDashboard from "@/components/music/MusicDashboard";

const TABS = [
  { id: "generator", label: "Gerar Música", icon: Sparkles, Comp: SongGenerator },
  { id: "songwriter", label: "Songwriter", icon: Feather, Comp: Songwriter },
  { id: "lyrics", label: "Lyrics Tools", icon: FileText, Comp: LyricsTools },
  { id: "chords", label: "Chords & Tabs", icon: Guitar, Comp: ChordsTabs },
  { id: "sheet", label: "Sheet Music", icon: ScrollText, Comp: SheetMusic },
  { id: "publishing", label: "Publishing", icon: Rocket, Comp: PublishingAssistant },
  { id: "cover", label: "Cover Designer", icon: ImageIcon, Comp: CoverDesigner },
  { id: "metadata", label: "Metadata", icon: Database, Comp: MetadataTab },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, Comp: MusicDashboard },
] as const;


const MusicStudio = () => {
  const [active, setActive] = useState<typeof TABS[number]["id"]>("generator");


  useEffect(() => {
    document.title = "AI Music Studio — StarFury AI";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Write lyrics, generate chords, design covers, and prepare music releases with StarFury AI Music Studio.");
  }, []);

  const Comp = TABS.find((t) => t.id === active)!.Comp;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5"><Music className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="font-heading text-2xl font-bold gradient-text">AI Music Studio</h1>
          <p className="text-xs text-muted-foreground">Songwriting, chords, cover art & release prep — powered by StarFury AI.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 mb-6 border-b border-border pb-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActive(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              active === id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      <Comp />
    </div>
  );
};

export default MusicStudio;
