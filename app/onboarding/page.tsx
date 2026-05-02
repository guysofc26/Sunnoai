'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/browser';
import { useAuth } from '@/components/AuthProvider';
import { Star, Moon, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import type { Signo } from '@/lib/types';

interface SignoOption {
  id: Signo;
  nome: string;
  periodo: string;
  simbolo: string;
}

const signos: SignoOption[] = [
  { id: 'aries', nome: 'Áries', periodo: '21/03 - 19/04', simbolo: '♈' },
  { id: 'touro', nome: 'Touro', periodo: '20/04 - 20/05', simbolo: '♉' },
  { id: 'gemeos', nome: 'Gêmeos', periodo: '21/05 - 20/06', simbolo: '♊' },
  { id: 'cancer', nome: 'Câncer', periodo: '21/06 - 22/07', simbolo: '♋' },
  { id: 'leao', nome: 'Leão', periodo: '23/07 - 22/08', simbolo: '♌' },
  { id: 'virgem', nome: 'Virgem', periodo: '23/08 - 22/09', simbolo: '♍' },
  { id: 'libra', nome: 'Libra', periodo: '23/09 - 22/10', simbolo: '♎' },
  { id: 'escorpiao', nome: 'Escorpião', periodo: '23/10 - 21/11', simbolo: '♏' },
  { id: 'sagitario', nome: 'Sagitário', periodo: '22/11 - 21/12', simbolo: '♐' },
  { id: 'capricornio', nome: 'Capricórnio', periodo: '22/12 - 19/01', simbolo: '♑' },
  { id: 'aquario', nome: 'Aquário', periodo: '20/01 - 18/02', simbolo: '♒' },
  { id: 'peixes', nome: 'Peixes', periodo: '19/02 - 20/03', simbolo: '♓' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, perfil, loading, refreshPerfil } = useAuth();
  const [nome, setNome] = useState('');
  const [signoSelecionado, setSignoSelecionado] = useState<Signo | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [step, setStep] = useState(1);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (loading) return;
    
    if (!user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
      return;
    }

    if (perfil?.onboarding_completed) {
      hasRedirectedRef.current = true;
      router.push('/dashboard');
      return;
    }

    if (perfil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (perfil.nome) setNome(perfil.nome);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (perfil.signo) setSignoSelecionado(perfil.signo as Signo);
    }
  }, [loading, user, perfil, router]);

  const handleNextStep = () => {
    if (nome.trim().length >= 2) {
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (!signoSelecionado || !user) return;

    setLoadingSubmit(true);
    try {
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: nome.trim(),
          signo: signoSelecionado,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshPerfil();
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { message: string };
      alert(error.message || 'Erro ao salvar. Tente novamente.');
      setLoadingSubmit(false);
    }
  };

  if (!user || loading || !perfil) {
    return (
      <div className="min-h-screen bg-[#0B0114] flex items-center justify-center">
        <div className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-400 animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0114] flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              step === 1
                ? 'bg-purple-500/20 border border-purple-500/50'
                : 'bg-yellow-500/20 border border-yellow-500/50'
            }`}
          >
            {step === 2 ? (
              <CheckCircle className="w-4 h-4 text-yellow-400" />
            ) : (
              <Star className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-sm text-white">Seu Nome</span>
          </motion.div>
          <div className="w-12 h-px bg-white/10" />
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              step === 2
                ? 'bg-purple-500/20 border border-purple-500/50'
                : 'bg-white/5 border border-white/5'
            }`}
          >
            <Moon className="w-4 h-4 text-purple-400" />
            <span className={`text-sm ${step === 2 ? 'text-white' : 'text-gray-500'}`}>Seu Signo</span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Como deseja ser chamado?
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
                    placeholder="Seu nome..."
                    autoFocus
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStep}
                  disabled={nome.trim().length < 2}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {signos.map((signo) => (
                  <motion.button
                    key={signo.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSignoSelecionado(signo.id)}
                    className={`p-3 rounded-xl border transition-all text-center ${
                      signoSelecionado === signo.id
                        ? 'bg-purple-500/30 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{signo.simbolo}</span>
                    <span className="text-xs text-gray-300 block">{signo.nome}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleComplete}
                disabled={!signoSelecionado || loadingSubmit}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
              >
                {loadingSubmit ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Conectando aos astros...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Iniciar Jornada
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setStep(1)}
                className="w-full mt-3 text-gray-400 hover:text-white text-sm transition-colors py-2"
              >
                Voltar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-600 text-xs mt-8 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3 h-3 text-yellow-500" />
          3 interpretações gratuitas incluídas
          <Sparkles className="w-3 h-3 text-yellow-500" />
        </motion.p>
      </div>
    </div>
  );
}
