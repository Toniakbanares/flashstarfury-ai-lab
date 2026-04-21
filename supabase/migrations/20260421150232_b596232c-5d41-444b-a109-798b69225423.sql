-- OFFERS table
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  category TEXT NOT NULL DEFAULT 'AI Tools',
  url TEXT NOT NULL,
  image_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  benefits TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  clicks_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active offers viewable by all" ON public.offers
  FOR SELECT USING (is_active = true);

CREATE INDEX idx_offers_category ON public.offers(category);
CREATE INDEX idx_offers_featured ON public.offers(is_featured) WHERE is_featured = true;

-- SAVED OFFERS
CREATE TABLE public.saved_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, offer_id)
);

ALTER TABLE public.saved_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saved" ON public.saved_offers
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users save offers" ON public.saved_offers
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users unsave offers" ON public.saved_offers
  FOR DELETE USING (auth.uid() = user_id);

-- LEADS
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  source TEXT NOT NULL DEFAULT 'offerings_popup',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit lead" ON public.leads
  FOR INSERT WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_offers_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER offers_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.update_offers_updated_at();

-- Seed offers
INSERT INTO public.offers (title, description, long_description, category, url, tier, is_featured, is_new, benefits, tags) VALUES
('ChatGPT', 'Conversational AI por OpenAI', 'Assistente IA mais popular do mundo. Use para escrever, programar, brainstorm e mais.', 'AI Tools', 'https://chat.openai.com', 'free', true, false, ARRAY['Respostas inteligentes','Multilíngue','Integração com plugins'], ARRAY['chatbot','writing','code']),
('Midjourney', 'Geração de imagens IA premium', 'Cria imagens artísticas de altíssima qualidade via Discord.', 'AI Tools', 'https://midjourney.com', 'premium', true, false, ARRAY['Qualidade fotográfica','Estilos variados','Comunidade ativa'], ARRAY['image','art','design']),
('Notion AI', 'Workspace com IA integrada', 'Notion + IA para escrever, resumir e organizar notas automaticamente.', 'Income Tools', 'https://notion.so', 'premium', true, false, ARRAY['Resumos automáticos','Tradução','Templates'], ARRAY['productivity','notes']),
('Canva', 'Design gráfico fácil com IA', 'Ferramenta de design com Magic Studio para gerar imagens, textos e vídeos.', 'Templates', 'https://canva.com', 'free', false, true, ARRAY['Templates prontos','Magic Edit','Vídeos com IA'], ARRAY['design','templates','video']),
('Zapier', 'Automação sem código', 'Conecte 6000+ apps e automatize tarefas repetitivas com IA.', 'Automation', 'https://zapier.com', 'free', false, false, ARRAY['6000+ integrações','AI actions','Workflows visuais'], ARRAY['automation','workflow']),
('Coursera', 'Cursos de IA das melhores universidades', 'Aprenda IA, Machine Learning e Data Science com Stanford, Google e mais.', 'Courses', 'https://coursera.org', 'free', false, false, ARRAY['Certificados','Universidades top','Aulas em PT'], ARRAY['learning','ai','course']),
('Hugging Face', 'Modelos IA open-source gratuitos', 'Maior repositório de modelos IA gratuitos do mundo.', 'Free Resources', 'https://huggingface.co', 'free', false, true, ARRAY['Modelos grátis','API gratuita','Comunidade'], ARRAY['models','opensource']),
('Make.com', 'Automação visual avançada', 'Alternativa ao Zapier com mais flexibilidade e visual builder.', 'Automation', 'https://make.com', 'free', false, false, ARRAY['Visual workflows','Mais barato','Cenários complexos'], ARRAY['automation','no-code']);