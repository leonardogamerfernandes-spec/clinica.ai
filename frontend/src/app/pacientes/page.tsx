"use client";

import { useState, useEffect } from "react";
import Odontograma from "@/components/Odontograma";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  initials: string;
  aiSummary: string;
  timeline: { date: string; title: string; category: string; description: string }[];
}

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [dbPatients, setDbPatients] = useState<Patient[]>([]);
  const [usingDemo, setUsingDemo] = useState(true);

  // Prescriptions EMR States
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState("");
  const [aiMedicines, setAiMedicines] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingPrescription, setIsSavingPrescription] = useState(false);

  // Standard mock fallback data
  const mockPatients: Patient[] = [
    {
      id: "1",
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "(11) 98765-4321",
      age: 34,
      initials: "MS",
      aiSummary: "Paciente em acompanhamento odontológico preventivo. Histórico leve de fobia dental (agulhas). Respondeu extremamente bem ao atendimento humanizado com sedação consciente na última sessão. Próxima etapa sugerida: Restauração estética dente 24.",
      timeline: [
        { date: "16 Jul 2026", title: "Upload de Hemograma Completo", category: "OCR IA", description: "Hemograma analisado via OCR. Valores de plaquetas e coagulação normais. Apto para cirurgia." },
        { date: "10 Mar 2026", title: "Receita Emitida", category: "Receita", description: "Prescrição de analgésico preventivo pós-canal pelo Dr. Leonardo." },
        { date: "05 Jan 2026", title: "Avaliação & Limpeza", category: "Consulta", description: "Limpeza semestral realizada. Registrado bom índice de higiene bucal." }
      ]
    },
    {
      id: "2",
      name: "Carlos Andrade",
      email: "carlos.andrade@email.com",
      phone: "(11) 91234-5678",
      age: 45,
      initials: "CA",
      aiSummary: "Tratamento de implante em andamento (Unidade Centro). Fase de cicatrização óssea concluída com sucesso. IA recomenda agendar a confecção da prótese definitiva para evitar movimentação dentária.",
      timeline: [
        { date: "22 Mai 2026", title: "Raio-X Panorâmico", category: "Exame", description: "Imagem anexada. Integração óssea do pino no dente 36 concluída com sucesso." },
        { date: "08 Fev 2026", title: "Cirurgia de Implante", category: "Cirurgia", description: "Procedimento realizado sob anestesia local. Sem intercorrências." }
      ]
    },
    {
      id: "3",
      name: "Ana Clara Souza",
      email: "anaclara@email.com",
      phone: "(11) 99888-7766",
      age: 27,
      initials: "AC",
      aiSummary: "Interesse em procedimentos puramente estéticos (Clareamento e Lentes de Contato). Encaixada na lista de campanhas ativas. IA detectou alta intenção de compra baseada em cliques no portal.",
      timeline: [
        { date: "17 Jul 2026", title: "Orçamento Criado", category: "Comercial", description: "Proposta de Lentes de Contato de porcelana (10 elementos) enviada para revisão." }
      ]
    }
  ];

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch("http://localhost:3001/api/patients", { headers });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const mapped: Patient[] = data.map((d: any) => ({
            id: d.id,
            name: d.name,
            email: `${d.name.toLowerCase().replace(/\s/g, "")}@email.com`,
            phone: d.phone,
            age: 35, // Default mock age
            initials: d.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2),
            aiSummary: d.notes || "Paciente registrado na base de dados do clínica.ai. Histórico clínico limpo. Nenhuma anotação de fobia.",
            timeline: [
              { date: "Hoje", title: "Cadastro Sincronizado", category: "DB Postgres", description: "Paciente carregado a partir do banco de dados relacional." }
            ]
          }));
          setDbPatients(mapped);
          setUsingDemo(false);
        }
      }
    } catch (err) {
      setUsingDemo(true);
    }
  };

  const fetchPrescriptions = async (patientId: string) => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`http://localhost:3001/api/patients/${patientId}/prescriptions`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPrescriptions(data);
      }
    } catch (e) {
      console.warn("Failed to load prescriptions list");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const [selectedPatientId, setSelectedPatientId] = useState("1");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const activeList = usingDemo ? mockPatients : dbPatients;
  const selectedPatient = activeList.find(p => p.id === selectedPatientId) || activeList[0] || mockPatients[0];

  useEffect(() => {
    if (selectedPatient?.id && !usingDemo) {
      fetchPrescriptions(selectedPatient.id);
      setAiMedicines("");
      setAiInstructions("");
      setSymptoms("");
    }
  }, [selectedPatientId, usingDemo]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];
      const mimeType = file.type;

      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch("http://localhost:3001/api/ai/ocr", {
          method: "POST",
          headers,
          body: JSON.stringify({
            fileBase64: base64Data,
            mimeType,
            patientId: selectedPatient?.id
          })
        });

        if (!res.ok) throw new Error("Erro no processamento do OCR.");
        const ocrResult = await res.json();

        setIsScanning(false);
        setScanResult({
          fileName: file.name,
          date: new Date().toLocaleDateString('pt-BR'),
          results: ocrResult.results || [],
          aiConclusion: ocrResult.aiConclusion || "Processado com sucesso."
        });

        fetchPatients();
      } catch (err) {
        setIsScanning(false);
        setScanResult({
          fileName: file.name,
          date: new Date().toLocaleDateString('pt-BR'),
          results: [
            { name: "Plaquetas", value: "280.000 /uL", status: "Normal" },
            { name: "Glicemia de Jejum", value: "88 mg/dL", status: "Excelente" },
            { name: "Hemoglobina", value: "14.2 g/dL", status: "Normal" }
          ],
          aiConclusion: "Não foi possível conectar ao servidor para OCR real. Exibindo resultado simulado: Exame normal, apto para procedimentos cirúrgicos."
        });
      }
    };
  };

  const handleGeneratePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:3001/api/patients/${selectedPatient.id}/prescriptions/generate-ai`, {
        method: "POST",
        headers,
        body: JSON.stringify({ symptoms })
      });

      if (res.ok) {
        const data = await res.json();
        setAiMedicines(data.medicines);
        setAiInstructions(data.instructions);
      }
    } catch (err) {
      console.warn("AI generation offline, loading mock");
      setAiMedicines("Ibuprofeno 600mg\nParacetamol 500mg");
      setAiInstructions("Ibuprofeno: 1 comprimido de 12/12h se houver dor ou inflamação.\nParacetamol: 1 comprimido de 8/8h se houver febre.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!aiMedicines.trim() || !aiInstructions.trim()) return;

    setIsSavingPrescription(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:3001/api/patients/${selectedPatient.id}/prescriptions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ medicines: aiMedicines, instructions: aiInstructions })
      });

      if (res.ok) {
        setAiMedicines("");
        setAiInstructions("");
        setSymptoms("");
        await fetchPrescriptions(selectedPatient.id);
      }
    } catch (err) {
      console.warn("Save offline");
    } finally {
      setIsSavingPrescription(false);
    }
  };

  const filteredPatients = activeList.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      
      {/* Left Column */}
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 lg:col-span-1 animate-fade-in-up">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-[#8a7f9a] uppercase tracking-wider">Pacientes</h3>
          <span className="text-[9px] text-slate-500 font-bold">
            {usingDemo ? "Demo" : "Postgres"}
          </span>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar paciente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs pl-8 pr-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
          />
          <span className="absolute left-2.5 top-2.5 text-[#5a4e6e]">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>

        <div className="space-y-1.5 mt-2">
          {filteredPatients.map(p => {
            const isSelected = p.id === selectedPatientId;
            return (
              <button
                key={p.id}
                onClick={() => { setSelectedPatientId(p.id); setScanResult(null); }}
                className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg transition-all duration-150 active:scale-[0.98] ${
                  isSelected 
                    ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-white" 
                    : "border border-transparent text-[#8a7f9a] hover:bg-white/[0.02]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                  isSelected ? "bg-purple-600 text-white" : "bg-[#181028] text-purple-400"
                }`}>
                  {p.initials}
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-300"}`}>{p.name}</h4>
                  <p className="text-[10px] opacity-75">{p.phone}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column */}
      {selectedPatient && (
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          
          {/* Header */}
          <div className="glass-panel rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/20 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-purple-900/30">
                {selectedPatient.initials}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-bold text-white leading-none">{selectedPatient.name}</h2>
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-950/30 border border-purple-500/10 px-2 py-0.5 rounded">
                    {selectedPatient.age} anos
                  </span>
                </div>
                <p className="text-xs text-[#8a7f9a] mt-1.5">{selectedPatient.email} • {selectedPatient.phone}</p>
              </div>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg border border-[#23183b] bg-[#120a22]/50 hover:bg-[#1a0f30] text-xs font-bold text-slate-300 btn-interactive">
              Editar Cadastro
            </button>
          </div>

          {/* AI health summary */}
          <div className="glass-panel-glow rounded-xl p-5 border border-purple-900/15 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-glow-purple flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
              Resumo do Prontuário por IA
            </h3>
            <p className="text-xs text-purple-200/90 leading-relaxed font-medium bg-[#140b26]/50 p-4 rounded-lg border border-purple-950/35 shadow-[inset_0_0_20px_rgba(139,92,246,0.02)]">
              {selectedPatient.aiSummary}
            </p>
          </div>

          {/* Odontograma Clínico Interativo */}
          {!usingDemo && (
            <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a] mb-4">
                Odontograma Clínico Interativo
              </h3>
              <Odontograma 
                patientId={selectedPatient.id} 
                onTreatmentUpdated={() => {
                  fetchPatients();
                  fetchPrescriptions(selectedPatient.id);
                }} 
              />
            </div>
          )}

          {/* OCR Document Scanner */}
          <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a]">Digitalizador de Exames (OCR IA)</h3>
                <p className="text-[10px] text-[#5c526a] mt-0.5">Extraia dados de receitas, exames e laudos automaticamente com IA</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="ocr-file-input"
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                />
                <button 
                  onClick={() => document.getElementById("ocr-file-input")?.click()}
                  disabled={isScanning}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-[#1a0f30] disabled:border-[#2b1f48] disabled:text-[#5a4e6e] text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  {isScanning ? "Escaneando..." : "Simular Upload OCR"}
                </button>
              </div>
            </div>

            {isScanning && (
              <div className="h-44 border border-dashed border-[#472894]/30 rounded-lg bg-[#140b24]/40 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_8px_#a78bfa] top-0 animate-[scanner-slide_1.5s_infinite_ease-in-out]" />
                <svg className="w-8 h-8 text-purple-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs text-purple-300 font-semibold mt-3 animate-pulse">Lendo pdf e extraindo biomarcadores...</span>
              </div>
            )}

            {scanResult && !isScanning && (
              <div className="border border-[#1b3d39] rounded-lg bg-[#0a1e1b]/40 p-4 space-y-3 animate-fade-in-up">
                <div className="flex justify-between items-center border-b border-[#1b3d39] pb-2 text-[10px] font-bold text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]" />
                    EXAME DIGITALIZADO COM SUCESSO
                  </span>
                  <span>{scanResult.date}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {scanResult.results.map((res: any) => (
                    <div key={res.name} className="p-3 bg-slate-950/40 rounded-lg border border-[#1b122c]">
                      <span className="text-[10px] text-[#8a7f9a] font-semibold block">{res.name}</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-white">{res.value}</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-[#11241f]/30 border border-[#1a4b3f]/30 rounded-lg">
                  <span className="text-[10px] font-bold text-emerald-400 block uppercase tracking-wider">Conclusão Inteligente (Copiloto):</span>
                  <p className="text-xs text-emerald-300/90 mt-1 leading-relaxed">{scanResult.aiConclusion}</p>
                </div>
              </div>
            )}
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scanner-slide {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
              }
            `}} />
          </div>

          {/* EMR & Prescrições Panel */}
          <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "180ms" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a] mb-4">
              Histórico de Prescrições & EMR
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Prescriptions List (Left) */}
              <div className="bg-[#0b0615]/70 border border-[#21163a]/40 rounded-xl p-4 flex flex-col gap-3 min-h-[220px]">
                <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Histórico de Receitas</h4>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[250px]">
                  {prescriptions.length > 0 ? (
                    prescriptions.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-950/40 border border-[#1b122c] rounded-lg">
                        <div className="flex justify-between items-center border-b border-[#21163e]/40 pb-1.5 mb-2">
                          <span className="text-[9px] text-[#8a7f9a] font-semibold">
                            Emitida em: {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[8px] bg-purple-950/20 border border-purple-500/10 text-purple-300 font-bold px-1.5 py-0.2 rounded uppercase">
                            Receita
                          </span>
                        </div>
                        <div className="text-[11px] font-bold text-white whitespace-pre-line leading-relaxed">{p.medicines}</div>
                        <div className="text-[10px] text-[#8a7f9a] mt-1.5 whitespace-pre-line leading-relaxed border-t border-[#1b122c] pt-1.5 italic">
                          {p.instructions}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#5c526a]">
                      <p className="text-[10px] italic">Nenhuma receita farmacológica registrada para este paciente.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescription Generator Form (Right) */}
              <div className="bg-[#0b0615]/70 border border-[#21163a]/40 rounded-xl p-4 flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Gerador de Receitas por IA (Gemini)</h4>
                
                <form onSubmit={handleGeneratePrescription} className="space-y-3 flex flex-col flex-1">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Quadro Clínico / Sintomas</label>
                    <input
                      type="text"
                      placeholder="Descreva o caso (Ex: dor forte pós extração de siso)"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      disabled={isGenerating}
                      className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating || !symptoms.trim()}
                    className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-[#1a0f30] disabled:text-[#5a4e6e] text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center justify-center gap-1.5"
                  >
                    {isGenerating ? "Consultando IA..." : "Sugerir Medicamentos via IA ✨"}
                  </button>
                </form>

                {/* Edit & Save suggestion area */}
                {(aiMedicines || aiInstructions) && (
                  <div className="space-y-3 mt-2 border-t border-[#21163d] pt-3 animate-fade-in-up">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Medicamentos sugeridos (Edite se necessário)</label>
                      <textarea
                        value={aiMedicines}
                        onChange={(e) => setAiMedicines(e.target.value)}
                        className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none min-h-[60px]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Posologia / Orientação</label>
                      <textarea
                        value={aiInstructions}
                        onChange={(e) => setAiInstructions(e.target.value)}
                        className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none min-h-[60px]"
                      />
                    </div>

                    <button
                      onClick={handleSavePrescription}
                      disabled={isSavingPrescription}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1a0f30] text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center justify-center gap-1.5"
                    >
                      {isSavingPrescription ? "Salvando..." : "Emitir & Registrar no Prontuário 📑"}
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Timeline */}
          <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a] mb-5">Histórico & Linha do Tempo (CRM)</h3>
            <div className="relative border-l-2 border-[#1c122e] pl-6 space-y-6 ml-2">
              {selectedPatient.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-[#080511] border-2 border-purple-500 flex items-center justify-center shadow">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#716584] font-bold">{item.date}</span>
                      <span className="px-1.5 py-0.2 bg-[#1b122c] border border-[#2d2047] text-[8px] font-bold text-purple-300 rounded uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1">{item.title}</h4>
                    <p className="text-[11px] text-[#8a7f9a] mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
