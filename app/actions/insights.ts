'use server';

import { GoogleGenAI } from '@google/genai';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null;

const client = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

export async function gerarProjecaoSubconsciente() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Não autorizado' };
    }

    if (!supabaseAdmin) {
      return { success: false, error: 'Configuração do servidor incompleta' };
    }

    const { data: perfil } = await supabaseAdmin
      .from('perfis')
      .select('plano, creditos, nome')
      .eq('id', user.id)
      .single();

    if (!perfil) {
      return { success: false, error: 'Perfil não encontrado' };
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      return { success: false, error: 'Créditos esgotados. Faça upgrade para gerar sua projeção!' };
    }

    // Busca os últimos 15 sonhos
    const { data: sonhos } = await supabaseAdmin
      .from('sonhos')
      .select('descricao, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15);

    if (!sonhos || sonhos.length < 3) {
      return { 
        success: false, 
        error: 'not_enough_data', 
        message: 'Para uma projeção precisa, precisamos de padrões. Registre pelo menos 3 sonhos primeiro.' 
      };
    }

    if (!client) {
      return { success: false, error: 'Configuração da IA incompleta no servidor.' };
    }

    const sonhosFormatados = sonhos.map((s, i) => `Sonho ${i + 1} (${new Date(s.created_at).toLocaleDateString()}): ${s.descricao}`).join('\n\n');

    const promptText = `Atue como um analista místico e psicólogo junguiano. 
Você está analisando os últimos sonhos de ${perfil.nome}. 
Leia-os atentamente e encontre os padrões ocultos.

SONHOS:
${sonhosFormatados}

Retorne um JSON ESTRITAMENTE com a seguinte estrutura:
{
  "temasPrincipais": [
    { "nome": "Ex: Fuga/Ansiedade", "quantidade": 5 },
    { "nome": "Ex: Água/Renascimento", "quantidade": 3 }
  ],
  "analiseGeral": "Um parágrafo místico mas direto explicando a fase mental que a pessoa está passando baseado no acúmulo desses sonhos.",
  "sintomasInfluenciadores": ["Lista de 3 a 4 possíveis sintomas ou gatilhos da vida real que estão causando esses sonhos (ex: Estresse financeiro, Esgotamento)."],
  "dicasSaudeSono": ["Lista de 3 a 4 dicas práticas/esotéricas para melhorar a higiene do sono (ex: Meditar 5 min, Evitar telas)."]
}
IMPORTANTE: "temasPrincipais" deve ter no máximo 5 itens. A "quantidade" deve refletir o "peso" daquele tema nas repetições (de 1 a 10). O texto de analiseGeral deve ser cativante.`;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error('IA retornou vazio');

    const resultData = JSON.parse(jsonText);

    // Desconto de crédito (1 por análise pesada)
    if (perfil.plano === 'gratis') {
      await supabaseAdmin
        .from('perfis')
        .update({ creditos: perfil.creditos - 1 })
        .eq('id', user.id);
    }

    return { success: true, data: resultData };

  } catch (error: any) {
    console.error('Erro ao gerar projeção:', error);
    
    // Tratamento específico para erro 429 (Rate Limit do Gemini Free Tier)
    if (error.message?.includes('429') || error.status === 429) {
      return { success: false, error: 'O Oráculo está sobrecarregado no momento (Limite da API do Google). Por favor, aguarde cerca de 1 minuto e tente novamente.' };
    }
    
    return { success: false, error: 'Erro interno ao consultar os padrões do subconsciente.' };
  }
}
