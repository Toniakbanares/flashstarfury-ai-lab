# Architecture rules
- Community uploads use the private community bucket and short-lived signed links backed by published post access; public buckets are unavailable.
- Community ownership and moderation are enforced by database and storage policies; administrators are stored exclusively in public.user_roles, never client storage.
- Administrator privileges grant community moderation only; generation tools retain their existing provider selection and credit behavior.