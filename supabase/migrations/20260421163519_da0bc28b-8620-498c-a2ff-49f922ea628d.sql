-- Add slug for SEO-friendly URLs on offers/tools
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0;

-- Likes for offers/tools (separate from generation_likes)
CREATE TABLE IF NOT EXISTS public.offer_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (offer_id, user_id)
);

ALTER TABLE public.offer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view offer likes" ON public.offer_likes FOR SELECT USING (true);
CREATE POLICY "Users can like offers" ON public.offer_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike offers" ON public.offer_likes FOR DELETE USING (auth.uid() = user_id);

-- Triggers to keep offers.likes_count synced
CREATE OR REPLACE FUNCTION public.increment_offer_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.offers SET likes_count = likes_count + 1 WHERE id = NEW.offer_id; RETURN NEW; END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_offer_likes()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.offers SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.offer_id; RETURN OLD; END;
$$;

DROP TRIGGER IF EXISTS trg_offer_likes_inc ON public.offer_likes;
DROP TRIGGER IF EXISTS trg_offer_likes_dec ON public.offer_likes;
CREATE TRIGGER trg_offer_likes_inc AFTER INSERT ON public.offer_likes FOR EACH ROW EXECUTE FUNCTION public.increment_offer_likes();
CREATE TRIGGER trg_offer_likes_dec AFTER DELETE ON public.offer_likes FOR EACH ROW EXECUTE FUNCTION public.decrement_offer_likes();

-- Public RPC to increment views/clicks (anon-safe, no RLS issues)
CREATE OR REPLACE FUNCTION public.increment_offer_views(_offer_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.offers SET views_count = views_count + 1 WHERE id = _offer_id; END;
$$;

CREATE OR REPLACE FUNCTION public.increment_offer_clicks(_offer_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN UPDATE public.offers SET clicks_count = clicks_count + 1 WHERE id = _offer_id; END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_offer_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_offer_clicks(UUID) TO anon, authenticated;