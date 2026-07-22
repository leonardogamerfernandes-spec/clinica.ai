"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";

interface Node {
  id: string;
  type: "trigger" | "action" | "condition";
  title: string;
  desc: string;
  status: "idle" | "active" | "success";
}

interface WhatsAppMsg {
  id: string;
  direction: "INCOMING" | "OUTGOING";
  content: string;
  createdAt: string;
  patient: {
    name: string;
    phone: string;
  };
}

interface ConnectionData {
  status: "CONNECTED" | "QR_CODE" | "DISCONNECTED";
  qrCode: string | null;
  phoneNumber: string | null;
  mode?: string;
}

export default function AutomacoesPage() {
  const [currentTab, setCurrentTab] = useState<"connection" | "flow" | "campaign">("connection");
  const [activeRecipe, setActiveRecipe] = useState("no-show");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  // WhatsApp Connection & QR Code State
  const [connectionData, setConnectionData] = useState<ConnectionData>({
    status: "QR_CODE",
    qrCode: null,
    phoneNumber: null,
  });
  const [isPairing, setIsPairing] = useState(false);

  // WhatsApp Simulation States
  const [messages, setMessages] = useState<WhatsAppMsg[]>([]);
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [usingDemo, setUsingDemo] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Marketing Campaigns CRM States
  const [campaignName, setCampaignName] = useState("");
  const [campaignPrompt, setCampaignPrompt] = useState("");
  const [campaignDrafts, setCampaignDrafts] = useState<any[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [campaignSuccess, setCampaignSuccess] = useState(false);

  // Recipes defined as node arrays
  const recipes: { [key: string]: Node[] } = {
    "no-show": [
      { id: "1", type: "trigger", title: "GATILHO: Paciente Falta", desc: "Consultas marcadas como No-Show na agenda", status: "idle" },
      { id: "2", type: "action", title: "AÇÃO: Disparar WhatsApp IA", desc: "Mensagem personalizada com link de remarcação rápida", status: "idle" },
      { id: "3", type: "condition", title: "CONDIÇÃO: Sem resposta em 2h?", desc: "Verifica se houve clique no link ou resposta do paciente", status: "idle" },
      { id: "4", type: "action", title: "AÇÃO: Tarefa na Recepção", desc: "Criar lembrete de ligação prioritária no CRM", status: "idle" }
    ],
    "confirm": [
      { id: "1", type: "trigger", title: "GATILHO: 24h antes da consulta", desc: "Disparado 24 horas antes do horário agendado", status: "idle" },
      { id: "2", type: "action", title: "AÇÃO: Confirmar por WhatsApp", desc: "Solicitar confirmação Sim/Não automática por texto", status: "idle" },
      { id: "3", type: "condition", title: "CONDIÇÃO: Confirmou?", desc: "Checar se resposta foi positiva (Sim)", status: "idle" },
      { id: "4", type: "action", title: "AÇÃO: Confirmar na Agenda", desc: "Alterar status do agendamento para Confirmado", status: "idle" }
    ],
    "birthday": [
      { id: "1", type: "trigger", title: "GATILHO: Dia do Aniversário", desc: "Disparado às 08:00 no dia de aniversário do paciente", status: "idle" },
      { id: "2", type: "action", title: "AÇÃO: Mensagem de Parabéns", desc: "Enviar felicitações + cupom de desconto em limpeza", status: "idle" },
      { id: "3", type: "action", title: "AÇÃO: Crédito Fidelidade", desc: "Adicionar R$ 20 de cashback na carteira virtual", status: "idle" }
    ]
  };

  const activeNodes = recipes[activeRecipe];

  // Fetch connection status
  const fetchConnection = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/whatsapp/connect`, { headers });
      if (res.ok) {
        const data = await res.json();
        setConnectionData(data);
      }
    } catch (err) {
      console.warn("Failed to fetch connection status");
    }
  };

  // Fetch real messaging history from backend
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/whatsapp/messages`, { headers });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setUsingDemo(false);
      }
    } catch (err) {
      setUsingDemo(true);
    }
  };

  useEffect(() => {
    fetchConnection();
    fetchMessages();
    const interval = setInterval(() => {
      fetchConnection();
      fetchMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSimulatePair = async () => {
    setIsPairing(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/whatsapp/pair`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        setConnectionData(data);
      }
    } catch (e) {
      setConnectionData({
        status: "CONNECTED",
        qrCode: null,
        phoneNumber: "+55 (11) 98765-4321",
      });
    } finally {
      setIsPairing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      await fetch(`${API_BASE_URL}/api/whatsapp/disconnect`, {
        method: "POST",
        headers,
      });
      fetchConnection();
    } catch (e) {
      setConnectionData({
        status: "QR_CODE",
        qrCode: null,
        phoneNumber: null,
      });
    }
  };

  // Simulates visual recipe node flow
  const handleTriggerSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationStep(1);

    const runStep = (step: number) => {
      if (step > activeNodes.length) {
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationStep(0);
        }, 1500);
        return;
      }
      setSimulationStep(step);
      setTimeout(() => {
        runStep(step + 1);
      }, 1000);
    };

    runStep(1);
  };

  // Sends simulated patient response to backend to run Gemini trigger logic
  const handleSimulateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSending(true);
    const postData = { phone, content };

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/whatsapp/simulate-incoming`, {
        method: "POST",
        headers,
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        await fetchMessages();
        setContent("");
      }
    } catch (err) {
      // Local sandbox fallback simulation if offline
      const newIncoming: WhatsAppMsg = {
        id: Math.random().toString(),
        direction: "INCOMING",
        content,
        createdAt: new Date().toISOString(),
        patient: { name: "Paciente Local", phone }
      };

      const patientName = "Paciente";
      let replyContent = "Entendido! Obrigado pela resposta.";
      const lower = content.toLowerCase();
      if (lower.includes("sim") || lower.includes("confirm")) {
        replyContent = `Maravilha, ${patientName}! Confirmei sua consulta na nossa agenda.`;
      } else if (lower.includes("remarc") || lower.includes("mudar") || lower.includes("alterar")) {
        replyContent = `Tudo bem, ${patientName}! Remarquei sua consulta para amanhã às 14:00. Fica bom?`;
      }

      const newOutgoing: WhatsAppMsg = {
        id: Math.random().toString(),
        direction: "OUTGOING",
        content: replyContent,
        createdAt: new Date().toISOString(),
        patient: { name: patientName, phone }
      };

      setMessages(prev => [...prev, newIncoming, newOutgoing]);
      setContent("");
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignPrompt.trim()) return;

    setIsDrafting(true);
    setCampaignSuccess(false);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/marketing/campaigns/draft`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: campaignPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setCampaignDrafts(data.drafts);
      }
    } catch (e) {
      setCampaignDrafts([
        { patientId: "1", patientName: "Maria Silva", phone: "(11) 98765-4321", content: `Olá Maria Silva! Faz tempo que você não realiza sua limpeza semestral. Que tal agendar para esta semana?` },
        { patientId: "2", patientName: "Carlos Andrade", phone: "(11) 91234-5678", content: `Olá Carlos Andrade! Como está a cicatrização do seu implante? Vamos agendar a prótese final?` }
      ]);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignName.trim() || campaignDrafts.length === 0) return;

    setIsSendingCampaign(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/marketing/campaigns/send`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: campaignName,
          prompt: campaignPrompt,
          drafts: campaignDrafts,
        }),
      });

      if (res.ok) {
        setCampaignSuccess(true);
        setCampaignDrafts([]);
        setCampaignName("");
        setCampaignPrompt("");
        fetchMessages();
      }
    } catch (e) {
      console.warn("Failed to send campaign");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tabs Menu */}
      <div className="flex gap-6 border-b border-[#21163e]/40 pb-px mb-2">
        <button
          onClick={() => setCurrentTab("connection")}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 ${
            currentTab === "connection" 
              ? "text-purple-300 border-b-2 border-purple-500" 
              : "text-[#8a7f9a] hover:text-slate-200"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${connectionData.status === "CONNECTED" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
          <span>Conexão do WhatsApp</span>
        </button>

        <button
          onClick={() => setCurrentTab("flow")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            currentTab === "flow" 
              ? "text-purple-300 border-b-2 border-purple-500" 
              : "text-[#8a7f9a] hover:text-slate-200"
          }`}
        >
          Automação de Confirmação & Faltas
        </button>

        <button
          onClick={() => setCurrentTab("campaign")}
          className={`pb-3 text-xs font-bold transition-all relative ${
            currentTab === "campaign" 
              ? "text-purple-300 border-b-2 border-purple-500" 
              : "text-[#8a7f9a] hover:text-slate-200"
          }`}
        >
          Campanhas de Marketing IA (CRM)
        </button>
      </div>

      {/* Tab Content 1: WhatsApp Connection & QR Code Scanner */}
      {currentTab === "connection" && (
        <div className="max-w-4xl mx-auto glass-panel-glow p-8 rounded-3xl border border-[#2b1c4b] animate-fade-in-up">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* Left Column: Instructions */}
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-purple-500/10 border-purple-500/20 text-purple-300">
                <span className={`w-2 h-2 rounded-full ${connectionData.status === "CONNECTED" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <span>Status: {connectionData.status === "CONNECTED" ? "Conectado em Produção" : "Aguardando Leitura do QR Code"}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {connectionData.status === "CONNECTED" 
                  ? "WhatsApp da Clínica Conectado! 🎉" 
                  : "Conecte o WhatsApp da sua Clínica"}
              </h2>

              <p className="text-xs text-[#8a7f9a] leading-relaxed">
                {connectionData.status === "CONNECTED"
                  ? `Seu número ${connectionData.phoneNumber || ""} está pareado e pronto para disparar confirmações automáticas e atender pacientes.`
                  : "Abra o aplicativo do WhatsApp no celular da clínica para vincular o número com o assistente virtual."}
              </p>

              {connectionData.status !== "CONNECTED" ? (
                <ol className="space-y-2 text-xs text-slate-300 font-medium pt-2">
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-[10px]">1</span>
                    Abra o WhatsApp no celular da clínica.
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-[10px]">2</span>
                    Toque em <strong>Configurações</strong> ou <strong>Menu (⋮)</strong> e selecione <strong>Aparelhos Conectados</strong>.
                  </li>
                  <li className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 font-bold flex items-center justify-center text-[10px]">3</span>
                    Toque em <strong>Conectar um Aparelho</strong> e aponte a câmera para o QR Code ao lado.
                  </li>
                </ol>
              ) : (
                <div className="pt-4">
                  <button
                    onClick={handleDisconnect}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all active:scale-[0.97]"
                  >
                    Desconectar Número da Clínica
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: QR Code Display Container */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#0c0618] border border-[#23153f] rounded-2xl">
              {connectionData.status === "CONNECTED" ? (
                <div className="w-56 h-56 flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-3xl font-extrabold mb-3 animate-bounce">
                    ✓
                  </div>
                  <h3 className="text-sm font-bold text-white">Chip Conectado</h3>
                  <p className="text-[10px] text-[#8a7f9a] mt-1">{connectionData.phoneNumber || "Instância Ativa"}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-52 h-52 bg-white p-3 rounded-xl shadow-2xl flex items-center justify-center overflow-hidden relative group">
                    {connectionData.qrCode ? (
                      <img src={connectionData.qrCode} alt="WhatsApp QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center text-purple-400 text-xs font-bold animate-pulse">
                        Gerando QR Code...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSimulatePair}
                    disabled={isPairing}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-xs font-extrabold text-white transition-all active:scale-[0.97] shadow-lg shadow-purple-900/40"
                  >
                    {isPairing ? "Conectando..." : "Simular Leitura de QR Code ⚡"}
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {currentTab === "flow" && (
        /* Visual flow simulator & Templates split */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Column: Automation Templates/Recipes List */}
          <div className="glass-panel rounded-xl p-4 flex flex-col gap-3 lg:col-span-1 animate-fade-in-up">
            <h3 className="text-xs font-bold text-[#8a7f9a] uppercase tracking-wider px-1">Templates Recomendados</h3>
            <p className="text-[10px] text-[#5c526a] px-1">Ative regras de engajamento em segundos sem digitar uma linha de código</p>
            
            <div className="space-y-1.5 mt-2">
              <button
                onClick={() => { setActiveRecipe("no-show"); setSimulationStep(0); }}
                className={`w-full text-left p-3 rounded-lg border transition-all active:scale-[0.98] ${
                  activeRecipe === "no-show" 
                    ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-white" 
                    : "border-[#1c142c] text-[#8a7f9a] hover:bg-white/[0.02]"
                }`}
              >
                <h4 className="text-xs font-bold">Mitigação de Faltas</h4>
                <p className="text-[10px] opacity-75 mt-1">Disparar WhatsApp e criar tarefas em caso de no-show.</p>
              </button>

              <button
                onClick={() => { setActiveRecipe("confirm"); setSimulationStep(0); }}
                className={`w-full text-left p-3 rounded-lg border transition-all active:scale-[0.98] ${
                  activeRecipe === "confirm" 
                    ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-white" 
                    : "border-[#1c142c] text-[#8a7f9a] hover:bg-white/[0.02]"
                }`}
              >
                <h4 className="text-xs font-bold">Confirmação 24h</h4>
                <p className="text-[10px] opacity-75 mt-1">Lembrete automático com verificação de resposta Sim/Não.</p>
              </button>

              <button
                onClick={() => { setActiveRecipe("birthday"); setSimulationStep(0); }}
                className={`w-full text-left p-3 rounded-lg border transition-all active:scale-[0.98] ${
                  activeRecipe === "birthday" 
                    ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/30 text-white" 
                    : "border-[#1c142c] text-[#8a7f9a] hover:bg-white/[0.02]"
                }`}
              >
                <h4 className="text-xs font-bold">Fidelidade: Aniversário</h4>
                <p className="text-[10px] opacity-75 mt-1">Parabéns automatizado com envio de cupom e cashback.</p>
              </button>
            </div>
          </div>

          {/* Right Column: n8n visual flow builder canvas */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* Canvas Header */}
            <div className="glass-panel rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Editor de Automação Visual</h2>
                </div>
                <p className="text-[10px] text-[#8a7f9a] mt-1">Simule ou publique fluxos automáticos de tarefas para a sua equipe</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleTriggerSimulation}
                  disabled={isSimulating}
                  className="px-4 py-1.5 rounded-lg border border-[#23183b] bg-[#120a22]/50 hover:bg-[#1a0f30] disabled:bg-[#150f24]/20 disabled:text-[#5a4e6e] disabled:border-[#1b152b] text-xs font-bold text-slate-300 btn-interactive"
                >
                  {isSimulating ? `Simulando Passo ${simulationStep}...` : "Simular Fluxo ⚡"}
                </button>
                
                <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-900/30 btn-interactive">
                  Salvar & Ativar
                </button>
              </div>
            </div>

            {/* Builder Canvas (Visual Nodes) */}
            <div className="glass-panel-glow rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <div className="absolute inset-0 bg-[radial-gradient(#271649_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

              <div className="flex flex-col items-center gap-12 relative z-10 w-full max-w-md">
                {activeNodes.map((node, index) => {
                  const stepNum = index + 1;
                  const isNodeActive = isSimulating && simulationStep === stepNum;
                  const isNodeSuccess = isSimulating && simulationStep > stepNum;
                  
                  return (
                    <div key={node.id} className="w-full flex flex-col items-center relative">
                      
                      <div 
                        className={`w-full max-w-sm p-4 rounded-xl border transition-all duration-300 ${
                          isNodeActive 
                            ? "bg-[#8b5cf6]/15 border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-[1.02]" 
                            : isNodeSuccess 
                            ? "bg-[#10b981]/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "bg-[#110c1c]/90 border-[#2b1c4b]"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                            node.type === "trigger"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                              : node.type === "condition"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-purple-500/10 border-purple-500/20 text-purple-300"
                          }`}>
                            {node.type}
                          </span>

                          <span className={`w-2 h-2 rounded-full ${
                            isNodeActive 
                              ? "bg-purple-400 animate-ping" 
                              : isNodeSuccess 
                              ? "bg-emerald-500 shadow-[0_0_6px_#10b981]" 
                              : "bg-slate-700"
                          }`} />
                        </div>

                        <h4 className="text-xs font-bold text-white mt-3">{node.title}</h4>
                        <p className="text-[10px] text-[#8a7f9a] mt-1">{node.desc}</p>
                      </div>

                      {index < activeNodes.length - 1 && (
                        <div className="absolute top-full h-12 w-0.5 bg-gradient-to-b from-purple-500/55 to-[#2b1c4b] z-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Chat Gateway Logs */}
            <div className="glass-panel rounded-xl p-5 flex flex-col h-[400px] justify-between relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "150ms" }}>
              <div className="flex justify-between items-center border-b border-[#21163e]/40 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gateway Simulador do WhatsApp</h3>
                  <p className="text-[10px] text-[#8a7f9a] mt-0.5">Envie mensagens de teste para ver o copiloto responder na hora</p>
                </div>
                <span className="text-[9px] bg-[#1d1238] border border-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded uppercase">
                  {usingDemo ? "Mock Sandbox" : "Conexão Ativa"}
                </span>
              </div>

              {/* Chat Timeline */}
              <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-2 max-h-[250px]">
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOutgoing = msg.direction === "OUTGOING";
                    return (
                      <div key={msg.id} className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
                        <div 
                          className={`max-w-[75%] p-3 rounded-xl border text-xs leading-relaxed ${
                            isOutgoing 
                              ? "bg-[#2c1654]/40 border-purple-500/30 text-purple-100 rounded-br-none" 
                              : "bg-slate-950/60 border-[#1f1533] text-slate-200 rounded-bl-none"
                          }`}
                        >
                          <span className="text-[8px] opacity-75 font-bold block mb-1 text-[#8a7f9a]">
                            {isOutgoing ? "Clínica.ai (Copiloto)" : `${msg.patient?.name || "Paciente"} (${msg.patient?.phone || ""})`}
                          </span>
                          <span className="whitespace-pre-line">{msg.content}</span>
                          <span className="text-[7px] text-right block mt-1.5 opacity-60">
                            {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-[#5c526a] italic text-center py-10">Nenhuma mensagem registrada no gateway do WhatsApp.</p>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSimulateMessage} className="flex gap-3 border-t border-[#21163e]/40 pt-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Telefone do Paciente"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="col-span-1 bg-[#100a1f] border border-[#21163a] text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                  />
                  <input
                    type="text"
                    placeholder="Digite a resposta do paciente..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="col-span-2 bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSending}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-[#1a0f30] text-xs font-bold text-white rounded-lg transition-colors btn-interactive"
                >
                  {isSending ? "Enviando..." : "Simular Resposta ⚡"}
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {currentTab === "campaign" && (
        /* Marketing Campaigns CRM View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-4 lg:col-span-1 animate-fade-in-up">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-[#8a7f9a] mb-1">Criar Nova Campanha IA</h3>
            <p className="text-[10px] text-[#5c526a] mt-0.5">Filtre pacientes inativos no banco e utilize a inteligência do Gemini para criar prospecções individuais.</p>

            {campaignSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-bold text-center animate-bounce">
                ✓ Campanha enviada com sucesso para toda a audiência!
              </div>
            )}

            <form onSubmit={handleCreateDraft} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Campanha Clareamento Julho"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-[#100a1f] border border-[#21163a] text-slate-200 text-xs px-3 py-2 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Objetivo / Prompt da Campanha</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ex: Oferecer clareamento dental a laser com 15% de desconto para pacientes inativos há mais de 3 meses. Convide-os a reagendar um horário."
                  value={campaignPrompt}
                  onChange={(e) => setCampaignPrompt(e.target.value)}
                  className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
                />
              </div>

              <button
                type="submit"
                disabled={isDrafting || !campaignPrompt.trim() || !campaignName.trim()}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-[#1a0f30] text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center justify-center gap-1.5"
              >
                {isDrafting ? "Elaborando Audiência..." : "Esboçar Mensagens por IA ✨"}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="glass-panel rounded-xl p-5 flex flex-col h-[530px] justify-between relative overflow-hidden animate-fade-in-up" style={{ animationDelay: "50ms" }}>
              <div className="flex justify-between items-center border-b border-[#21163e]/40 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Mensagens Personalizadas Rascunhadas ({campaignDrafts.length})</h3>
                  <p className="text-[10px] text-[#8a7f9a] mt-0.5">As mensagens abaixo foram customizadas baseadas no histórico clínico do paciente no Postgres</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 my-4 pr-1 max-h-[380px]">
                {isDrafting ? (
                  <div className="h-full flex flex-col items-center justify-center py-20 text-center gap-3">
                    <span className="w-8 h-8 rounded-full border-4 border-t-purple-500 border-purple-950 animate-spin" />
                    <p className="text-xs text-purple-300 font-bold animate-pulse">Gemini está analisando o prontuário de cada paciente para escrever mensagens personalizadas...</p>
                  </div>
                ) : campaignDrafts.length > 0 ? (
                  campaignDrafts.map((d, index) => (
                    <div key={index} className="p-3.5 bg-slate-950/40 border border-[#1d1235] rounded-xl relative overflow-hidden">
                      <div className="flex justify-between items-center border-b border-[#22173f]/50 pb-2 mb-2">
                        <h4 className="text-xs font-bold text-purple-200">{d.patientName}</h4>
                        <span className="text-[9px] text-[#8a7f9a]">{d.phone}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">"{d.content}"</p>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 text-[#5c526a]">
                    <p className="text-xs italic">Nenhuma campanha esboçada. Digite o objetivo ao lado e gere as mensagens.</p>
                  </div>
                )}
              </div>

              {campaignDrafts.length > 0 && (
                <div className="border-t border-[#21163e]/40 pt-4 flex justify-between items-center">
                  <div className="text-[10px] text-[#8a7f9a]">
                    Mensagens prontas: <strong className="text-slate-200">{campaignDrafts.length} disparos</strong>
                  </div>

                  <button
                    onClick={handleSendCampaign}
                    disabled={isSendingCampaign}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center gap-1.5"
                  >
                    {isSendingCampaign ? "Disparando Lote..." : "Publicar Campanha & Disparar em Lote 🚀"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
