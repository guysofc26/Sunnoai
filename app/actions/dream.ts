'use server';

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

export async function interpretarEIlustrarSonho(formData: FormData) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Não autorizado' };
    }

    const sonho = formData.get('sonho') as string;
    const nome = formData.get('nome') as string;
    const signo = formData.get('signo') as string;
    const horario = formData.get('horario') as string | null;
    const tipo = formData.get('tipo') as string | null;

    if (!sonho || !nome || !signo) {
      return { success: false, error: 'Dados incompletos' };
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Configuração do servidor incompleta' };
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return { success: false, error: 'Créditos esgotados. Faça upgrade!' };
    }

    if (!client) {
      return { success: false, error: 'Configuração da IA incompleta no servidor.' };
    }

    // 1. Gera o Image Prompt rápido e conciso para não quebrar a URL da API
    const promptParaImagem = `Create a highly concise image generation prompt in English based on this dream. Focus ONLY on visual elements. MUST be under 200 characters total. NO introductory text. Dream: "${sonho}". End the prompt exactly with: minimalist stylized cartoon, clean lines, flat colors, dark background, dreamy atmosphere`;
    
    const imagePromptResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptParaImagem,
    });
    
    let imagePrompt = imagePromptResponse.text?.trim() || 'A surreal dreamscape, minimalist stylized cartoon, clean lines, flat colors, dark background, dreamy atmosphere';
    
    // Filtro rigoroso: remove caracteres que possam quebrar a requisição
    imagePrompt = imagePrompt
      .replace(/[^a-zA-Z0-9\s,.-]/g, '') 
      .replace(/\s+/g, ' ') 
      .substring(0, 200) 
      .trim();
    
    // Passamos a usar uma rota de PROXY interna (/api/proxy-image) para burlar AdBlockers e bloqueios de DNS no navegador do cliente!
    const imageUrl = `/api/proxy-image?prompt=${encodeURIComponent(imagePrompt)}`;

    // 2. Prepara o contexto astrológico para a Interpretação
    let contextoAstrol = contextosSignos[signo] || '';
    if (horario && contextosHorario[horario]) contextoAstrol += ' ' + contextosHorario[horario];
    if (tipo && contextosTipo[tipo]) contextoAstrol += ' ' + contextosTipo[tipo];
    const signoCapitalizado = signo.charAt(0).toUpperCase() + signo.slice(1);

    const promptInterpretacao = `Você é o Oráculo Místico Ancestral do Sonnus. Sua linguagem é poética, profunda e envolvente, mas sempre clara.

CONTEXTO: ${nome} | Signo: ${signoCapitalizado} | Horário: ${horario || 'N/I'} | Tipo: ${tipo || 'N/I'}

CONTEXTO ASTROLÓGICO: ${contextoAstrol}

SONHO: "${sonho}"

Responda em markdown com exatamente estas 3 seções.
REGRAS IMPORTANTES DE FORMATO E TAMANHO:
1. O texto total deve ter rigorosamente entre 200 a 300 palavras. Seja profundo, porém conciso e direto. Sem enrolação poética desnecessária.
2. Use parágrafos de respiro: NENHUM parágrafo deve ter mais que 3 linhas. Pule linhas com frequência para facilitar a leitura no celular.

## 🌌 O que o Universo diz
[Interpretação profunda do sonho. Símbolos e mensagens ocultas.]

## ✨ Influência Astral de ${signoCapitalizado}
[Como ${signoCapitalizado} molda o significado deste sonho.]

## 🕯️ Caminho de Luz
[Conselho prático, direto e inspirador. Ações ou reflexões curtas.]`;

    // 3. Execução Paralela: Gera Texto e preenche o dummy para Imagem (já que a imagem foi montada na string acima)
    const [interpretacaoResponse, fakeImageGen] = await Promise.all([
      client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptInterpretacao,
      }),
      Promise.resolve(imageUrl) // Opcionalmente, poderíamos disparar um fetch na URL para esquentar o cache do pollinations, mas o simples Promise.resolve atende o conceito pedido.
    ]);

    const interpretacao = interpretacaoResponse.text ?? '';

    if (!interpretacao) {
      return { success: false, error: 'IA retornou resposta vazia' };
    }

    // 4. Abate de créditos e salvamento
    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    // O schema atual de 'sonhos' não tem coluna image_url, então salvaremos as outras infos
    const { data: sonhoSalvo } = await supabaseAdmin.from('sonhos').insert({
      user_id: user.id,
      descricao: sonho,
      horario: horario || null,
      tipo: tipo || null,
      interpretacao,
    }).select('id').single();

    return { 
      success: true, 
      interpretacao, 
      imageUrl,
      sonhoId: sonhoSalvo?.id || null 
    };

  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Erro na action de sonho:', err.message);
    return { success: false, error: 'Erro interno no servidor' };
  }
}
