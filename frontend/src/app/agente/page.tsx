"use client";

import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  type?: "text" | "chart" | "table";
  chartData?: { label: string; val: number }[];
  tableData?: any[];
}

export default function AgenteIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Olá, Dr. Leonardo! Sou o Copiloto Clínica.ai. Fui treinado exclusivamente nos dados da sua clínica. Pergunte-me qualquer detalhe sobre faturamento, produtividade, pacientes sumidos ou simulações financeiras.",
      type: "text"
    }
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const quickChips = [
    { text: "Quanto faturei este mês?", reply: "Este mês, o faturamento total acumulado foi de **R$ 148.500,00**, representando um crescimento de **+12.4%** em relação ao mesmo período do mês anterior. Abaixo está a partilha de receita pelos procedimentos mais realizados:", type: "chart", data: [
      { label: "Restaurac.", val: 42000 },
      { label: "Implante", val: 56000 },
      { label: "Claream.", val: 28000 },
      { label: "Limpeza", val: 22500 }
    ]},
    { text: "Pacientes sem retornar há mais de 3 meses", reply: "Identifiquei **3 pacientes** de alto valor que realizaram procedimentos há mais de 90 dias e não agendaram retornos de acompanhamento. Recomendo acionar campanha de reativação imediata:", type: "table", data: [
      { name: "Mariana Souza", lastVisit: "12 Mar 2026", procedure: "Clareamento", status: "Crítico" },
      { name: "Roberto Lima", lastVisit: "05 Fev 2026", procedure: "Canal Dente 24", status: "Pendente" },
      { name: "Fernanda Costa", lastVisit: "20 Jan 2026", procedure: "Implante F1", status: "Pendente" }
    ]},
    { text: "Previsão caso abra aos sábados?", reply: "Considerando a taxa de ocupação da agenda atual de 94%, a fila de encaixes de 40 pacientes e o ticket médio por consulta (R$ 380), estimamos que abrir aos sábados das 09:00 às 13:00 geraria uma **previsão de faturamento incremental de R$ 12.400,00 mensais**, com payback de custos operacionais em 2 meses.", type: "text" },
    { text: "Quem cancelou mais de 2 vezes?", reply: "Abaixo estão listados os pacientes com maior taxa de cancelamento/no-show sem justificativa prévia nos últimos 60 dias. Recomendo exigir pagamento adiantado na próxima consulta para mitigar prejuízos:", type: "table", data: [
      { name: "Thiago Ramos", lastVisit: "Hoje, 17:00", procedure: "Ortodontia", status: "3 Cancelam." },
      { name: "Ana Clara Souza", lastVisit: "Amanhã, 09:00", procedure: "Clareamento", status: "2 Cancelam." }
    ]}
  ];

  const handleSendMessage = async (text: string, customReply?: string, type?: "text" | "chart" | "table", data?: any) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Math.random().toString(), sender: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: text })
      });

      if (!res.ok) {
        throw new Error("Erro na comunicação com a IA.");
      }

      const aiData = await res.json();
      setIsTyping(false);

      const aiReply: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiData.text,
        type: aiData.type || "text",
        chartData: aiData.chartData,
        tableData: aiData.tableData
      };
      setMessages(prev => [...prev, aiReply]);
    } catch (err) {
      setIsTyping(false);
      const aiReply: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: customReply || "Não foi possível conectar com o Copiloto no momento. Certifique-se de que o servidor backend está online.",
        type: type || "text",
        chartData: type === "chart" ? data : undefined,
        tableData: type === "table" ? data : undefined
      };
      setMessages(prev => [...prev, aiReply]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
      
      {/* Left Chat Window Panel (lg:col-span-3) */}
      <div className="glass-panel rounded-xl flex flex-col h-[600px] lg:col-span-3 overflow-hidden animate-fade-in-up">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-[#1b122c] bg-[#0c0719]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Copiloto Inteligente</h3>
          </div>
          <span className="text-[9px] text-purple-400 bg-purple-950/40 border border-purple-500/10 px-2 py-0.5 rounded font-extrabold">
            ChatGPT Treinado
          </span>
        </div>

        {/* Quick Action Prompt Chips */}
        <div className="p-3 bg-[#100a1f]/30 border-b border-[#1b122c] flex gap-2 overflow-x-auto select-none no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.text, chip.reply, chip.type as any, chip.data)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-[#23183b] bg-[#120a22]/50 hover:bg-[#1a0f30] text-[10px] font-semibold text-slate-300 transition-all active:scale-[0.97]"
            >
              {chip.text}
            </button>
          ))}
        </div>

        {/* Message Bubble History Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start animate-fade-in-up"}`}
            >
              {/* Sender Tag */}
              <span className="text-[9px] text-[#716584] font-bold mb-1 uppercase tracking-wider">
                {msg.sender === "user" ? "Dr. Leonardo" : "Copiloto Clínico"}
              </span>

              {/* Message Bubble Box */}
              <div 
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-[#8b5cf6] text-white rounded-tr-none shadow-md shadow-purple-950/20" 
                    : "bg-[#140c26]/60 border border-[#2b1c4b] text-purple-200/90 rounded-tl-none shadow-inner"
                }`}
              >
                {/* Safe markdown mock render */}
                <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                
                {/* Dynamically Rendered SVG Chart inside AI Message Bubble */}
                {msg.type === "chart" && msg.chartData && (
                  <div className="mt-4 pt-3 border-t border-[#2b1c4b] space-y-2">
                    {msg.chartData.map((bar) => {
                      const maxVal = Math.max(...msg.chartData!.map(d => d.val));
                      const percent = (bar.val / maxVal) * 100;
                      return (
                        <div key={bar.label}>
                          <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-0.5">
                            <span>{bar.label}</span>
                            <span className="text-white">R$ {bar.val.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-[#23183b]">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500" 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Dynamically Rendered Table inside AI Message Bubble */}
                {msg.type === "table" && msg.tableData && (
                  <div className="mt-4 border border-[#23183b] rounded-lg overflow-hidden bg-slate-950/40 text-[10px]">
                    <div className="grid grid-cols-3 bg-slate-950 p-2 font-bold text-[#8a7f9a] border-b border-[#23183b]">
                      <span>Paciente</span>
                      <span>Última Visita</span>
                      <span className="text-right">Ação / Status</span>
                    </div>
                    <div className="divide-y divide-[#23183b]">
                      {msg.tableData.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-3 p-2 items-center text-slate-300">
                          <span className="font-bold">{row.name}</span>
                          <span className="text-[#8a7f9a]">{row.lastVisit || row.procedure}</span>
                          <div className="text-right">
                            <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-[8px] uppercase">
                              {row.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex flex-col mr-auto items-start max-w-[85%] animate-pulse">
              <span className="text-[9px] text-[#716584] font-bold mb-1 uppercase tracking-wider">Copiloto Clínico</span>
              <div className="px-4 py-3 bg-[#140c26]/60 border border-[#2b1c4b] text-purple-300 rounded-2xl rounded-tl-none text-xs">
                Digitando resposta...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar Footer */}
        <div className="p-4 border-t border-[#1b122c] bg-[#0c0719]/40 flex gap-2">
          <input
            type="text"
            placeholder="Faça perguntas sobre faturamento, no-shows ou simulações financeiras..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputVal)}
            className="flex-1 bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 hover:border-[#31254d] text-slate-200 text-xs px-4 py-2.5 rounded-lg outline-none placeholder:text-[#5a4e6e]"
          />
          <button 
            onClick={() => handleSendMessage(inputVal)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-colors btn-interactive"
          >
            Enviar
          </button>
        </div>
      </div>

      {/* Right AI Financial forecasting Dashboard (lg:col-span-2) */}
      <div className="lg:col-span-2 space-y-6 flex flex-col justify-start">
        
        {/* IA Financeira & Fluxo de Caixa Forecast */}
        <div className="glass-panel rounded-xl p-5 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a]">IA Financeira: Projeção</h3>
              <p className="text-[10px] text-[#5c526a] mt-0.5">Previsão e tendências de fluxo de caixa futuro</p>
            </div>
            <span className="text-[9px] text-[#10b981] bg-[#0d211e] border border-[#1b3d39] px-2 py-0.5 rounded font-bold">
              Fluxo Seguro
            </span>
          </div>

          {/* SVG Projeção Chart */}
          <div className="w-full relative h-[150px] mt-2 select-none">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="300" y2="100" stroke="rgba(255,255,255,0.03)" />

              {/* Past Months Line (Solid Purple) */}
              <path
                d="M 10,90 C 50,85 70,60 120,70 C 170,80 190,40 230,45"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2.5"
              />

              {/* Forecast Line (Dashed Green/Teal) */}
              <path
                d="M 230,45 C 250,47 270,25 290,15"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="drop-shadow-[0_0_4px_rgba(16,185,129,0.4)]"
              />

              {/* Highlight Nodes */}
              <circle cx="230" cy="45" r="4.5" fill="#8b5cf6" stroke="#080511" strokeWidth="1.5" />
              <circle cx="290" cy="15" r="4.5" fill="#10b981" stroke="#080511" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[9px] font-semibold text-[#5c526a] px-2 mt-2">
            <span>Maio (Real)</span>
            <span>Junho (Real)</span>
            <span>Julho (Projeção IA)</span>
          </div>
        </div>

        {/* AI Financial Alerts & Anomaly Detector */}
        <div className="glass-panel-glow rounded-xl p-5 border border-purple-950 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider text-glow-purple flex items-center gap-1.5 mb-4">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Alertas de Custos & Oportunidades
          </h3>

          <div className="space-y-3">
            {/* Cost Anomaly Alert */}
            <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/15 flex gap-2.5">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold text-rose-400 block uppercase">Desvio de Custo Detectado</span>
                <p className="text-[11px] text-rose-200/80 mt-0.5 leading-relaxed">
                  Custo com anestésicos tubetes subiu 12% acima da média regional. Sugerimos cotar com o fornecedor DentalGold.
                </p>
              </div>
            </div>

            {/* Recommendation Alert */}
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 flex gap-2.5">
              <span className="w-2.5 h-2.5 bg-purple-500 rounded-full flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="text-[10px] font-bold text-purple-300 block uppercase">Recomendação Comercial</span>
                <p className="text-[11px] text-purple-200/85 mt-0.5 leading-relaxed">
                  Elevar em 15% o valor do Clareamento a Laser. Sua margem atual está 10% defasada e a demanda está no pico semanal.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
