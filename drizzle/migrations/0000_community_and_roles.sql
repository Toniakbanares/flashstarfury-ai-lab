CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role app_role NOT NULL, UNIQUE(user_id, role));
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.community_posts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, title text NOT NULL, image_url text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.community_posts TO anon;
GRANT SELECT, INSERT, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users create own posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND char_length(title) BETWEEN 1 AND 120);
CREATE POLICY "Owner or admin deletes" ON public.community_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Public read community" ON storage.objects FOR SELECT USING (bucket_id = 'community');
CREATE POLICY "Users upload own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'community' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owner or admin delete files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'community' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));