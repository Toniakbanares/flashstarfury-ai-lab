import { useEffect, useRef, useState } from "react";
import { downloadText } from "@/lib/musicStore";
import { toast } from "sonner";

const SheetMusic = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [notes, setNotes] = useState("c/4 d/4 e/4 f/4 g/4 a/4 b/4 c/5");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { Renderer, Stave, StaveNote, Voice, Formatter } = await import("vexflow");
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      try {
        const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
        renderer.resize(560, 160);
        const ctx = renderer.getContext();
        const stave = new Stave(10, 20, 540); stave.addClef("treble").addTimeSignature("4/4"); stave.setContext(ctx).draw();
        const parsed = notes.split(/\s+/).filter(Boolean).slice(0, 8).map((n) => new StaveNote({ keys: [n], duration: "q" }));
        const voice = new Voice({ numBeats: parsed.length, beatValue: 4 }); voice.addTickables(parsed);
        new Formatter().joinVoices([voice]).format([voice], 500);
        voice.draw(ctx, stave);
      } catch (e) {
        if (containerRef.current) containerRef.current.textContent = "Invalid notes. Use format like: c/4 d/4 e/4";
      }
    })();
    return () => { cancelled = true; };
  }, [notes]);

  const exportMusicXML = () => {
    const noteList = notes.split(/\s+/).filter(Boolean);
    const xmlNotes = noteList.map((n) => {
      const [step, octave] = n.split("/");
      return `<note><pitch><step>${step[0].toUpperCase()}</step><octave>${octave || 4}</octave></pitch><duration>1</duration><type>quarter</type></note>`;
    }).join("\n");
    const xml = `<?xml version="1.0"?>\n<score-partwise version="3.1"><part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>${xmlNotes}</measure></part></score-partwise>`;
    downloadText(xml, "score.musicxml");
    toast.success("MusicXML downloaded");
  };

  const exportMIDI = () => {
    // Minimal type-0 MIDI: single track with the notes as quarter notes at 120 BPM
    const NOTE_MAP: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const noteList = notes.split(/\s+/).filter(Boolean);
    const events: number[] = [];
    const push = (arr: number[]) => events.push(...arr);
    const vlq = (n: number) => { const buf: number[] = []; buf.unshift(n & 0x7f); n >>= 7; while (n) { buf.unshift(0x80 | (n & 0x7f)); n >>= 7; } return buf; };
    noteList.forEach((n) => {
      const [pc, oc] = n.split("/"); const midi = 12 * (parseInt(oc || "4") + 1) + (NOTE_MAP[pc[0].toLowerCase()] ?? 0);
      push([0x00, 0x90, midi, 0x60]); push([...vlq(480), 0x80, midi, 0x40]);
    });
    push([0x00, 0xff, 0x2f, 0x00]);
    const trackLen = events.length;
    const header = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0];
    const trackHead = [0x4d, 0x54, 0x72, 0x6b, (trackLen >> 24) & 0xff, (trackLen >> 16) & 0xff, (trackLen >> 8) & 0xff, trackLen & 0xff];
    const bytes = new Uint8Array([...header, ...trackHead, ...events]);
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/midi" }));
    const a = document.createElement("a"); a.href = url; a.download = "score.mid"; a.click(); URL.revokeObjectURL(url);
    toast.success("MIDI downloaded");
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-muted-foreground">Notes (e.g. c/4 d/4 e/4)</label>
      <input value={notes} onChange={(e) => setNotes(e.target.value)}
        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/40" />
      <div className="rounded-lg border border-border bg-white p-3 overflow-x-auto">
        <div ref={containerRef} />
      </div>
      <div className="flex gap-2">
        <button onClick={exportMusicXML} className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40">Export MusicXML</button>
        <button onClick={exportMIDI} className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium hover:border-primary/40">Export MIDI</button>
      </div>
    </div>
  );
};

export default SheetMusic;
