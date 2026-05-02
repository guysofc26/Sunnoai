import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const contextosSignos: Record<string, string> = {
  aries: 'Áries é regido por Marte, elemento Fogo. Sonhos envolvem ação, conflito, liderança e novos começos.',
  touro: 'Touro é regido por Vênus, elemento Terra. Sonhos envolvem estabilidade, prazeres sensoriais, natureza e segurança.',
  gemeos: 'Gêmeos é regido por Mercúrio, elemento Ar. Sonhos envolvem comunicação, dualidade, conexões e aprendizado.',
  cancer: 'Câncer é regido pela Lua, elemento Água. Sonhos envolvem família, emoções profundas, lar e memória ancestral.',
  leao: 'Leão é regido pelo Sol, elemento Fogo. Sonhos envolvem criatividade, expressão pessoal, reconhecimento e liderança.',
  virgem: 'Virgem é regido por Mercúrio, elemento Terra. Sonhos envolvem ordem, saúde, serviço e análise detalhada.',
  libra: 'Libra é regido por Vênus, elemento Ar. Sonhos envolvem equilíbrio, relacionamentos, beleza e justiça.',
  escorpiao: 'Escorpião é regido por Plutão, elemento Água. Sonhos envolvem transformação, mistério, profundidade emocional e renascimento.',
  sagitario: 'Sagitário é regido por Júpiter, elemento Fogo. Sonhos envolvem aventura, filosofia, viagens e expansão de consciência.',
  capricornio: 'Capricórnio é regido por Saturno, elemento Terra. Sonhos envolvem ambição, disciplina, responsabilidade e conquistas.',
  aquario: 'Aquário é regido por Urano, elemento Ar. Sonhos envolvem inovação, coletividade, visões futuristas e liberdade.',
  peixes: 'Peixes é regido por Netuno, elemento Água. Sonhos envolvem espiritualidade, intuição, criatividade e conexão com o infinito.',
};

const contextosHorario: Record<string, string> = {
  noite: 'Sonhos noturnos são mais profundos e conectados ao inconsciente coletivo.',
  madrugada: 'Sonhos na madrugada são considerados os mais proféticos e espiritualmente significativos.',
  cochilo: 'Sonhos de cochilo são mais leves e trazem mensagens diretas sobre o momento presente.',
};

const contextosTipo: Record<string, string> = {
  pesadelo: 'Pesadelos são avisos do inconsciente, revelando medos que precisam ser transformados em poder.',
  lucido: 'Sonhos lúcidos são portais de consciência elevada para receber mensagens diretas do universo.',
  profetico: 'Sonhos proféticos são vislumbres do destino com orientações ancestrais.',
  comum: 'Sonhos comuns carregam sabedoria sutil revelando padrões ocultos na rotina.',
};

function interpretacaoModoTeste(nome: string, signo: string, sonho: string, horario: string | null, tipo: string | null): string {
  const signoCapitalizado = signo.charAt(0).toUpperCase() + signo.slice(1);
  return `## 🌟 O que o Universo diz

${nome}, seu sonho revela uma profunda conexão com suas emoções mais internas. Os símbolos que apareceram durante seu sono indicam que você está passando por um momento de **transformação pessoal**. O universo está te dizendo que é hora de confiar mais na sua intuição e permitir que sua verdadeira essência brilhe.

Os elementos do seu sonho sugerem que há oportunidades escondidas ao seu redor — basta abrir os olhos para enxergá-las. A energia cósmica neste momento está alinhada para favorecer novos começos.

## ✨ Influência Astral de ${signoCapitalizado}

Como ${signoCapitalizado}, você possui uma conexão natural com as forças que governam o mundo dos sonhos. ${contextosSignos[signo] || ''}

Neste momento, as estrelas indicam que sua regência astrológica está especialmente ativa, amplificando a mensagem deste sonho. Preste atenção aos sinais que aparecem em seu cotidiano — eles são ecos do que seu subconsciente já sabe.

## 🕊️ Caminho de Luz

O oráculo aconselha que você reserve um momento de silêncio hoje para meditar sobre este sonho. Escreva suas impressões em um diário e observe como os padrões se revelam ao longo do tempo.

**Ritual sugerido:** Acenda uma vela antes de dormir e peça clareza aos astros. Mantenha um copo d'água ao lado da cama — a água amplifica a conexão com o mundo onírico.

*Lembre-se: cada sonho é uma carta do universo escrita especialmente para você.* ✨`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { sonho, nome, signo, horario, tipo } = body;

    if (!sonho || !nome || !signo) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Configuração do servidor incompleta' }, { status: 500 });
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return NextResponse.json({ error: 'Créditos esgotados. Faça upgrade!' }, { status: 403 });
    }

    let interpretacao: string;

    if (client) {
      let contextoAstrol = contextosSignos[signo] || '';
      if (horario && contextosHorario[horario]) contextoAstrol += ' ' + contextosHorario[horario];
      if (tipo && contextosTipo[tipo]) contextoAstrol += ' ' + contextosTipo[tipo];

      const signoCapitalizado = signo.charAt(0).toUpperCase() + signo.slice(1);

      const prompt = `Você é o Oráculo Místico Ancestral do Sonnus. Sua linguagem é poética, profunda e envolvente, mas sempre clara.

CONTEXTO: ${nome} | Signo: ${signoCapitalizado} | Horário: ${horario || 'N/I'} | Tipo: ${tipo || 'N/I'}

CONTEXTO ASTROLÓGICO: ${contextoAstrol}

SONHO: "${sonho}"

Responda em markdown com exatamente estas 3 seções (400-700 palavras total):

## 🌟 O que o Universo diz
[Interpretação profunda do sonho. Símbolos, arquétipos e mensagens ocultas.]

## ✨ Influência Astral de ${signoCapitalizado}
[Como ${signoCapitalizado} molda o significado deste sonho.]

## 🕊️ Caminho de Luz
[Conselho prático e inspirador. Ações concretas, rituais ou reflexões.]`;

      console.log('[interpretar] Chamando Gemini com novo SDK: gemini-2.5-flash');
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      interpretacao = response.text ?? '';

      if (!interpretacao) {
        console.error('[interpretar] Resposta vazia do Gemini');
        return NextResponse.json({ error: 'IA retornou resposta vazia' }, { status: 500 });
      }

      console.log('[interpretar] Gemini respondeu com sucesso, tamanho:', interpretacao.length);
    } else {
      console.error('[interpretar] GEMINI_API_KEY não configurada');
      return NextResponse.json({ error: 'Configuração da IA incompleta no servidor.' }, { status: 500 });
    }

    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    const { data: sonhoSalvo, error: insertError } = await supabaseAdmin.from('sonhos').insert({
      user_id: user.id,
      descricao: sonho,
      horario: horario || null,
      tipo: tipo || null,
      interpretacao,
    }).select('id').single();

    if (insertError || !sonhoSalvo) {
      return NextResponse.json({ interpretacao }, { status: 200 });
    }

    return NextResponse.json({ interpretacao, sonhoId: sonhoSalvo.id });
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string; code?: string; status?: number };
    console.error('Erro na interpretação:', err.message, err.stack);
    return NextResponse.json(
      { error: `Erro interno: ${err.message || 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}
