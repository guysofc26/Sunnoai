'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, Moon, Sparkles } from 'lucide-react';
import { Perfil } from '@/lib/types';

interface DreamInputProps {
  perfil: Perfil;
  onInterpretar: (sonho: string, nome: string, signo: string, horario: string | null, tipo: string | null) => Promise<void>;
}

export default function DreamInput({ perfil, onInterpretar }: DreamInputProps) {
  const [sonho, setSonho] = useState('');
  const [horario, setHorario] = useState<string | null>(null);
  const [tipo, setTipo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleInterpretar = async () => {
    if (!sonho.trim()) {
      setError('Por favor, descreva seu sonho.');
      return;
    }

    if (perfil.plano === 'gratis' && perfil.creditos <= 0) {
      setError('Seus créditos acabaram. Faça upgrade para o Plano Pro!');
      return;
    }

    setError('');
    setLocalLoading(true);

    try {
      await onInterpretar(sonho.trim(), perfil.nome, perfil.signo || '', horario, tipo);
      setSonho('');
    } catch {
      setError('Erro ao consultar o oráculo. Tente novamente.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Moon className="w-5 h-5 text-purple-400" />
        Descreva seu Sonho
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            O que você sonhou?
          </label>
          <textarea
            value={sonho}
            onChange={(e) => setSonho(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white min-h-[150px] resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
            placeholder="Descreva seu sonho com o máximo de detalhes possível..."
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Horário que sonhei
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'noite', label: 'Noite', icon: '🌙' },
              { id: 'madrugada', label: 'Madrugada', icon: '🌌' },
              { id: 'cochilo', label: 'Cochilo', icon: '☀️' },
            ].map((h) => (
              <button
                key={h.id}
                onClick={() => setHorario(horario === h.id ? null : h.id)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  horario === h.id
                    ? 'bg-purple-500/30 border-purple-500'
                    : 'bg-white/5 border-white/5 hover:border-purple-500/30'
                }`}
              >
                <span className="text-lg block">{h.icon}</span>
                <span className="text-xs text-gray-400">{h.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Tipo de Sonho
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'comum', label: 'Comum', icon: '💭' },
              { id: 'pesadelo', label: 'Pesadelo', icon: '😱' },
              { id: 'lucido', label: 'Lúcido', icon: '✨' },
              { id: 'profetico', label: 'Profético', icon: '🔮' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTipo(tipo === t.id ? null : t.id)}
                className={`p-3 rounded-xl border transition-all text-center ${
                  tipo === t.id
                    ? 'bg-purple-500/30 border-purple-500'
                    : 'bg-white/5 border-white/5 hover:border-purple-500/30'
                }`}
              >
                <span className="text-lg block">{t.icon}</span>
                <span className="text-xs text-gray-400">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-sm"
          >
            {error}
          </motion.p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInterpretar}
          disabled={!sonho.trim() || localLoading || (perfil.plano === 'gratis' && perfil.creditos <= 0)}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {localLoading ? 'Interpretando...' : 'Interpretar Sonho'}
        </motion.button>
      </div>
    </div>
  );
}
