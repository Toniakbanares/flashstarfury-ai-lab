
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User credits table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  last_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own credits" ON public.user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own credits" ON public.user_credits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own credits" ON public.user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Generations table
CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT,
  result_text TEXT,
  tool_type TEXT NOT NULL DEFAULT 'image',
  is_public BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public generations visible to all" ON public.generations FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can create own generations" ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON public.generations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own generations" ON public.generations FOR DELETE USING (auth.uid() = user_id);

-- Likes table
CREATE TABLE public.generation_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  generation_id UUID REFERENCES public.generations(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, generation_id)
);
ALTER TABLE public.generation_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view likes" ON public.generation_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.generation_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.generation_likes FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.raw_user_meta_data->>'avatar_url');
  INSERT INTO public.user_credits (user_id, credits_remaining, last_reset_at)
  VALUES (NEW.id, 5, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment likes
CREATE OR REPLACE FUNCTION public.increment_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.generations SET likes_count = likes_count + 1 WHERE id = NEW.generation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.decrement_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.generations SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.generation_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_like_added AFTER INSERT ON public.generation_likes FOR EACH ROW EXECUTE FUNCTION public.increment_likes();
CREATE TRIGGER on_like_removed AFTER DELETE ON public.generation_likes FOR EACH ROW EXECUTE FUNCTION public.decrement_likes();

-- Enable realtime for generations
ALTER PUBLICATION supabase_realtime ADD TABLE public.generations;
