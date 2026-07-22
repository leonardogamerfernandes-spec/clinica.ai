"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [clinicName, setClinicName] = useState("Clínica.ai");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setClinicName(user.clinicName || "Clínica.ai");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navigation = [
    {
      name: "Visão Geral",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: "Agendamentos",
      href: "/agendamentos",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: "Pacientes",
      href: "/pacientes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: "Automações",
      href: "/automacoes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="6" cy="6" r="2.5" stroke="currentColor" strokeWidth={2} />
          <circle cx="18" cy="18" r="2.5" stroke="currentColor" strokeWidth={2} />
          <circle cx="18" cy="6" r="2.5" stroke="currentColor" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.5 6h7M6 8.5v3a2 2 0 002 2h3m4.5 4.5v-3a2 2 0 00-2-2" />
        </svg>
      )
    },
    {
      name: "Copiloto IA & BI",
      href: "/agente",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  const support = [
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: "Ajuda & Suporte",
      href: "/ajuda",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0614] border-r border-[#1b122c] h-screen flex flex-col fixed left-0 top-0 z-25 select-none">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-[#1b122c]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-purple-400">
          {clinicName}
        </span>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4">
        <div className="relative flex items-center">
          <span className="absolute left-3 text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#120c22]/60 border border-[#211833] focus:border-purple-500/50 hover:border-[#31254d] text-slate-200 text-sm pl-9 pr-8 py-2 rounded-lg outline-none transition-all duration-200 placeholder:text-[#645c70] focus:ring-1 focus:ring-purple-500/20"
          />
          <span className="absolute right-2 px-1.5 py-0.5 bg-[#1b122c] border border-[#2d2047] text-[10px] font-semibold text-[#8a7f9a] rounded">
            F
          </span>
        </div>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2">
        {/* Menu Section */}
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#5c526a] px-3 mb-2">
            Menu
          </h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out-strong active:scale-[0.97] ${
                    isActive
                      ? "text-white bg-gradient-to-r from-purple-950/45 to-transparent border-l-2 border-purple-500 shadow-[inset_4px_0_12px_rgba(139,92,246,0.05)]"
                      : "text-[#827891] hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`transition-colors duration-150 ${isActive ? "text-purple-400" : "text-[#706480] group-hover:text-slate-200"}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a78bfa]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Support Section */}
        <div>
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-[#5c526a] px-3 mb-2">
            Suporte
          </h2>
          <nav className="space-y-1">
            {support.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out-strong active:scale-[0.97] ${
                    isActive
                      ? "text-white bg-gradient-to-r from-purple-950/45 to-transparent border-l-2 border-purple-500 shadow-[inset_4px_0_12px_rgba(139,92,246,0.05)]"
                      : "text-[#827891] hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  <span className={`transition-colors duration-150 ${isActive ? "text-purple-400" : "text-[#706480] group-hover:text-slate-200"}`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="absolute right-2 w-1.5 h-1.5 bg-purple-500 rounded-full shadow-[0_0_8px_#a78bfa]" />
                  )}
                </Link>
              );
            })}

            {/* Logout Button */}
            <div className="pt-2">
              <button
                onClick={handleLogout}
                className="w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-out-strong active:scale-[0.97] text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 cursor-pointer"
              >
                <span className="text-rose-400/80 group-hover:text-rose-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span>Sair da Conta</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* AI Rocket Support Card at Bottom */}
      <div className="p-4 border-t border-[#1b122c] bg-[#0c0719]/40">
        <div className="p-4 rounded-xl bg-gradient-to-b from-[#130b24] to-[#0d071b] border border-[#24173d] relative overflow-hidden group shadow-[0_0_20px_rgba(139,92,246,0.02)]">
          {/* Subtle light leak */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-[#1a0f30] border border-[#2b1c4b] flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              {/* Glowing animated rocket SVG */}
              <svg className="w-6 h-6 text-purple-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '3s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41a14.97 14.97 0 00-6.16 12.12c2.72-.08 5.25-1 7.32-2.58M15.59 14.37A14.94 14.94 0 019.63 8.41M11.96 15c-.9 0-1.78-.22-2.58-.63" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Plano Gratuito</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
                <span className="text-[10px] text-emerald-400 font-medium tracking-wide">Assistente Ativo</span>
              </div>
            </div>
          </div>
          
          <div className="mt-3 relative z-10">
            <button 
              onClick={() => router.push('/configuracoes')}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-[11px] font-bold text-white transition-all duration-150 ease-out-strong active:scale-[0.96] shadow-md shadow-purple-900/20 hover:shadow-purple-800/40 cursor-pointer"
            >
              Ver Planos
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
