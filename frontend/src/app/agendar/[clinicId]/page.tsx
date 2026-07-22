"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface Doctor {
  id: string;
  name: string;
  role: string;
}

interface Procedure {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export default function PublicBookingPage() {
  const params = useParams();
  const clinicId = params.clinicId as string;

  const [clinicName, setClinicName] = useState("Clínica.ai");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // Form selections
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedProcedureId, setSelectedProcedureId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchClinicDetails = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/public/clinic/${clinicId}`);
        if (res.ok) {
          const data = await res.json();
          setClinicName(data.name);
          setDoctors(data.doctors);
          setProcedures(data.procedures);
        }
      } catch (err) {
        console.warn("Failed to load clinic details");
      } finally {
        setLoading(false);
      }
    };

    if (clinicId) {
      fetchClinicDetails();
    }
  }, [clinicId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedProcedureId || !selectedDate || !selectedTime || !patientName || !phone) return;

    setIsSubmitting(true);
    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/public/clinic/${clinicId}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          phone,
          doctorId: selectedDoctorId,
          procedureId: selectedProcedureId,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start tomorrow
    return d.toISOString().split("T")[0];
  });

  const times = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070211] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 rounded-full border-4 border-t-purple-500 border-purple-950 animate-spin" />
          <p className="text-xs text-[#8a7f9a] font-bold">Carregando portal da clínica...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070211] bg-[radial-gradient(#1e1136_1px,transparent_1px)] [background-size:24px_24px] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg glass-panel-glow border border-purple-950/30 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center mb-8">
          <span className="text-[10px] font-extrabold bg-[#1d1238] border border-purple-500/10 text-purple-300 px-3 py-1 rounded-full uppercase tracking-wider">
            Agendamento Online
          </span>
          <h1 className="text-2xl font-black mt-3 text-white tracking-tight leading-none">{clinicName}</h1>
          <p className="text-xs text-[#8a7f9a] mt-2">Escolha seu procedimento e agende sua consulta em segundos</p>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-3xl flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)] animate-bounce">
              ✓
            </div>
            <h2 className="text-lg font-bold text-white">Consulta Solicitada!</h2>
            <p className="text-xs text-[#8a7f9a] leading-relaxed max-w-md mx-auto">
              Enviamos uma mensagem automática para o seu **WhatsApp (${phone})** para confirmar o agendamento. Responda a mensagem para efetivar o horário na agenda!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Step Indicators */}
            <div className="flex gap-1.5 justify-center">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-8 bg-purple-500" : s < step ? "w-4 bg-purple-950" : "w-1.5 bg-slate-900"
                  }`} 
                />
              ))}
            </div>

            {/* Step 1: Select Procedure */}
            {step === 1 && (
              <div className="space-y-3 animate-fade-in-up">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Selecione o Procedimento</h3>
                {procedures.length > 0 ? (
                  procedures.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProcedureId(p.id); setStep(2); }}
                      className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99] flex justify-between items-center ${
                        selectedProcedureId === p.id 
                          ? "bg-purple-900/10 border-purple-500 text-white" 
                          : "bg-slate-950/40 border-[#1a112c] text-[#8a7f9a] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{p.name}</h4>
                        <p className="text-[10px] opacity-75 mt-0.5">Duração aproximada: {p.duration} min</p>
                      </div>
                      <span className="text-xs font-black text-purple-400">R$ {p.price.toFixed(2)}</span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-[#5c526a] italic py-4 text-center">Nenhum procedimento disponível.</p>
                )}
              </div>
            )}

            {/* Step 2: Select Doctor */}
            {step === 2 && (
              <div className="space-y-3 animate-fade-in-up">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2">Selecione o Profissional</h3>
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => { setSelectedDoctorId(d.id); setStep(3); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all active:scale-[0.99] flex justify-between items-center ${
                      selectedDoctorId === d.id 
                        ? "bg-purple-900/10 border-purple-500 text-white" 
                        : "bg-slate-950/40 border-[#1a112c] text-[#8a7f9a] hover:bg-white/[0.02]"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{d.name}</h4>
                      <p className="text-[10px] opacity-75 mt-0.5">{d.role}</p>
                    </div>
                  </button>
                ))}
                
                <button onClick={() => setStep(1)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 block text-center w-full mt-4">
                  ← Voltar para Procedimentos
                </button>
              </div>
            )}

            {/* Step 3: Pick Date and Time */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in-up">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Escolha a Data e Hora</h3>
                
                {/* Date Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {dates.map((dateStr) => {
                    const d = new Date(dateStr + "T00:00:00");
                    const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" });
                    const day = d.getDate();
                    const isSel = selectedDate === dateStr;

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isSel 
                            ? "bg-purple-900/20 border-purple-500 text-purple-200" 
                            : "bg-slate-950/30 border-[#1b122e] text-[#8a7f9a] hover:bg-white/[0.02]"
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold block">{weekday}</span>
                        <span className="text-sm font-extrabold block mt-0.5">{day}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="space-y-2 animate-fade-in-up">
                    <h4 className="text-[10px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Horários Disponíveis</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {times.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setSelectedTime(t); setStep(4); }}
                          className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                            selectedTime === t 
                              ? "bg-purple-900/20 border-purple-500 text-purple-200" 
                              : "bg-slate-950/30 border-[#1b122e] text-[#8a7f9a] hover:bg-white/[0.02]"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setStep(2)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 block text-center w-full mt-4">
                  ← Voltar para Profissional
                </button>
              </div>
            )}

            {/* Step 4: Fill Details */}
            {step === 4 && (
              <form onSubmit={handleBook} className="space-y-4 animate-fade-in-up">
                <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Suas Informações</h3>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                  />
                </div>

                <div className="p-3 bg-slate-950/40 border border-[#1b122e] rounded-lg text-[10px] text-[#8a7f9a] leading-relaxed">
                  <strong className="text-slate-300 block mb-1">Resumo do Agendamento:</strong>
                  Procedimento: <span className="text-purple-300">{procedures.find(p => p.id === selectedProcedureId)?.name}</span>
                  <br />
                  Médico: <span className="text-purple-300">{doctors.find(d => d.id === selectedDoctorId)?.name}</span>
                  <br />
                  Data: <span className="text-purple-300">{new Date(selectedDate + "T00:00:00").toLocaleDateString('pt-BR')} às {selectedTime}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-purple-900/30 disabled:to-indigo-900/30 disabled:text-[#5c526a] text-xs font-bold text-white rounded-lg shadow-lg shadow-purple-950 transition-colors btn-interactive flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? "Cadastrando..." : "Confirmar Solicitação de Horário 📅"}
                </button>

                <button type="button" onClick={() => setStep(3)} className="text-[10px] font-bold text-slate-500 hover:text-slate-300 block text-center w-full mt-4">
                  ← Voltar para Data/Hora
                </button>
              </form>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
