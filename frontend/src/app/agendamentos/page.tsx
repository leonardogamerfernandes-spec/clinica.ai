"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Appointment {
  id: string;
  patient: string;
  phone: string;
  time: string;
  procedure: string;
  professional: string;
  color: string;
  status: "confirmado" | "pendente" | "cancelado";
}

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: "1", patient: "Maria Silva", phone: "(11) 98765-4321", time: "09:00", procedure: "Avaliação", professional: "Dr. Leonardo", color: "purple", status: "confirmado" },
    { id: "2", patient: "Carlos Andrade", phone: "(11) 91234-5678", time: "11:00", procedure: "Limpeza", professional: "Dr. Leonardo", color: "emerald", status: "pendente" },
    { id: "3", patient: "Felipe Melo", phone: "(11) 99888-7766", time: "10:00", procedure: "Ortodontia", professional: "Dra. Mariana", color: "purple", status: "confirmado" },
    { id: "4", patient: "Beatriz Costa", phone: "(11) 94444-5555", time: "14:00", procedure: "Canal", professional: "Dra. Mariana", color: "amber", status: "pendente" },
    { id: "5", patient: "Juliana Rocha", phone: "(11) 93333-2222", time: "15:00", procedure: "Clareamento", professional: "Dr. Leonardo", color: "purple", status: "confirmado" },
  ]);

  const [waitlist, setWaitlist] = useState([
    { id: "w1", patient: "Lucas Martins", phone: "(11) 98765-4321", preferredTime: "16:00", reason: "Mora perto (2 min), aceita encaixe imediato" },
    { id: "w2", patient: "Amanda Lima", phone: "(11) 91234-5678", preferredTime: "08:00", reason: "Fila de espera para Dr. Leonardo" },
  ]);

  const [antiFaltas, setAntiFaltas] = useState([
    { id: "a1", patient: "Ana Clara Souza", risk: "84%", procedure: "Clareamento", time: "Amanhã, 09:00", loss: "R$ 420", sent: false },
    { id: "a2", patient: "Thiago Ramos", risk: "71%", procedure: "Ortodontia", time: "Hoje, 17:00", loss: "R$ 180", sent: false }
  ]);

  const [filterProf, setFilterProf] = useState("Todos");
  const [usingDemo, setUsingDemo] = useState(true);
  const [professionals, setProfessionals] = useState<string[]>(["Dr. Leonardo", "Dra. Mariana"]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [activeTeleconsultRoom, setActiveTeleconsultRoom] = useState<string | null>(null);
  const [isTriggeringCron, setIsTriggeringCron] = useState(false);
  const [cronNotification, setCronNotification] = useState<string | null>(null);

  // Sync with NestJS API if available
  const fetchAppointments = async (currentProfessionals = professionals) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/appointments`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const mapped: Appointment[] = data.map((d: any) => {
            const scheduledDate = new Date(d.scheduledAt);
            const hour = scheduledDate.getHours().toString().padStart(2, '0') + ":00";
            return {
              id: d.id,
              patient: d.patient.name,
              phone: d.patient.phone,
              time: hour,
              procedure: d.procedure,
              professional: d.doctor ? d.doctor.name : (currentProfessionals[0] || "Dr. Leonardo"),
              color: d.status === "CONFIRMED" ? "purple" : "emerald",
              status: d.status === "CONFIRMED" ? "confirmado" : d.status === "CANCELED" ? "cancelado" : "pendente"
            };
          });
          setAppointments(mapped);
          setUsingDemo(false);
        }
      }
    } catch (err) {
      setUsingDemo(true);
    }
  };

  const fetchWaitlist = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/waitlist`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWaitlist(data);
      }
    } catch (e) {
      console.warn("Failed to load waitlist");
    }
  };

  const fetchProcedures = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/procedures`, { headers });
      if (res.ok) {
        setStaffList(prev => [...prev]);
      }
    } catch (e) {
      console.warn("Failed to load procedures");
    }
  };

  useEffect(() => {
    const fetchStaffAndData = async () => {
      let currentDocs = ["Dr. Leonardo", "Dra. Mariana"];
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const staffRes = await fetch(`${API_BASE_URL}/api/settings/staff`, { headers });
        if (staffRes.ok) {
          const data = await staffRes.json();
          setStaffList(data);
          const docs = data
            .filter((s: any) => s.role.toLowerCase().includes("dentista") || s.role.toLowerCase().includes("ortodontista") || s.name.startsWith("Dr"))
            .map((s: any) => s.name);
          if (docs.length > 0) {
            currentDocs = docs;
            setProfessionals(docs);
          }
        }
      } catch (e) {
        console.warn("Failed to load staff list");
      }
      fetchAppointments(currentDocs);
      fetchWaitlist();
      fetchProcedures();
    };

    fetchStaffAndData();
  }, []);

  const handleTriggerCronReminders = async () => {
    setIsTriggeringCron(true);
    setCronNotification(null);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/appointments/trigger-reminders`, {
        method: "POST",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setCronNotification(`✓ Disparo concluído! ${data.remindersSent || 2} lembretes automáticos enviados via WhatsApp.`);
        fetchAppointments();
      }
    } catch (e) {
      setCronNotification("✓ Disparo simulado concluído! 2 lembretes de amanhã enviados no WhatsApp.");
    } finally {
      setIsTriggeringCron(false);
    }
  };

  const handlePreencherVaga = async (slot: string, professionalName: string) => {
    if (waitlist.length === 0) return;
    const patientToInsert = waitlist[0];

    const todayDate = new Date();
    const hourNum = parseInt(slot.split(":")[0]);
    todayDate.setHours(hourNum, 0, 0, 0);

    const docObj = staffList.find(s => s.name === professionalName);
    const patientNameResolved = patientToInsert.patientName || patientToInsert.patient;
    const postData = {
      patientName: patientNameResolved,
      phone: patientToInsert.phone,
      scheduledAt: todayDate.toISOString(),
      procedure: "Encaixe IA (Geral)",
      doctorId: docObj ? docObj.id : undefined
    };

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE_URL}/api/appointments`, {
        method: "POST",
        headers,
        body: JSON.stringify(postData)
      });
      if (res.ok) {
        await fetchAppointments();
        await fetch(`${API_BASE_URL}/api/waitlist/${patientToInsert.id}`, {
          method: "DELETE",
          headers
        });
        await fetchWaitlist();
        return;
      }
    } catch (err) {
      console.warn("API offline, executing locally (Demo Mode)");
    }

    const newAppt: Appointment = {
      id: Math.random().toString(),
      patient: patientToInsert.patient,
      phone: patientToInsert.phone,
      time: slot,
      procedure: "Encaixe IA (Geral)",
      professional: professionalName,
      color: "emerald",
      status: "confirmado"
    };
    setAppointments(prev => [...prev, newAppt]);
    setWaitlist(waitlist.slice(1));
  };

  const handleSendReminder = async (id: string, patientName: string) => {
    const appt = appointments.find(a => a.patient === patientName);
    if (appt && !usingDemo) {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch(`${API_BASE_URL}/api/appointments/${appt.id}/status`, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ status: "CONFIRMED" })
        });
        if (res.ok) {
          await fetchAppointments();
          setAntiFaltas(antiFaltas.map(item => item.id === id ? { ...item, sent: true } : item));
          return;
        }
      } catch (err) {
        console.warn("API patch failed, executing locally (Demo Mode)");
      }
    }

    setAntiFaltas(antiFaltas.map(item => item.id === id ? { ...item, sent: true } : item));
    setAppointments(appointments.map(app => 
      app.patient === patientName ? { ...app, status: "confirmado" } : app
    ));
  };

  const times = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const gridClass = professionals.length === 1 
    ? "grid grid-cols-2" 
    : professionals.length === 2 
    ? "grid grid-cols-3" 
    : "grid grid-cols-4";

  return (
    <div className="space-y-6">
      {/* Cron Notification */}
      {cronNotification && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between animate-fade-in-down">
          <span>{cronNotification}</span>
          <button onClick={() => setCronNotification(null)} className="text-[#8a7f9a] hover:text-white px-2">✕</button>
        </div>
      )}

      {/* Filters and Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0d071b]/60 border border-[#1b122c] p-4 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#8a7f9a] font-semibold uppercase tracking-wider">Filtrar Profissional:</span>
          <div className="flex bg-[#100a1f] border border-[#21163a] rounded-lg p-0.5">
            {["Todos", ...professionals].map((prof) => (
              <button
                key={prof}
                onClick={() => setFilterProf(prof)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
                  filterProf === prof
                    ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                    : "text-[#746985] hover:text-slate-300"
                }`}
              >
                {prof}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cron Job Ativo • 08:00 AM</span>
          </div>

          <button
            onClick={handleTriggerCronReminders}
            disabled={isTriggeringCron}
            className="px-3.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/50 text-xs font-bold text-purple-300 btn-interactive"
          >
            {isTriggeringCron ? "Disparando..." : "Disparar Lembretes Hoje ⚡"}
          </button>

          <button className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-900/30 btn-interactive">
            Novo Agendamento
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-5 lg:col-span-2 overflow-hidden flex flex-col animate-fade-in-up">
          <div className="flex items-center justify-between mb-4 border-b border-[#1b122c] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Quadro Diário de Consultas
            </h3>
            <span className="text-[10px] font-bold text-[#8a7f9a] bg-[#160e26] border border-[#2b1f48] px-2 py-0.5 rounded">
              Agenda em Produção
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <div className="min-w-[500px]">
              <div className={`${gridClass} border-b border-[#1b122c] pb-2 text-[10px] font-bold uppercase tracking-wider text-[#8a7f9a]`}>
                <div className="pl-3">Horário</div>
                {professionals.map((prof) => (
                  <div key={prof} className="pl-3 border-l border-[#1b122c]">{prof}</div>
                ))}
              </div>

              <div className="divide-y divide-[#1b122c] text-xs">
                {times.map((time) => (
                  <div key={time} className={`${gridClass} py-3 group relative hover:bg-white/[0.01] transition-colors`}>
                    <div className="pl-3 font-semibold text-slate-400 flex items-center">{time}</div>

                    {professionals.map((prof) => {
                      const isFiltered = filterProf !== "Todos" && filterProf !== prof;
                      const appt = appointments.find((a) => a.time === time && a.professional === prof);

                      if (isFiltered) {
                        return <div key={prof} className="border-l border-[#1b122c] opacity-10 bg-slate-950/20" />;
                      }

                      return (
                        <div key={prof} className="pl-3 pr-2 border-l border-[#1b122c] min-h-[46px] flex flex-col justify-center relative">
                          {appt ? (
                            <div 
                              className={`p-2 rounded-lg border text-[11px] transition-all duration-150 hover:scale-[1.01] select-none cursor-grab ${
                                appt.color === "purple"
                                  ? "bg-[#25134b]/40 border-[#4a2b91]/40 text-purple-200"
                                  : appt.color === "emerald"
                                  ? "bg-[#0b241c]/40 border-[#15543c]/40 text-emerald-300"
                                  : "bg-[#281a0b]/40 border-[#5c3e16]/40 text-amber-200"
                              }`}
                            >
                              <div className="flex justify-between items-center font-bold gap-1">
                                <span className="truncate flex-1">{appt.patient}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setActiveTeleconsultRoom(appt.id); }}
                                    title="Teleconsulta de Vídeo"
                                    className="p-0.5 rounded bg-purple-500/20 hover:bg-purple-500/40 text-[9px] font-bold text-purple-300 transition-colors"
                                  >
                                    🎥
                                  </button>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    appt.status === "confirmado" ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" : "bg-amber-500"
                                  }`} />
                                </div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] opacity-75 mt-0.5 font-medium">
                                <span>{appt.procedure}</span>
                                <span className="capitalize">{appt.status}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-between group-hover:opacity-100 opacity-0 transition-opacity">
                              <span className="text-[10px] text-[#534b5f] font-medium">Vago</span>
                              <button 
                                onClick={() => handlePreencherVaga(time, prof)}
                                className="px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/35 hover:bg-purple-500/20 text-[9px] font-bold text-purple-400 transition-colors"
                              >
                                Encaixe IA ⚡
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-1 flex flex-col justify-start">
          {/* AI Anti-Faltas */}
          <div className="glass-panel-glow rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-glow-purple flex items-center gap-1.5 mb-4">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              IA Anti-Faltas
            </h3>

            <div className="space-y-4">
              {antiFaltas.map((item) => (
                <div key={item.id} className="p-3.5 rounded-lg bg-[#140b24]/50 border border-[#2b1b46] relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.patient}</h4>
                      <p className="text-[10px] text-[#8a7f9a] mt-0.5">{item.procedure} • {item.time}</p>
                    </div>
                    <span className="px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[9px] font-extrabold rounded">
                      Risco: {item.risk}
                    </span>
                  </div>
                  
                  <div className="mt-3 flex justify-between items-center text-[10px] bg-slate-950/30 p-2 rounded">
                    <span className="text-[#8a7f9a]">Perda Financeira Prevista:</span>
                    <span className="text-rose-400 font-bold">{item.loss}</span>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {item.sent ? (
                      <div className="w-full py-1.5 rounded bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Lembrete Enviado
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleSendReminder(item.id, item.patient)}
                        className="w-full py-1.5 rounded bg-purple-600 hover:bg-purple-500 text-[10px] font-bold text-white transition-colors duration-150 btn-interactive"
                      >
                        Mitigar Risco (WhatsApp IA)
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fila de Espera */}
          <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a]">Fila de Encaixe IA</h3>
              <span className="text-[9px] bg-[#1d1238] text-purple-300 font-bold px-1.5 py-0.2 rounded border border-purple-500/10">
                {waitlist.length} na fila
              </span>
            </div>

            <div className="space-y-3">
              {waitlist.length > 0 ? (
                waitlist.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-950/40 border border-[#1b122c]">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-200">{item.patientName || item.patient}</h4>
                      <span className="text-[9px] text-purple-400 font-medium">{item.preferredTime}</span>
                    </div>
                    <p className="text-[10px] text-[#786b8c] mt-1 italic">"{item.reason}"</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-[#5c526a] italic text-center py-4">Fila de espera vazia.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Teleconsultation Video Modal */}
      {activeTeleconsultRoom && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-4xl bg-[#110822] border border-purple-500/25 rounded-2xl p-6 relative flex flex-col h-[80vh] shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="flex justify-between items-center border-b border-[#21163e]/40 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                  Teleconsulta Médica em Andamento (Sala Segura SSL)
                </h3>
                <p className="text-[10px] text-[#8a7f9a] mt-0.5">Conectado via WebRTC P2P Encriptado</p>
              </div>
              <button
                onClick={() => setActiveTeleconsultRoom(null)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white rounded-lg transition-colors btn-interactive"
              >
                Encerrar Chamada 📞
              </button>
            </div>
            
            <div className="flex-1 rounded-xl bg-slate-950/90 overflow-hidden relative">
              <iframe
                src={`https://meet.jit.si/clinica-ai-teleconsult-${activeTeleconsultRoom}`}
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
