import { Database } from '@/lib/supabase/database.types';

export type Perfil = Database['public']['Tables']['perfis']['Row'];
export type Sonho = Database['public']['Tables']['sonhos']['Row'];
export type Assinatura = Database['public']['Tables']['assinaturas']['Row'];

export type Signo =
  | 'aries'
  | 'touro'
  | 'gemeos'
  | 'cancer'
  | 'leao'
  | 'virgem'
  | 'libra'
  | 'escorpiao'
  | 'sagitario'
  | 'capricornio'
  | 'aquario'
  | 'peixes';
