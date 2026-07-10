import { useEffect, useState } from "react";
import { Trash2, Music, FileText, Image as ImageIcon, Download } from "lucide-react";
import { deleteProject, listDownloads, listProjects, saveProject, MusicProject } from "@/lib/musicStore";

const MusicDashboard = () => {
  const [projects, setProjects] = useState<MusicProject[]>([]);
  const [downloads, setDownloads] = useState<{ name: string; at: number }[]>([]);

  const refresh = () => { setProjects(listProjects()); setDownloads(listDownloads()); };
  useEffect(() => { refresh(); }, []);

  const togglePublish = (p: MusicProject) => {
    saveProject({ ...p, status: p.status === "published" ? "draft" : "published" }); refresh();
  };

  const drafts = projects.filter((p) => p.status === "draft");
  const published = projects.filter((p) => p.status === "published");
  const lyrics = projects.filter((p) => p.lyrics);
  const artwork = projects.filter((p) => p.coverUrl);

  const cards = [
    { label: "Projects", value: projects.length, icon: Music },
    { label: "Drafts", value: drafts.length, icon: FileText },
    { label: "Published", value: published.length, icon: Music },
    { label: "Lyrics", value: lyrics.length, icon: FileText },
    { label: "Artwork", value: artwork.length, icon: ImageIcon },
    { label: "Downloads", value: downloads.length, icon: Download },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-3">
            <Icon className="h-4 w-4 text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
            <p className="text-lg font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent Projects</h3>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet — create lyrics, covers or releases from the tabs above.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 12).map((p) => (
              <div key={p.id} className="rounded-lg border border-border bg-card p-3 flex gap-3">
                {p.coverUrl ? <img src={p.coverUrl} alt={p.title} className="h-14 w-14 rounded object-cover" loading="lazy" /> : <div className="h-14 w-14 rounded bg-muted flex items-center justify-center"><Music className="h-5 w-5 text-muted-foreground" /></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.artist}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => togglePublish(p)} className={`text-[10px] px-2 py-0.5 rounded ${p.status === "published" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{p.status}</button>
                    <button onClick={() => { deleteProject(p.id); refresh(); }} className="text-muted-foreground hover:text-destructive ml-auto"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {downloads.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Recent Downloads</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            {downloads.slice(0, 10).map((d, i) => (<li key={i} className="flex justify-between"><span>{d.name}</span><span>{new Date(d.at).toLocaleDateString()}</span></li>))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MusicDashboard;
