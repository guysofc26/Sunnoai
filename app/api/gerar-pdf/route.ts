import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const signoLabels: Record<string, string> = {
  aries: 'Áries', touro: 'Touro', gemeos: 'Gêmeos', cancer: 'Câncer',
  leao: 'Leão', virgem: 'Virgem', libra: 'Libra', escorpiao: 'Escorpião',
  sagitario: 'Sagitário', capricornio: 'Capricórnio', aquario: 'Aquário', peixes: 'Peixes',
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { sonhoId } = await req.json();

    if (!sonhoId) {
      return NextResponse.json({ error: 'ID do sonho necessário' }, { status: 400 });
    }

    const { data: sonho } = await supabaseAdmin
      .from('sonhos')
      .select('*')
      .eq('id', sonhoId)
      .eq('user_id', user.id)
      .single();

    if (!sonho) {
      return NextResponse.json({ error: 'Sonho não encontrado' }, { status: 404 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('nome, signo')
      .eq('id', user.id)
      .single();

    const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Interpretação - Sonnus AI</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #0a0a1a; color: #f0f0ff; padding: 40px; max-width: 700px; margin: 0 auto; }
  .header { text-align: center; padding-bottom: 30px; border-bottom: 1px solid rgba(139,61,255,0.3); margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: 700; color: #a875ff; margin-bottom: 8px; }
  .subtitle { color: #a0a0c0; font-size: 14px; }
  .meta { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
  .meta-item { background: rgba(255,255,255,0.05); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
  .meta-label { font-size: 12px; color: #a0a0c0; margin-bottom: 4px; }
  .meta-value { font-size: 16px; font-weight: 600; }
  .sonho-section { background: rgba(255,255,255,0.03); padding: 24px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px; }
  .sonho-section h3 { color: #a875ff; font-size: 18px; margin-bottom: 12px; }
  .sonho-text { color: #d0d0e0; line-height: 1.7; }
  .interpretacao-section { padding: 24px 0; }
  .interpretacao-section h2 { color: #ffe91a; font-size: 20px; margin-bottom: 20px; }
  .interpretacao-content { color: #c0c0d0; line-height: 1.8; }
  .interpretacao-content h3 { color: #a875ff; font-size: 16px; margin: 24px 0 12px 0; }
  .interpretacao-content p { margin-bottom: 12px; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1); color: #666; font-size: 12px; }
  @media print { body { background: white; color: #1a1a2e; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">✦ Sonnus AI</div>
    <div class="subtitle">Oráculo Místico Ancestral dos Sonhos</div>
  </div>
  <div class="meta">
    <div class="meta-item"><div class="meta-label">Nome</div><div class="meta-value">${perfil?.nome || 'Buscante'}</div></div>
    <div class="meta-item"><div class="meta-label">Signo</div><div class="meta-value">${perfil?.signo ? signoLabels[perfil.signo] || perfil.signo : 'N/I'}</div></div>
    <div class="meta-item"><div class="meta-label">Data</div><div class="meta-value">${new Date(sonho.created_at).toLocaleDateString('pt-BR')}</div></div>
  </div>
  <div class="sonho-section">
    <h3>🌙 Seu Sonho</h3>
    <p class="sonho-text">${sonho.descricao}</p>
  </div>
  <div class="interpretacao-section">
    <h2>✨ Interpretação do Oráculo</h2>
    <div class="interpretacao-content">${sonho.interpretacao}</div>
  </div>
  <div class="footer">
    <p>Gerado por Sonnus AI • ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  <script>window.print();</script>
</body>
</html>`;

    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
