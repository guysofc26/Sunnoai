export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      perfis: {
        Row: {
          id: string
          email: string
          nome: string
          signo: string | null
          plano: 'gratis' | 'pro'
          creditos: number
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          nome: string
          signo?: string | null
          plano?: 'gratis' | 'pro'
          creditos?: number
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          signo?: string | null
          plano?: 'gratis' | 'pro'
          creditos?: number
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sonhos: {
        Row: {
          id: string
          user_id: string
          descricao: string
          horario: string | null
          tipo: string | null
          interpretacao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          descricao: string
          horario?: string | null
          tipo?: string | null
          interpretacao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          descricao?: string
          horario?: string | null
          tipo?: string | null
          interpretacao?: string | null
          created_at?: string
        }
      }
      assinaturas: {
        Row: {
          id: string
          user_id: string
          stripe_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'pendente' | 'ativo' | 'cancelado'
          plano: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'pendente' | 'ativo' | 'cancelado'
          plano?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: 'pendente' | 'ativo' | 'cancelado'
          plano?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
