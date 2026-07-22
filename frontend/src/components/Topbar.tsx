"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Topbar() {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(false);
  const [userName, setUserName] = useState("Carregando...");
  const [userRole, setUserRole] = useState("Administrador");
  const [userInitials, setUserInitials] = useState("U");

  // Load user information
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
        setUserRole(user.role === "ADMIN" ? "Administrador" : user.role);
        
        const initials = user.name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .substring(0, 2);
        setUserInitials(initials || "U");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Check backend connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch("http://localhost:3001/api/patients", { 
          method: "GET", 
          headers 
        });
        
        if (res.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (err) {
        setIsOnline(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 8000); // Check every 8 seconds
    return () => clearInterval(interval);
  }, []);

  // Dynamic titles depending on page route
  const getHeaderInfo = () => {
    switch (pathname) {
      case "/":
      case null:
        return {
          title: "Analytics",
          subtitle: "Métricas gerais de atendimento e automação da IA"
        };
      case "/agendamentos":
        return {
          title: "Agendamentos",
          subtitle: "Gerencie e acompanhe as consultas marcadas pelos pacientes"
        };
      case "/pacientes":
        return {
          title: "Pacientes",
          subtitle: "Histórico de atendimentos e base de dados de pacientes"
        };
      case "/agente":
        return {
          title: "Copiloto IA & BI",
          subtitle: "Assistente conversacional e análise de faturamento em tempo real"
        };
      case "/automacoes":
        return {
          title: "Automações No-Code",
          subtitle: "Crie regras de atendimento automático e fluxos sem programar"
        };
      case "/configuracoes":
        return {
          title: "Configurações",
          subtitle: "Configurações gerais do sistema e planos"
        };
      default:
        return {
          title: "Painel de Controle",
          subtitle: "Gerencie os agendamentos e o agente de IA da sua clínica"
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <header className="h-18 border-b border-[#1b122c] bg-[#080511]/40 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20 ml-64 select-none">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white tracking-tight text-glow-purple">{title}</h1>
          
          {/* Connection Status Badge */}
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-colors ${
            isOnline 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-purple-500/10 border-purple-500/20 text-purple-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isOnline ? "bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" : "bg-purple-500"
            }`} />
            {isOnline ? "Conectado" : "Modo Demo"}
          </span>
        </div>
        <p className="text-xs text-[#827891] mt-0.5">{subtitle}</p>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <div className="flex items-center bg-[#100a1f] border border-[#21163a] rounded-lg p-1">
          <button className="p-1.5 rounded-md text-[#746985] hover:text-slate-300 transition-all duration-150">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
            </svg>
          </button>
          <button className="p-1.5 rounded-md bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] transition-all duration-150 shadow-[0_0_8px_rgba(139,92,246,0.15)]">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>

        {/* AI Credits Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f1f1e] border border-[#1b3d39] text-[#14b8a6] text-xs font-semibold rounded-lg shadow-[0_0_12px_rgba(20,184,166,0.02)]">
          <svg className="w-3.5 h-3.5 fill-[#14b8a6]" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>40 disparos</span>
        </div>

        {/* Notification Bell Badge */}
        <button className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#170e28] hover:bg-[#201538] border border-[#2b1c48] text-purple-300 hover:text-white transition-all duration-150 ease-out-strong active:scale-[0.97] rounded-lg text-xs font-medium cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="px-1.5 py-0.2 bg-[#ef4444] text-[10px] font-bold text-white rounded-md shadow-[0_0_8px_rgba(239,68,68,0.2)] animate-pulse">
            2 Novos
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-[#1b122c]" />

        {/* Profile Info Button */}
        <div className="flex items-center gap-3 pl-1 group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors duration-150 leading-none">{userName}</p>
            <p className="text-[10px] text-[#7c7289] mt-1 leading-none font-medium">{userRole}</p>
          </div>
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/20 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-purple-900/30">
              {userInitials}
            </div>
            <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center border border-[#080511] shadow">
              4.8
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
