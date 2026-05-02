import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data?.user) {
      const { data: perfil } = await supabase
        .from('perfis')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single();

      if (!perfil) {
        await supabase.from('perfis').insert({
          id: data.user.id,
          email: data.user.email!,
          nome: '',
          plano: 'gratis',
          creditos: 3,
          onboarding_completed: false,
        });
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      if (!perfil.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
