"use client";

import { useState, useEffect } from "react";

interface DBAppointment {
  id: string;
  scheduledAt: string;
  status: string;
  procedure: string;
  patient: {
    name: string;
    phone: string;
  };
}

export default function DashboardHome() {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(3); // Default to Thursday (index 3)
  const [dbAppointments, setDbAppointments] = useState<DBAppointment[]>([]);
  const [appointmentCount, setAppointmentCount] = useState(18);
  const [usingDemo, setUsingDemo] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState("FREE");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setSubscriptionStatus(user.subscriptionStatus || "FREE");
      } catch (e) {}
    }
  }, []);

  const handleUpgrade = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("http://localhost:3001/api/billing/checkout", {
        method: "POST",
        headers
      });

      if (res.ok) {
        const data = await res.json();
        
        // Simular a ativação imediata no frontend
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.subscriptionStatus = "ACTIVE";
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        window.location.href = data.url;
      }
    } catch (e) {
      console.warn("Failed to simulation checkout");
    }
  };

  // Load backend data if available, fallback to mock on error
  useEffect(() => {
    const fetchDBData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch("http://localhost:3001/api/appointments", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setDbAppointments(data);
            setAppointmentCount(data.length);
            setUsingDemo(false);
          }
        }
      } catch (err) {
        setUsingDemo(true);
      }
      
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const statsRes = await fetch("http://localhost:3001/api/analytics/dashboard", { headers });
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setMsgsWeek(stats.msgsWeek);
          setBillingWeek(stats.billingWeek);
          const totalMsgs = stats.msgsWeek.reduce((a: number, b: number) => a + b, 0);
          setMessagesCount(totalMsgs || 142);
        }
      } catch (e) {
        console.warn("Failed to load analytics stats");
      }
    };
    fetchDBData();
  }, []);

  // Chart data for interaction
  const chartDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const [currentWeekMsgs, setMsgsWeek] = useState<number[]>([85, 110, 95, 142, 120, 160, 135]);
  const [billingWeek, setBillingWeek] = useState<number[]>([1200, 1800, 1500, 2400, 1900, 900, 0]);
  const [messagesCount, setMessagesCount] = useState(142);

  // High fidelity fallback mock appointments
  const mockAppointments = [
    { name: "Maria Silva", initials: "MS", email: "maria.silva@email.com", time: "Hoje, 14:30", procedure: "Avaliação Inicial", status: "CONFIRMED" },
    { name: "Carlos Andrade", initials: "CA", email: "carlos.andrade@email.com", time: "Hoje, 15:00", procedure: "Limpeza Semestral", status: "PENDING" },
    { name: "Ana Clara Souza", initials: "AC", email: "anaclara.souza@email.com", time: "Amanhã, 09:00", procedure: "Clareamento a Laser", status: "CONFIRMED" }
  ];

  return (
    <div className="space-y-6">
      {/* Plan Upgrade Banner Card */}
      <div 
        className="w-full relative overflow-hidden rounded-2xl border border-[#23183a] bg-gradient-to-r from-[#170e28] via-[#10091d] to-[#0b0615] p-8 shadow-[0_4px_30px_rgba(139,92,246,0.02)] group animate-fade-in-down"
        style={{ animationDelay: "0ms" }}
      >
        <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-15 pointer-events-none select-none overflow-hidden hidden lg:block">
          <svg className="w-full h-full text-purple-500" viewBox="0 0 200 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <path d="M 0,50 C 40,20 70,80 110,50 C 150,20 170,80 200,50" />
            <path d="M 0,60 C 40,30 70,90 110,60 C 150,30 170,90 200,60" />
            <path d="M 0,40 C 40,10 70,70 110,40 C 150,10 170,70 200,40" />
            <circle cx="110" cy="50" r="3" fill="currentColor" className="animate-ping" />
            <circle cx="110" cy="50" r="1.5" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-purple-500/15 transition-all duration-500" />
        
        {subscriptionStatus === "ACTIVE" ? (
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border bg-emerald-500/10 border-emerald-500/20 text-emerald-400 mb-3 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              Assinatura Ativa (Plano PRO)
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              Seu Assistente de IA está com Acesso Ilimitado! 🎉
            </h2>
            <p className="text-sm text-[#8a7f9a] mt-2 leading-relaxed">
              O Clínica.ai está rodando em produção. Todos os disparos automáticos, lembretes de consultas e o copiloto estão disponíveis sem restrições.
            </p>
          </div>
        ) : (
          <div className="relative z-10 max-w-xl">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              Seu Assistente de IA está no Plano Gratuito
            </h2>
            <p className="text-sm text-[#8a7f9a] mt-2 leading-relaxed">
              O Clínica.ai já automatizou <span className="text-purple-300 font-semibold">142 mensagens</span> hoje. Faça upgrade para planos pagos e obtenha disparos ilimitados, campanhas ativas de retorno e integrações por telefone.
            </p>
            <div className="mt-5">
              <button 
                onClick={handleUpgrade}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition-all duration-150 ease-out-strong active:scale-[0.97] shadow-lg shadow-purple-900/35 hover:shadow-purple-700/50"
              >
                Simular Upgrade Grátis ⚡
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          className="relative overflow-hidden rounded-xl border border-[#482894] bg-gradient-to-b from-[#31176b] to-[#12072e] p-6 shadow-[0_0_20px_rgba(139,92,246,0.15)] group hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in-up"
          style={{ animationDelay: "50ms" }}
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-200 tracking-wide uppercase opacity-90">Mensagens Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-[#532aa8]/40 border border-[#784ad4]/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white tracking-tight">{messagesCount}</p>
            <p className="text-[10px] text-purple-200/90 font-medium mt-1.5 flex items-center gap-1.5">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">↑</span>
              +12% desde ontem
            </p>
          </div>
        </div>

        <div 
          className="glass-panel rounded-xl p-6 shadow-sm group hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8a7f9a] tracking-wide uppercase">Agendamentos</span>
            <div className="w-8 h-8 rounded-lg bg-[#191129] border border-[#2b1f45] flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white tracking-tight">{appointmentCount}</p>
            <p className="text-[10px] text-[#8a7f9a] font-medium mt-1.5 flex items-center gap-1.5">
              {usingDemo ? (
                <>
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[8px] font-bold">↑</span>
                  +4% desde ontem
                </>
              ) : (
                <span className="text-emerald-400">Banco de Dados Ativo</span>
              )}
            </p>
          </div>
        </div>

        <div 
          className="glass-panel rounded-xl p-6 shadow-sm group hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in-up"
          style={{ animationDelay: "150ms" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8a7f9a] tracking-wide uppercase">Resolução IA</span>
            <div className="w-8 h-8 rounded-lg bg-[#191129] border border-[#2b1f45] flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white tracking-tight">92%</p>
            <p className="text-[10px] text-emerald-400 font-medium mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
              Excelente performance
            </p>
          </div>
        </div>

        <div 
          className="glass-panel rounded-xl p-6 shadow-sm group hover:-translate-y-0.5 transition-transform duration-200 animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8a7f9a] tracking-wide uppercase">Tempo Resposta</span>
            <div className="w-8 h-8 rounded-lg bg-[#191129] border border-[#2b1f45] flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white tracking-tight">48s</p>
            <p className="text-[10px] text-[#8a7f9a] font-medium mt-1.5 flex items-center gap-1">
              Méd. 1.2 min ontem
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div 
          className="glass-panel-glow rounded-xl p-6 flex flex-col lg:col-span-2 relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: "250ms" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white">Atividade do Assistente de IA</h3>
              <p className="text-[11px] text-[#8a7f9a] mt-0.5">Mensagens filtradas e respondidas na semana</p>
            </div>
            
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <div className="flex items-center gap-1.5 text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 border border-purple-400/25" />
                <span>Esta Semana</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#5e536c]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b1429] border border-[#3b324f]" />
                <span>Semana Passada</span>
              </div>
            </div>
          </div>

          <div className="w-full relative h-[210px] select-none mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 560 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="purple-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
                </linearGradient>
                <linearGradient id="purple-line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              <line x1="0" y1="30" x2="560" y2="30" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="560" y2="75" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="560" y2="120" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
              <line x1="0" y1="160" x2="560" y2="160" stroke="rgba(255,255,255,0.03)" />

              <path
                d="M 15,130 C 95,145 115,115 185,125 C 255,135 295,95 365,100 C 435,105 455,140 545,110"
                fill="none"
                stroke="#2b2042"
                strokeWidth="2"
                className="opacity-70"
              />

              <path
                d="M 15,145 C 95,115 115,70 185,100 C 255,130 295,35 365,55 C 435,75 455,115 545,65 L 545,160 L 15,160 Z"
                fill="url(#purple-fill)"
              />

              <path
                d="M 15,145 C 95,115 115,70 185,100 C 255,130 295,35 365,55 C 435,75 455,115 545,65"
                fill="none"
                stroke="url(#purple-line-grad)"
                strokeWidth="3.5"
                className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]"
              />

              {hoveredPoint !== null && (
                <>
                  <line x1={15 + hoveredPoint * 88.3} y1="10" x2={15 + hoveredPoint * 88.3} y2="160" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1.5" strokeDasharray="2 2" />
                  <rect x={hoveredPoint * 88.3} y="10" width="30" height="150" fill="rgba(139, 92, 246, 0.02)" className="blur-sm" />
                </>
              )}

              {currentWeekMsgs.map((val, idx) => {
                const x = 15 + idx * 88.3;
                const ys = [145, 122, 102, 70, 55, 98, 65];
                const y = ys[idx];
                const isHovered = hoveredPoint === idx;

                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="22" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint(idx)} />
                    {isHovered && (
                      <circle cx={x} cy={y} r="7" fill="#c084fc" className="animate-ping" style={{ animationDuration: '2s' }} />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? "5" : "3.5"}
                      fill={isHovered ? "#ffffff" : "#a78bfa"}
                      stroke={isHovered ? "#8b5cf6" : "#080511"}
                      strokeWidth={isHovered ? "2.5" : "1.5"}
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredPoint(idx)}
                    />
                  </g>
                );
              })}
            </svg>

            {hoveredPoint !== null && (
              <div 
                className="absolute px-3 py-1.5 bg-[#8b5cf6] border border-[#a78bfa]/30 text-white rounded-lg shadow-xl shadow-purple-900/40 text-[10px] font-bold z-10 transition-all duration-200 pointer-events-none -translate-x-1/2 -translate-y-full"
                style={{ 
                  left: `${15 + hoveredPoint * 88.3}px`, 
                  top: `${[145, 122, 102, 70, 55, 98, 65][hoveredPoint] - 15}px`,
                  transform: 'translate(-50%, -100%)'
                }}
              >
                <span className="text-glow-purple">{currentWeekMsgs[hoveredPoint]} mensagens</span>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#8b5cf6]" />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center px-4 mt-3 text-[10px] font-semibold text-[#5c526a]">
            {chartDays.map((day, idx) => (
              <span 
                key={day} 
                className={`w-12 text-center cursor-pointer py-1.5 rounded-md transition-all duration-150 ${
                  hoveredPoint === idx ? "text-purple-300 bg-purple-950/20 border border-purple-500/10 font-bold" : "hover:text-slate-300"
                }`}
                onMouseEnter={() => setHoveredPoint(idx)}
              >
                {day}
              </span>
            ))}
          </div>
        </div>

        {/* Right Radial Gauge Card */}
        <div 
          className="glass-panel rounded-xl p-6 flex flex-col justify-between animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Canais de Entrada</h3>
            <button className="px-2.5 py-1 rounded-md bg-[#19102c] border border-[#2b1f48] text-[10px] font-bold text-[#b49cf5] hover:text-white transition-all duration-150">
              Ver Tudo →
            </button>
          </div>

          <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <defs>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              <circle cx="50" cy="50" r="40" fill="transparent" stroke="#1b122c" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#purple-line-grad)"
                strokeWidth="8"
                strokeDasharray="251.3"
                strokeDashoffset={251.3 * (1 - 0.92)}
                strokeLinecap="round"
                filter="url(#glow)"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-white tracking-tight">92%</span>
              <p className="text-[10px] text-[#8a7f9a] font-semibold tracking-wider uppercase mt-0.5">Resolução</p>
            </div>
          </div>

          <div className="space-y-3 mt-2">
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                <span className="text-[#8a7f9a]">WhatsApp</span>
                <span className="text-purple-300">88%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1b122c] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                <span className="text-[#8a7f9a]">Webchat</span>
                <span className="text-[#10b981]">95%</span>
              </div>
              <div className="h-1.5 w-full bg-[#1b122c] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#10b981] to-emerald-400 rounded-full" style={{ width: '95%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div 
        className="glass-panel rounded-xl overflow-hidden shadow-sm border border-[#1b122c] animate-fade-in-up"
        style={{ animationDelay: "350ms" }}
      >
        <div className="px-6 py-4 border-b border-[#1b122c] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Próximos Agendamentos Confirmados</h2>
          <span className="text-[10px] font-bold text-[#8a7f9a] bg-[#120a21] border border-[#2b1f48] px-2 py-0.5 rounded">
            {usingDemo ? "Modo Demo" : "Base de Dados"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#120822]/60 text-[#8a7f9a] border-b border-[#1b122c]">
                <th className="px-6 py-3 font-semibold tracking-wider uppercase">Paciente</th>
                <th className="px-6 py-3 font-semibold tracking-wider uppercase">Data / Hora</th>
                <th className="px-6 py-3 font-semibold tracking-wider uppercase">Procedimento</th>
                <th className="px-6 py-3 font-semibold tracking-wider uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b122c]">
              {/* Map database appointments if available, else fallback to mock data */}
              {!usingDemo && dbAppointments.length > 0 ? (
                dbAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-white/[0.01] transition-colors duration-150 group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 font-bold text-[10px]">
                        {appt.patient.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold group-hover:text-white transition-colors">{appt.patient.name}</p>
                        <p className="text-[10px] text-[#716584]">{appt.patient.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#8a7f9a] font-medium">
                      {new Date(appt.scheduledAt).toLocaleDateString("pt-BR")} às {new Date(appt.scheduledAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-[#8a7f9a] font-medium">{appt.procedure}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        appt.status === "CONFIRMED"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${appt.status === "CONFIRMED" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {appt.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                mockAppointments.map((appt, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors duration-150 group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-300 font-bold text-[10px]">
                        {appt.initials}
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold group-hover:text-white transition-colors">{appt.name}</p>
                        <p className="text-[10px] text-[#716584]">{appt.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#8a7f9a] font-medium">{appt.time}</td>
                    <td className="px-6 py-4 text-[#8a7f9a] font-medium">{appt.procedure}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        appt.status === "CONFIRMED"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${appt.status === "CONFIRMED" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                        {appt.status === "CONFIRMED" ? "Confirmado" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
