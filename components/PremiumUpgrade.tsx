'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function PremiumUpgrade() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/criar-checkout', {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('Configuração')) {
          alert('O sistema de pagamentos será ativado em breve! Fique atento às novidades.');
        } else {
          alert('Erro ao criar checkout. Tente novamente.');
        }
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert('Erro ao criar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card backdrop-blur-sm border border-yellow-500/30 rounded-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-yellow-500/10 to-purple-500/10 px-6 py-4 border-b border-yellow-500/20 flex items-center gap-3">
        <Crown className="w-5 h-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-gradient-gold">
          Plano Místico Pro
        </h3>
      </div>

      <div className="p-6">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-bold text-white">R$ 9,90</span>
          <span className="text-gray-400">/mês</span>
        </div>

        <ul className="space-y-3 mb-6">
          {[
            'Interpretações ilimitadas',
            'Análise astrológica profunda',
            'Histórico completo de sonhos',
            'Exportação em PDF místico',
            'Prioridade no oráculo',
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
              <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-yellow-600"
        >
          {loading ? (
            <Sparkles className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Fazer Upgrade
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}
