'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { createClient } from '@/lib/supabase/browser';
import { User, Mail, Key, Save, Moon, Crown, Trash2, AlertTriangle } from 'lucide-react';

const signoLabels: Record<string, string> = {
  aries: 'Áries', touro: 'Touro', gemeos: 'Gêmeos', cancer: 'Câncer',
  leao: 'Leão', virgem: 'Virgem', libra: 'Libra', escorpiao: 'Escorpião',
  sagitario: 'Sagitário', capricornio: 'Capricórnio', aquario: 'Aquário', peixes: 'Peixes',
};

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { user, perfil, signOut, loading, refreshPerfil } = useAuth();
  const [nome, setNome] = useState('');
  const [signo, setSigno] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erroSenha, setErroSenha] = useState('');
  const [senhaAtualizando, setSenhaAtualizando] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (perfil) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNome(perfil.nome);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSigno(perfil.signo || '');
    }
  }, [perfil]);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!loading && !user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
    }
  }, [loading, user, router]);

  const handleSalvarPerfil = async () => {
    if (!user || !nome.trim()) return;
    setSalvando(true);
    setSalvo(false);
    const supabase = createClient();
    const { error } = await supabase
      .from('perfis')
      .update({ nome: nome.trim(), signo: signo || null })
      .eq('id', user.id);

    if (error) {
      alert('Erro ao salvar: ' + error.message);
    } else {
      setSalvo(true);
      await refreshPerfil();
      setTimeout(() => setSalvo(false), 3000);
    }
    setSalvando(false);
  };

  const handleTrocarSenha = async () => {
    if (novaSenha.length < 6) {
      setErroSenha('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setErroSenha('');
    setSenhaAtualizando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    if (error) {
      setErroSenha(error.message);
    } else {
      setErroSenha('');
      setNovaSenha('');
      alert('Senha atualizada com sucesso!');
    }
    setSenhaAtualizando(false);
  };

  const handleDeletarConta = async () => {
    if (!user) return;
    const supabase = createClient();
    await supabase.from('sonhos').delete().eq('user_id', user.id);
    await supabase.from('perfis').delete().eq('id', user.id);
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
          <Moon className="w-12 h-12 text-purple-400 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <User className="w-7 h-7 text-purple-400" />
            Configurações
          </h1>

          {/* Perfil */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Meu Perfil
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 text-gray-300 border border-white/10">
                  <Mail className="w-4 h-4 text-gray-500" />
                  {user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Signo</label>
                <select
                  value={signo}
                  onChange={(e) => setSigno(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione seu signo</option>
                  {Object.entries(signoLabels).map(([id, label]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    Plano
                  </div>
                  <p className="text-white font-semibold mt-1">
                    {perfil.plano === 'pro' ? 'Pro Ilimitado' : 'Gratuito'}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Moon className="w-4 h-4 text-purple-400" />
                    Créditos
                  </div>
                  <p className="text-white font-semibold mt-1">
                    {perfil.plano === 'pro' ? 'Ilimitado' : `${perfil.creditos} restantes`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSalvarPerfil}
                disabled={salvando || !nome.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all"
              >
                <Save className="w-4 h-4" />
                {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar Alterações'}
              </button>
            </div>
          </div>

          {/* Trocar Senha */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              Trocar Senha
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nova Senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>

              {erroSenha && (
                <p className="text-red-400 text-sm">{erroSenha}</p>
              )}

              <button
                onClick={handleTrocarSenha}
                disabled={senhaAtualizando || !novaSenha}
                className="w-full bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/15 transition-all disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {senhaAtualizando ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Ao deletar sua conta, todos os seus dados e sonhos serão removidos permanentemente.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-500/20 border border-red-500/50 text-red-400 font-semibold py-2 px-4 rounded-xl hover:bg-red-500/30 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Deletar Minha Conta
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-red-300 text-sm font-semibold">Tem certeza? Esta ação é irreversível!</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeletarConta}
                    className="bg-red-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-red-700 transition-all"
                  >
                    Sim, deletar
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-white/10 text-gray-300 font-semibold py-2 px-6 rounded-xl hover:bg-white/15 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
