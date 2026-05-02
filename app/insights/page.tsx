'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Sparkles, LineChart, Brain, HeartPulse, Moon } from 'lucide-react';
import { gerarProjecaoSubconsciente } from '@/app/actions/insights';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function InsightsPage() {
  const router = useRouter();
  const { user, perfil, loading, signOut, refreshPerfil } = useAuth();
  const [analisando, setAnalisando] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (redirectedRef.current) return;
    if (loading) return;
    if (!user) {
      redirectedRef.current = true;
      router.push('/auth');
      return;
    }
    if (perfil && !perfil.onboarding_completed) {
      redirectedRef.current = true;
      router.push('/onboarding');
      return;
    }
  }, [loading, user, perfil, router]);

  const handleGerarProjecao = async () => {
    setAnalisando(true);
    setErrorMsg(null);
    setResultado(null);

    try {
      const res = await gerarProjecaoSubconsciente();
      
      if (!res.success) {
        throw new Error(res.message || res.error || 'Erro ao gerar projeção.');
      }
      
      setResultado(res.data);
      await refreshPerfil();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setAnalisando(false);
    }
  };

  if (loading || !user || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-purple-400 animate-pulse" />
      </div>
    );
  }

  const colors = ['#a875ff', '#8b3dff', '#6d28d9', '#4c1d95', '#2e1065'];

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <LineChart className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">Minha Projeção</h1>
        </div>

        {!resultado && !analisando && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 text-center"
          >
            <Brain className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Mapeie seu Subconsciente</h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Nossa IA analisa o histórico dos seus sonhos para identificar padrões repetitivos, emoções ocultas e como a sua vida desperta está influenciando suas noites.
            </p>
            
            {perfil.plano === 'gratis' && perfil.creditos <= 0 ? (
              <PremiumUpgrade />
            ) : (
              <button
                onClick={handleGerarProjecao}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                Gerar Projeção (Custa 1 crédito)
              </button>
            )}
            
            {errorMsg && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm max-w-md mx-auto">
                {errorMsg}
              </div>
            )}
          </motion.div>
        )}

        {analisando && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-12 text-center"
          >
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
              <LineChart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Lendo as Entrelinhas...</h3>
            <p className="text-gray-400">Vasculhando seu histórico de sonhos em busca de padrões.</p>
          </motion.div>
        )}

        {resultado && !analisando && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Gráfico */}
            <div className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" /> Temas Recorrentes
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultado.temasPrincipais} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <XAxis dataKey="nome" stroke="#a0a0c0" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                      contentStyle={{ backgroundColor: '#0a0a1a', border: '1px solid rgba(139,61,255,0.3)', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="quantidade" radius={[6, 6, 0, 0]} maxBarSize={60}>
                      {resultado.temasPrincipais.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Análise Geral */}
            <div className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Análise Profunda</h3>
              <p className="text-gray-300 leading-relaxed">
                {resultado.analiseGeral}
              </p>
            </div>

            {/* Sintomas e Dicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-red-400" /> Possíveis Gatilhos
                </h3>
                <ul className="space-y-3">
                  {resultado.sintomasInfluenciadores.map((sintoma: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-red-400 mt-0.5">•</span> {sintoma}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-400" /> Dicas de Higiene do Sono
                </h3>
                <ul className="space-y-3">
                  {resultado.dicasSaudeSono.map((dica: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                      <span className="text-indigo-400 mt-0.5">✨</span> {dica}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Aviso Legal */}
            <div className="px-6 py-4 bg-white/5 rounded-xl border border-white/10 text-center">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Aviso: Os insights gerados pela inteligência artificial têm caráter de autoconhecimento e bem-estar, 
                e não substituem o diagnóstico de um profissional de saúde, psicólogo ou médico do sono.
              </p>
            </div>
            
            <div className="flex justify-center pt-4">
              <button
                onClick={handleGerarProjecao}
                className="text-purple-400 hover:text-white transition-colors text-sm flex items-center gap-2"
              >
                <LineChart className="w-4 h-4" />
                Gerar Nova Projeção (1 crédito)
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
