'use client';

import { motion } from 'framer-motion';
import { Moon, Crown, Sparkles, History } from 'lucide-react';
import { Perfil } from '@/lib/types';
import Link from 'next/link';

interface QuickStatsProps {
  perfil: Perfil;
}

export default function QuickStats({ perfil }: QuickStatsProps) {
  const stats = [
    {
      icon: perfil.plano === 'pro' ? Crown : Sparkles,
      label: perfil.plano === 'pro' ? 'Plano Pro' : 'Plano Gratuito',
      value: perfil.plano === 'pro' ? 'Ilimitado' : `${perfil.creditos} créditos`,
      color: perfil.plano === 'pro' ? 'text-yellow-400' : 'text-purple-400',
      bgColor: perfil.plano === 'pro' ? 'bg-yellow-500/10' : 'bg-purple-500/10',
      link: null,
    },
    {
      icon: Moon,
      label: 'Seu Signo',
      value: perfil.signo ? capitalizeFirst(perfil.signo) : 'Não definido',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      link: '/configuracoes',
    },
    {
      icon: History,
      label: 'Interpretações',
      value: 'Ver histórico →',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      link: '/historico',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const content = (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 ${stat.link ? 'cursor-pointer hover:border-purple-500/30 transition-colors' : ''}`}
          >
            <div className="p-2 rounded-lg bg-white/5">
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className={`text-lg font-semibold text-white ${stat.link ? 'hover:text-purple-300 transition-colors' : ''}`}>{stat.value}</p>
            </div>
          </motion.div>
        );

        if (stat.link) {
          return (
            <Link key={stat.label} href={stat.link}>
              {content}
            </Link>
          );
        }

        return <div key={stat.label}>{content}</div>;
      })}
    </div>
  );
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
