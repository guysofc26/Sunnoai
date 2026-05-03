'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/browser';
import { Moon, ArrowLeft, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
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

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [signoSelecionado, setSignoSelecionado] = useState<Signo | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        doneRef.current = true;
        router.push('/dashboard');
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const supabase = createClient();
      if (isSignUp) {
        if (!nome.trim() || !signoSelecionado) {
          setError('Por favor, preencha seu nome e selecione seu signo.');
          setLoading(false);
          return;
        }

        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nome: nome.trim(),
              signo: signoSelecionado,
              onboarding_completed: true,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: perfil } = await supabase
            .from('perfis')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

          setTimeout(() => {
            if (perfil?.onboarding_completed) {
              router.push('/dashboard');
            } else {
              router.push('/onboarding');
            }
          }, 100);
        }
      }
    } catch (err: unknown) {
      const authError = err as { message: string };
      setError(authError.message || 'Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0114] flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-8">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar à Landing</span>
        </Link>

        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Moon className="w-16 h-16 text-purple-400 animate-pulse" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold tracking-tight mb-2"
          >
            SONNUS<span className="text-purple-400">AI</span>
          </motion.h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Oráculo Ancestral dos Sonhos
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <h2 className="text-xl font-semibold mb-6 text-center">
            {isSignUp ? 'Crie sua Conta' : 'Retorne ao Portal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Como deseja ser chamado?</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Selecione seu signo</label>
                  <div className="grid grid-cols-4 gap-2">
                    {signos.map((signo) => (
                      <button
                        key={signo.id}
                        type="button"
                        onClick={() => setSignoSelecionado(signo.id)}
                        className={`p-2 rounded-xl border transition-all text-center ${
                          signoSelecionado === signo.id
                            ? 'bg-purple-500/30 border-purple-500'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        }`}
                      >
                        <span className="text-xl block">{signo.simbolo}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm text-center"
              >
                {success}
              </motion.p>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Conectando...
                </span>
              ) : isSignUp ? 'Criar Conta' : 'Entrar'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors"
            >
              {isSignUp ? 'Já possui uma conta? Entrar' : 'Não possui conta? Criar agora'}
            </button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-600 text-xs mt-8 flex items-center justify-center gap-2"
        >
          <Star className="w-3 h-3 text-yellow-500" />
          3 interpretações gratuitas ao se registrar
          <Star className="w-3 h-3 text-yellow-500" />
        </motion.p>
      </motion.div>
    </div>
  );
}
