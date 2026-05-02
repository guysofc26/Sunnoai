'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, History, LayoutDashboard, LogOut, Crown, Settings, LineChart } from 'lucide-react';
import { Perfil } from '@/lib/types';

interface HeaderProps {
  perfil: Perfil;
  signOut: () => Promise<void>;
}

export default function Header({ perfil, signOut }: HeaderProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/historico', label: 'Histórico', icon: History },
    { href: '/insights', label: 'Projeções', icon: LineChart },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-purple-500/20">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Moon className="w-7 h-7 text-purple-400" />
            <span className="text-lg font-bold text-white">Sonnus<span className="text-purple-400">AI</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">
                {perfil.plano === 'pro' ? 'Pro' : `${perfil.creditos} créditos`}
              </span>
            </div>

            <div className="text-sm text-gray-400 hidden sm:block">
              Olá, {perfil.nome.split(' ')[0]}
            </div>

            <button
              onClick={signOut}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-center gap-1 px-4 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all flex-1 justify-center text-xs ${
                isActive
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
