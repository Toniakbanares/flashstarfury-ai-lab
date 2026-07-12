
# PixelNova AI — Creative Platform Upgrade

You selected all four priority blocks, OpenRouter as the text provider, and hybrid storage (local by default, sync to Cloud when logged in). That's ~15 new pages/modules plus a full audit. To keep quality high I'll ship it in 4 focused phases. Each phase leaves the app fully working; you review, then I move to the next.

**Non-negotiables preserved every phase:** PixelNova AI name, Lumy mascot, starry background, Dark/Light/Nature themes, existing navigation and routes.

---

## Phase 1 — Foundation (this turn)

Goal: everything downstream depends on these pieces.

1. **OpenRouter as primary text provider**
   - Update `supabase/functions/chat` to call OpenRouter with `OPENROUTER_API_KEY` (already set as a secret).
   - Model catalog: Claude 3.5 Sonnet, GPT-4o, Gemini 2.0 Flash, DeepSeek V3, Mistral Large, Llama 3.3 70B.
   - Fallback chain: OpenRouter → Lovable AI Gateway → readable error toast. Never crashes.
2. **Hybrid storage layer** — new `src/lib/hybridStore.ts`
   - Unified API `hybrid.get/set/list/remove(namespace, key)`.
   - Guest → localStorage. Logged in → Supabase table `user_data (user_id, namespace, key, value jsonb)` with RLS + GRANTs.
   - Auto-migrates local data to Cloud on first sign-in.
3. **Global audit pass**
   - Add `ErrorBoundary` wrapping `<Outlet />`.
   - Add `aria-label` to every icon-only button across Navbar, ChatSection, AILabSection, Explore, music tabs.
   - `h-screen` → `h-dvh` on full-height layouts.
   - Remove dead code: unused `Index.tsx`, duplicate `Navbar.tsx` (keeping `AppNavbar`), `demoCreations` (empty state instead of fake content, matching your "no fake content" rule for Explore).
   - Toast on every API failure with actionable message.

## Phase 2 — Creative Studio upgrade

Extends existing `AILabSection` (no visual redesign):
- Add fields: **Negative Prompt**, **Style** (dropdown from Style Library), **Progress bar** with percentage.
- Per-generation actions: **Favorite**, **Remix**, **Share** (copy link + native share), **Download** (already exists, hardened).
- **History drawer** — last 50 generations per module, filterable, restorable.
- New modules exposed as tabs: **Background Removal** and **Upscale** (FAL `birefnv2` and `clarity-upscaler`). Both fall back gracefully if `FAL_API_KEY` fails.

## Phase 3 — Prompt Lab + Prompt Chains

New route `/prompts`:
- **Builder** (variables via `{{var}}`), **Optimizer**, **Improver**, **Translator**, **Analyzer** (token count, clarity score via LLM).
- **Library** with categories, tags, favorites, version history — hybrid storage.
- **Import/Export** MD / JSON / TXT.
- **Chains** editor: DAG of steps (Idea → Research → Story → Storyboard → Image → Video → Thumbnail → SEO). Each step selects a module + prompt template; output of previous steps is injected as variables. Save as reusable workflow, run with live per-step progress.

## Phase 4 — Storyboard + Characters + Styles + Project Workspace

New routes:
- `/storyboard` — panel grid + timeline view. Each panel: title, description, characters, dialogue, camera, lens, lighting, emotion, image/video/negative prompt, notes. Actions: duplicate, move, delete, remix, generate image, generate video. PDF export via `jspdf`.
- `/characters` — reusable character sheets (appearance, age, personality, voice, style, clothes, accessories, refs).
- `/styles` — built-in styles (Realistic, Comic, Anime, Watercolor, Low-Poly, Oil, Fantasy, Sci-Fi, Pixel Art, Minimal, Cinematic, Studio) + user customs.
- `/projects` — workspace tying together images, videos, music, storyboards, prompts, chains, characters, styles, notes; searchable.

Later polish pass (after Phase 4 lands): Export Center, Account/Settings surface, Productivity (tasks/notes/inbox), performance audit (React.lazy on all heavy routes, image `loading="lazy"`, memoization).

---

## Technical notes

- **Storage schema (Phase 1):**
  ```sql
  CREATE TABLE public.user_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    namespace text NOT NULL,
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(user_id, namespace, key)
  );
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_data TO authenticated;
  GRANT ALL ON public.user_data TO service_role;
  ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "own data" ON public.user_data
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  ```
- OpenRouter models kept to the ones the current `ChatSection` already exposes (Claude/GPT/Gemini/DeepSeek/Mistral) so the UI selector doesn't change.
- All new pages reuse existing tokens (`bg-card`, `text-foreground`, `border-border`, `text-primary`) — no new colors, no font changes.
- No `.env` edits, no `client.ts` edits, no `supabase/config.toml` edits.

## Confirm to start Phase 1

Reply "go" and I'll ship Phase 1 in the next turn. If you'd rather I start with a different phase (e.g. jump straight to Storyboard), say which.
