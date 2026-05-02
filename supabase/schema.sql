-- =====================================================
-- SONNUS AI - Supabase Database Schema + TRIGGERS
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: perfis (user profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  nome TEXT NOT NULL DEFAULT '',
  signo TEXT,
  plano TEXT NOT NULL DEFAULT 'gratis',
  creditos INTEGER NOT NULL DEFAULT 3,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem atualizar seu próprio perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuários podem inserir seu próprio perfil" ON public.perfis;

CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.perfis FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.perfis FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir seu próprio perfil"
  ON public.perfis FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TABLE: sonhos (dream records)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sonhos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  horario TEXT,
  tipo TEXT,
  interpretacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sonhos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver seus próprios sonhos" ON public.sonhos;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios sonhos" ON public.sonhos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios sonhos" ON public.sonhos;

CREATE POLICY "Usuários podem ver seus próprios sonhos"
  ON public.sonhos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios sonhos"
  ON public.sonhos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios sonhos"
  ON public.sonhos FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- TABLE: assinaturas (subscription tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  plano TEXT NOT NULL DEFAULT 'pro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver suas próprias assinaturas" ON public.assinaturas;

CREATE POLICY "Usuários podem ver suas próprias assinaturas"
  ON public.assinaturas FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGER: Criar perfil automaticamente ao criar usuário
-- =====================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome, signo, plano, creditos, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NULL,
    'gratis',
    3,
    false
  );
  RETURN NEW;
END;
$$;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
