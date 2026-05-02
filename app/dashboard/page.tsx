'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import DreamInput from '@/components/DreamInput';
import InterpretationDisplay from '@/components/InterpretationDisplay';
import QuickStats from '@/components/QuickStats';
import PremiumUpgrade from '@/components/PremiumUpgrade';
import { Sparkles, Moon } from 'lucide-react';
import { interpretarEIlustrarSonho } from '@/app/actions/dream';

export default function DashboardPage() {
  const router = useRouter();
  const { user, perfil, loading, signOut, refreshPerfil } = useAuth();
  const [interpretacao, setInterpretacao] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sonhoId, setSonhoId] = useState<string | null>(null);
  const [interpretando, setInterpretando] = useState(false);
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

  const handleInterpretar = useCallback(async (sonho: string, nome: string, signo: string, horario: string | null, tipo: string | null) => {
    setInterpretando(true);
    setInterpretacao(null);
    setImageUrl(null);

    try {
      const formData = new FormData();
      formData.append('sonho', sonho);
      formData.append('nome', nome);
      formData.append('signo', signo);
      if (horario) formData.append('horario', horario);
      if (tipo) formData.append('tipo', tipo);

      const data = await interpretarEIlustrarSonho(formData);

      if (!data.success) {
        throw new Error(data.error || 'Erro ao interpretar');
      }

      setInterpretacao(data.interpretacao!);
      setImageUrl(data.imageUrl || null);
      setSonhoId(data.sonhoId || null);
      await refreshPerfil();
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error.message || 'Erro ao consultar o oráculo. Tente novamente.');
    } finally {
      setInterpretando(false);
    }
  }, [refreshPerfil]);

  if (loading || (user && !perfil)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          </motion.div>
          <p className="text-gray-400 animate-pulse">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !perfil) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickStats perfil={perfil} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DreamInput
              perfil={perfil}
              onInterpretar={handleInterpretar}
            />

            {perfil.plano === 'gratis' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <PremiumUpgrade />
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {interpretando ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Analisando e Desenhando...
                    </h3>
                    <p className="text-gray-400">
                      O oráculo está interpretando e ilustrando seu sonho...
                    </p>
                  </div>
                </motion.div>
              ) : interpretacao ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <InterpretationDisplay
                    interpretacao={interpretacao}
                    imageUrl={imageUrl}
                    sonhoId={sonhoId}
                    nome={perfil.nome}
                    signo={perfil.signo || ''}
                    onNovoSonho={() => { setInterpretacao(null); setImageUrl(null); setSonhoId(null); }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 min-h-[400px] flex items-center justify-center"
                >
                  <div className="text-center">
                    <Moon className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Seu Oráculo Pessoal
                    </h3>
                    <p className="text-gray-400/70 max-w-xs mx-auto">
                      Descreva seu sonho ao lado e receba uma interpretação mística personalizada.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
