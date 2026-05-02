'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/browser';
import { useAuth } from '@/components/AuthProvider';
import Header from '@/components/Header';
import { Sonho } from '@/lib/types';
import { History, Clock, Type, Eye, Moon, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const tipoLabels: Record<string, { label: string; color: string }> = {
  pesadelo: { label: 'Pesadelo', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  lucido: { label: 'Lúcido', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  profetico: { label: 'Profético', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  comum: { label: 'Comum', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
};

const horarioLabels: Record<string, string> = {
  noite: '🌙 Noite',
  madrugada: '🌌 Madrugada',
  cochilo: '☀️ Cochilo',
};

export default function HistoricoPage() {
  const router = useRouter();
  const { user, perfil, signOut, loading } = useAuth();
  const [sonhos, setSonhos] = useState<Sonho[]>([]);
  const [loadingSonhos, setLoadingSonhos] = useState(true);
  const [selectedSonho, setSelectedSonho] = useState<Sonho | null>(null);
  const hasRedirectedRef = useRef(false);

  const fetchSonhos = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('sonhos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSonhos(data);
    setLoadingSonhos(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchSonhos();
    }
  }, [user, fetchSonhos]);

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!loading && !user) {
      hasRedirectedRef.current = true;
      router.push('/auth');
    }
  }, [loading, user, router]);

  const handlePrintSonho = (sonho: Sonho) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Interpretação - Sonnus AI</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a1a2e; }
  .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #a875ff; margin-bottom: 30px; }
  .logo { font-size: 24px; font-weight: 700; color: #7a1fff; }
  .date { color: #666; font-size: 14px; margin-top: 5px; }
  .sonho-box { background: #f5f5ff; padding: 20px; border-radius: 12px; margin: 20px 0; }
  .sonho-label { font-size: 12px; color: #666; margin-bottom: 8px; }
  .sonho-text { line-height: 1.6; color: #333; }
  h2 { color: #7a1fff; font-size: 18px; margin: 24px 0 12px 0; }
  p { line-height: 1.8; margin-bottom: 12px; color: #333; }
  strong { color: #1a1a2e; }
  .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="logo">✦ Sonnus AI</div>
    <div class="date">${formatDate(sonho.created_at)}</div>
  </div>
  <div class="sonho-box">
    <div class="sonho-label">Seu sonho:</div>
    <div class="sonho-text">${sonho.descricao}</div>
  </div>
  <div class="content">${sonho.interpretacao || '<p>Sem interpretação disponível.</p>'}</div>
  <div class="footer">
    <p>Gerado por Sonnus AI • ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>
  <script>window.print();</script>
</body>
</html>
    `);
    printWindow.document.close();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading || !perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Moon className="w-12 h-12 text-purple-400 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header perfil={perfil} signOut={signOut} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <History className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">Histórico de Sonhos</h1>
          <span className="text-sm text-gray-400 bg-white/5 px-3 py-1 rounded-full">
            {sonhos.length} {sonhos.length === 1 ? 'sonho' : 'sonhos'}
          </span>
        </motion.div>

        {loadingSonhos ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sonhos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl p-12 text-center"
          >
            <Moon className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum sonho registrado
            </h3>
            <p className="text-gray-400">
              Comece interpretando seus sonhos no Dashboard.
            </p>
          </motion.div>
        ) : (
          <div className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Data</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Sonho</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Tipo</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Horário</th>
                    <th className="text-left px-6 py-4 text-sm text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sonhos.map((sonho, index) => (
                    <motion.tr
                      key={sonho.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatDate(sonho.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white text-sm truncate max-w-[200px]">
                          {sonho.descricao.substring(0, 60)}...
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {sonho.tipo && tipoLabels[sonho.tipo] ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${tipoLabels[sonho.tipo].color}`}>
                            <Type className="w-3 h-3 mr-1" />
                            {tipoLabels[sonho.tipo].label}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {sonho.horario ? horarioLabels[sonho.horario] : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedSonho(sonho)}
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Ver</span>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedSonho && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSonho(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-card backdrop-blur-sm border border-purple-500/20 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-purple-900/30 px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Interpretação do Sonho
                  </h3>
                  <p className="text-xs text-gray-400">
                    {formatDate(selectedSonho.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePrintSonho(selectedSonho)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    title="Imprimir / PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedSonho(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Seu sonho:</p>
                  <p className="text-white">{selectedSonho.descricao}</p>
                </div>

                <div className="flex gap-2 mb-4">
                  {selectedSonho.tipo && tipoLabels[selectedSonho.tipo] && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs border ${tipoLabels[selectedSonho.tipo].color}`}>
                      {tipoLabels[selectedSonho.tipo].label}
                    </span>
                  )}
                  {selectedSonho.horario && horarioLabels[selectedSonho.horario] && (
                    <span className="bg-white/5 text-gray-400 px-3 py-1 rounded-full text-xs border border-white/10">
                      {horarioLabels[selectedSonho.horario]}
                    </span>
                  )}
                </div>

                <div className="markdown-content">
                  <ReactMarkdown>{selectedSonho.interpretacao || 'Interpretação não disponível.'}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
