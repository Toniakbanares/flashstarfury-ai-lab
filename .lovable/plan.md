## AI Music Studio — Plan

Adding a new `/music` module to PixelNova AI. Keeping branding, mascot, themes, and existing layout untouched.

### Scope (MVP, production-ready, no new paid APIs)

**Route:** `/music` with internal tabs (no route sprawl). Added to `AppNavbar` under Creative Studio.

**Tabs (single page, tab switcher):**
1. **Songwriter** — AI lyric writer / improver / rhymes / verse & chorus builder / translator (Lovable AI, `openai/gpt-5.5`).
2. **Lyrics Tools** — paste lyrics: syllable count (client), language detect (client heuristic + AI fallback), export TXT / PDF (jsPDF) / DOCX (docx lib). Audio transcription = UI stub w/ "coming soon" (needs paid Whisper — leave API-ready hook).
3. **Chords & Tabs** — AI-generated chord progression, key + BPM suggestions, simplified ASCII tab, harmony ideas.
4. **Sheet Music** — simple preview using VexFlow (free, client-side); MusicXML + MIDI export stubs with generated structure.
5. **Publishing Assistant** — form (artist, title, album, writers, producers, genre, subgenre, release date, language, copyright, publisher, ISRC, UPC) → AI generates Spotify/Apple/YouTube descriptions, release text, hashtags, SEO meta.
6. **Cover Designer** — square 1024×1024 covers via existing `generate-image` edge fn (Lovable AI image).
7. **Metadata** — JSON export (DDEX-ish) from Publishing form; copy/download.
8. **Dashboard** — projects/drafts/published/lyrics/artwork/downloads from localStorage.

### Storage
LocalStorage-only (`pixelnova_music_projects`). Keeps free, no schema changes. Structure: `{ id, title, artist, lyrics, chords, publishing, coverUrl, status: draft|published, createdAt }`.

### Backend
Reuse existing `chat` edge function for text tasks (Songwriter, Lyrics analysis, Chords, Publishing text). Reuse `generate-image` for covers. No new edge functions needed.

### Files to create
- `src/pages/MusicStudio.tsx` (main shell with tabs)
- `src/components/music/Songwriter.tsx`
- `src/components/music/LyricsTools.tsx`
- `src/components/music/ChordsTabs.tsx`
- `src/components/music/SheetMusic.tsx`
- `src/components/music/PublishingAssistant.tsx`
- `src/components/music/CoverDesigner.tsx`
- `src/components/music/MetadataTab.tsx`
- `src/components/music/MusicDashboard.tsx`
- `src/lib/musicStore.ts` (localStorage CRUD + exports)
- `src/lib/musicAi.ts` (thin wrappers around existing `streamChat` / `generateImage`)

### Files to modify
- `src/App.tsx` — add `/music` route.
- `src/components/AppNavbar.tsx` — add "Music" nav item.

### Deps to add
- `vexflow` (sheet preview), `jspdf` (PDF export), `docx` (DOCX export), `file-saver`.

### Out of scope (flagged in UI as coming soon)
- Real audio transcription (needs Whisper billing).
- Real MIDI/MusicXML render engines (we generate valid file structure but preview is basic).

Ready to build?