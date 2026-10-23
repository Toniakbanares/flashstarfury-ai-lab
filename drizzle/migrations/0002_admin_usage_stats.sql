CREATE OR REPLACE FUNCTION public.admin_usage_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN jsonb_build_object(
    'users', (SELECT count(*) FROM public.profiles),
    'users_7d', (SELECT count(*) FROM public.profiles WHERE created_at > now() - interval '7 days'),
    'generations', (SELECT count(*) FROM public.generations),
    'generations_7d', (SELECT count(*) FROM public.generations WHERE created_at > now() - interval '7 days'),
    'generations_by_type', COALESCE((SELECT jsonb_object_agg(tool_type, c) FROM (SELECT tool_type, count(*) c FROM public.generations GROUP BY tool_type) t), '{}'::jsonb),
    'posts', (SELECT count(*) FROM public.community_posts),
    'posts_7d', (SELECT count(*) FROM public.community_posts WHERE created_at > now() - interval '7 days'),
    'reports', (SELECT count(*) FROM public.community_reports),
    'leads', (SELECT count(*) FROM public.leads)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_usage_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_usage_stats() TO authenticated;