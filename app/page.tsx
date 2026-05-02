'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/browser';

export default function Home() {
  const router = useRouter();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        doneRef.current = true;
        router.push('/dashboard');
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0114] text-white font-sans selection:bg-purple-500/30">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-purple-600 to-yellow-400 rounded-full blur-[2px]"></div>
          <span className="text-xl font-bold tracking-tighter">SONNUS<span className="text-purple-400">AI</span></span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="#como-funciona" className="hover:text-white transition">Como funciona</Link>
          <Link href="#precos" className="hover:text-white transition">Preços</Link>
          <Link href="#signos" className="hover:text-white transition">Signos</Link>
        </div>
        <Link href="/auth" className="px-5 py-2 border border-purple-500/50 rounded-full text-sm hover:bg-purple-500/10 transition">
          Entrar
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-8 animate-pulse">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          NOVA ERA DA INTERPRETAÇÃO
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif leading-tight mb-6">
          O que sua alma tentou te <br/>
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-yellow-200">
            dizer esta noite?
          </span>
        </h1>

        <p className="max-w-2xl text-gray-400 text-lg md:text-xl mb-12">
          Desvende os mistérios do seu subconsciente com uma IA treinada em simbologia ancestral e astrologia. Uma revelação única baseada no seu signo.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link href="/auth" className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] transition-all active:scale-95">
            <span className="relative z-10 flex items-center gap-2">
              🌙 INTERPRETAR MEU SONHO
            </span>
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
          </Link>
          <p className="text-xs text-gray-500">3 créditos gratuitos para novos usuários</p>
        </div>

        <div id="precos" className="mt-32 w-full grid md:grid-cols-2 gap-8 max-w-4xl text-left">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm transition-transform hover:-translate-y-1">
            <h3 className="text-xl font-bold mb-2">Curioso</h3>
            <div className="text-3xl font-bold mb-6">R$ 0</div>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">✓ 3 Interpretações iniciais</li>
              <li className="flex items-center gap-2">✓ Análise básica</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-b from-purple-900/40 to-transparent border border-purple-500/30 backdrop-blur-sm relative overflow-hidden transition-transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black px-4 py-1 text-[10px] font-bold uppercase tracking-tighter shadow-md">MAIS POPULAR</div>
            <h3 className="text-xl font-bold mb-2">Místico Pro</h3>
            <div className="text-3xl font-bold mb-6">R$ 9,90 <span className="text-sm font-normal text-gray-500">/mês</span></div>
            <ul className="space-y-3 text-gray-200 text-sm">
              <li className="flex items-center gap-2 text-purple-300">✦ Interpretações Ilimitadas</li>
              <li className="flex items-center gap-2">✦ Análise Astrológica (Signo)</li>
              <li className="flex items-center gap-2">✦ Download de Relatórios em PDF</li>
              <li className="flex items-center gap-2 text-yellow-200">✦ Insights do Oráculo Personalizados</li>
            </ul>
            <Link href="/auth" className="w-full mt-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-yellow-400 transition-colors flex justify-center">
              Assinar Agora
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 text-center text-gray-600 text-sm">
        © 2026 Sonnus AI por Studio Paula. Conectando tecnologia e mistério.
      </footer>
    </div>
  );
}
