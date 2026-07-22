"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  time: string;
  status?: string;
}

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Live Chat Interactive Simulator State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: "user", text: "Olá! Gostaria de agendar uma limpeza de dente para quinta-feira à tarde.", time: "14:32" },
    { sender: "ai", text: "Olá! Sou a Clarinha, assistente da clínica. 🦷 Temos horário com a Dra. Mariana às 14:30 e às 16:00 na quinta-feira. Qual prefere?", time: "14:32" }
  ]);
  const [simulatedInput, setSimulatedInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSimulateChat = (presetText?: string) => {
    const textToSend = presetText || simulatedInput;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setSimulatedInput("");
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "Perfeito! Consulta agendada com sucesso. Enviarei um lembrete no seu WhatsApp 2h antes! ✨";
      const lower = textToSend.toLowerCase();

      if (lower.includes("convênio") || lower.includes("plano") || lower.includes("aceitam")) {
        responseText = "Atendemos Unimed, Bradesco Saúde, SulAmérica e consultas particulares com nota para reembolso!";
      } else if (lower.includes("preço") || lower.includes("quanto") || lower.includes("valor")) {
        responseText = "A avaliação inicial com limpeza completa fica R$ 180. Podemos parcelar em até 3x no cartão!";
      } else if (lower.includes("desmarcar") || lower.includes("cancelar") || lower.includes("remarcar")) {
        responseText = "Sem problemas! Vamos reagendar. Qual o melhor dia e horário para você na próxima semana?";
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: "ai",
          text: responseText,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  const faqs = [
    {
      question: "Como funciona a integração com o WhatsApp da minha clínica?",
      answer: "A integração é simples e leva menos de 5 minutos. Você conecta o seu WhatsApp existente através de leitura de QR Code direto no nosso painel. Não é necessário mudar de número!"
    },
    {
      question: "O paciente percebe que está conversando com uma Inteligência Artificial?",
      answer: "A IA é treinada para conversar com tom humano, empático e natural, usando a voz e regras da sua clínica. Se houver alguma solicitação atípica, o sistema transfere o atendimento instantaneamente para sua equipe humana."
    },
    {
      question: "Consigo limitar os horários e procedimentos que a IA pode agendar?",
      answer: "Sim! Você tem controle total. Define a agenda de cada profissional, duração dos procedimentos, limites de encaixes e convênios aceitos."
    },
    {
      question: "Como a plataforma ajuda a reduzir as faltas (no-show)?",
      answer: "O sistema dispara mensagens ativas de confirmação 24h e 2h antes do atendimento no WhatsApp do paciente com botões interativos (Confirmar / Reagendar). Se o paciente remarcar, o horário é liberado automaticamente para a lista de espera."
    },
    {
      question: "Preciso instalar algum software nos computadores da clínica?",
      answer: "Não! O Clínica.ai é 100% em nuvem. Você e sua equipe podem acessar o painel pelo navegador do computador, tablet ou celular de qualquer lugar."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07040e] text-slate-100 selection:bg-purple-600 selection:text-white font-sans relative overflow-x-hidden">
      
      {/* Dynamic Mesh Background Glows */}
      <div className="fixed inset-0 -z-10 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px] animate-glow-pulse" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] animate-glow-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[180px]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07040e]/70 border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/40 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-white font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-purple-400">
              Clínica.ai
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9c91b1]">
            <a href="#recursos" className="hover:text-white transition-colors">Recursos</a>
            <a href="#demonstracao" className="hover:text-white transition-colors">Demonstração</a>
            <a href="#planos" className="hover:text-white transition-colors">Planos & Preços</a>
            <a href="#depoimentos" className="hover:text-white transition-colors">Depoimentos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition-all duration-150 ease-out-strong active:scale-[0.97] shadow-lg shadow-purple-900/30 flex items-center gap-2"
              >
                <span>Ir para o Painel</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-bold text-[#b7abc9] hover:text-white px-3 py-2 transition-colors hidden sm:block"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white transition-all duration-150 ease-out-strong active:scale-[0.97] shadow-lg shadow-purple-900/35 hover:shadow-purple-700/50"
                >
                  Começar Grátis ⚡
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-6 text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 text-xs font-extrabold mb-8 shadow-[0_0_20px_rgba(139,92,246,0.15)] animate-fade-in-down">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>O Secretário de Inteligência Artificial #1 para Clínicas e Consultórios</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] max-w-5xl mx-auto animate-fade-in-up">
          Automatize seu WhatsApp e <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400">
            recupere 40% das consultas perdidas
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-[#9c91b1] max-w-3xl mx-auto font-normal leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Atendimento 24/7 no WhatsApp que agenda consultas, tira dúvidas de pacientes, envia lembretes automáticos e elimina o no-show da sua clínica sem esforço.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <Link
            href="/cadastro"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-extrabold text-white transition-all duration-200 ease-out-strong active:scale-[0.97] shadow-xl shadow-purple-900/40 hover:shadow-purple-700/60 flex items-center justify-center gap-3 group"
          >
            <span>Criar Conta Grátis na Clínica</span>
            <span className="group-hover:translate-x-1 transition-transform">⚡</span>
          </Link>

          <a
            href="#demonstracao"
            className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-sm font-bold text-slate-200 hover:text-white hover:border-purple-500/30 transition-all duration-200 ease-out-strong active:scale-[0.97] flex items-center justify-center gap-2"
          >
            <span>Ver Demonstração Interativa</span>
            <span>▶</span>
          </a>
        </div>

        {/* Hero Stats Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl font-extrabold text-white">98%</p>
            <p className="text-xs text-[#8a7f9a] font-semibold mt-1">Resolução Automática</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl font-extrabold text-purple-400">&lt; 45s</p>
            <p className="text-xs text-[#8a7f9a] font-semibold mt-1">Tempo de Resposta</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl font-extrabold text-white">14.000+</p>
            <p className="text-xs text-[#8a7f9a] font-semibold mt-1">Consultas Agendadas</p>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl font-extrabold text-emerald-400">3.5x</p>
            <p className="text-xs text-[#8a7f9a] font-semibold mt-1">Retorno sobre Investimento</p>
          </div>
        </div>
      </section>

      {/* Interactive WhatsApp Simulator Demo Section */}
      <section id="demonstracao" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Demonstração Interativa em Tempo Real</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Veja como a IA atende os pacientes da sua clínica
          </h2>
          <p className="text-sm text-[#9c91b1] mt-3 max-w-2xl mx-auto">
            Experimente clicar nas sugestões abaixo ou digite uma mensagem de teste para conversar com nosso agente em tempo real.
          </p>
        </div>

        <div className="max-w-4xl mx-auto glass-panel-glow rounded-3xl border border-[#2b1c4b] overflow-hidden shadow-2xl">
          {/* Top Mockup Header */}
          <div className="bg-[#120822] px-6 py-4 border-b border-[#25183f] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-900 font-black text-sm">
                  IA
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#120822] shadow-[0_0_8px_#10b981]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Clarinha - Assistente da Clínica</span>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">WhatsApp Oficial</span>
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">Online agora • Responde instantaneamente</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#8a7f9a]">
              <span>Modo Demonstração Ativo</span>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className="p-6 space-y-4 min-h-[320px] max-h-[420px] overflow-y-auto bg-[#0a0515]/80">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} animate-fade-in-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-medium ${
                    msg.sender === "user"
                      ? "bg-purple-600 text-white rounded-br-none shadow-md shadow-purple-900/30"
                      : "bg-[#1d1233] text-slate-200 border border-[#332254] rounded-bl-none shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-[#6d6182] mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-purple-300 font-medium bg-[#1d1233] border border-[#332254] px-4 py-2.5 rounded-2xl rounded-bl-none w-fit animate-pulse">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-1">Clarinha está digitando...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="px-6 py-3 bg-[#110821] border-t border-[#1f1437] flex flex-wrap gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d6182] self-center mr-2">Testar Pergunta:</span>
            <button
              onClick={() => handleSimulateChat("Quais convênios vocês aceitam?")}
              className="text-[11px] font-medium bg-[#1c1231] hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full transition-all active:scale-[0.96]"
            >
              "Quais convênios aceitam?" 🏥
            </button>
            <button
              onClick={() => handleSimulateChat("Qual o valor da consulta de avaliação?")}
              className="text-[11px] font-medium bg-[#1c1231] hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full transition-all active:scale-[0.96]"
            >
              "Qual o valor da consulta?" 💳
            </button>
            <button
              onClick={() => handleSimulateChat("Preciso desmarcar meu horário de amanhã.")}
              className="text-[11px] font-medium bg-[#1c1231] hover:bg-purple-900/40 text-purple-300 border border-purple-500/20 px-3 py-1 rounded-full transition-all active:scale-[0.96]"
            >
              "Preciso desmarcar meu horário" 📅
            </button>
          </div>

          {/* Simulator Input Bar */}
          <div className="p-4 bg-[#0e071c] border-t border-[#25183f] flex items-center gap-3">
            <input
              type="text"
              placeholder="Escreva uma mensagem simulada para testar o agente..."
              value={simulatedInput}
              onChange={(e) => setSimulatedInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSimulateChat()}
              className="flex-1 bg-[#160d2b] border border-[#2d1d4c] focus:border-purple-500 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none transition-all placeholder:text-[#675a7c]"
            />
            <button
              onClick={() => handleSimulateChat()}
              className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all active:scale-[0.96] shadow-lg shadow-purple-900/40"
            >
              Enviar 🚀
            </button>
          </div>
        </div>
      </section>

      {/* Main Features Grid Section */}
      <section id="recursos" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Recursos Exclusivos</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Tudo o que sua clínica precisa em uma só plataforma
          </h2>
          <p className="text-sm text-[#9c91b1] mt-3 max-w-2xl mx-auto">
            Projetado especialmente para médicos, dentistas, psicólogos e gestores de saúde que buscam eficiência extrema.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              🤖
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Agente WhatsApp 24/7</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Atenda pacientes a qualquer hora do dia ou da noite. A IA responde dúvidas de procedimentos, preços, convênios e efetua agendamentos diretamente na agenda.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Lembretes Anti No-Show</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Envio automático de confirmações com botões interativos no WhatsApp. Reduza drásticamente o número de faltas e mantenha sua agenda sempre lotada.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              🔄
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Reativação de Pacientes Sumidos</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Identifica automaticamente pacientes sem retorno há mais de 6 meses e envia mensagens personalizadas para agendamento de check-ups e retornos periódicos.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Painel BI & Previsão Financeira</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Tenha gráficos em tempo real da performance de agendamentos, taxa de conversão do WhatsApp e estimativa de faturamento semanal da clínica.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              🔗
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Página Pública de Agendamento</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Gere um link exclusivo para colocar na bio do Instagram ou Google Meu Negócio. Pacientes agendam em 3 cliques com confirmação imediata.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 text-xl font-bold mb-6 group-hover:scale-110 transition-transform">
              🔒
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Segurança & Conformidade LGPD</h3>
            <p className="text-xs text-[#9a8ea8] leading-relaxed">
              Criptografia de ponta a ponta e total segurança no armazenamento de dados médicos e contatos de pacientes, atendendo 100% da regulamentação de saúde.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Subscription Plans Section */}
      <section id="planos" className="py-20 max-w-7xl mx-auto px-6 relative">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Planos & Preços</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-2">
            Escolha o plano ideal para o tamanho da sua clínica
          </h2>
          <p className="text-sm text-[#9c91b1] mt-3 max-w-xl mx-auto">
            Sem taxas ocultas, sem fidelidade e cancele quando quiser.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="mt-8 inline-flex items-center gap-4 bg-[#130b24] p-1.5 rounded-full border border-[#2b1f48]">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                !isAnnual ? "bg-purple-600 text-white shadow-md shadow-purple-900/50" : "text-[#8a7f9a] hover:text-white"
              }`}
            >
              Faturamento Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                isAnnual ? "bg-purple-600 text-white shadow-md shadow-purple-900/50" : "text-[#8a7f9a] hover:text-white"
              }`}
            >
              <span>Faturamento Anual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Economize 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          
          {/* Plan 1: Free */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Plano Starter</h3>
                <span className="text-[10px] font-bold uppercase bg-[#181129] text-[#8a7f9a] px-2.5 py-1 rounded-full border border-[#2b1f48]">
                  Gratuito
                </span>
              </div>
              <p className="text-xs text-[#8a7f9a] mb-6">Perfeito para quem está começando a testar a automação por IA.</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">R$ 0</span>
                <span className="text-xs text-[#8a7f9a]"> /mês</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Até 100 mensagens automáticas/mês
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> 1 Atendente / Médico cadastrado
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Respostas automáticas padrão no WhatsApp
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Página de Agendamento Pública
                </li>
                <li className="flex items-center gap-2.5 text-[#5e536c] line-through">
                  <span className="text-[#5e536c]">✕</span> Disparos ativos de lembrete ilimitados
                </li>
                <li className="flex items-center gap-2.5 text-[#5e536c] line-through">
                  <span className="text-[#5e536c]">✕</span> Reativação automática de pacientes
                </li>
              </ul>
            </div>

            <Link
              href="/cadastro"
              className="w-full py-3 rounded-xl glass-panel text-center text-xs font-bold text-slate-200 hover:text-white hover:border-purple-500/40 transition-all active:scale-[0.97]"
            >
              Começar Gratuitamente
            </Link>
          </div>

          {/* Plan 2: Pro (Highlighted / Popular) */}
          <div className="glass-panel-glow p-8 rounded-3xl flex flex-col justify-between border-2 border-purple-500/60 relative shadow-[0_0_40px_rgba(139,92,246,0.2)] bg-gradient-to-b from-[#180d33] to-[#0c061a]">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
              Mais Escolhido pelas Clínicas 🚀
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 mt-2">
                <h3 className="text-xl font-extrabold text-white">Plano PRO</h3>
                <span className="text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded-full border border-purple-500/30">
                  Profissional
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mb-6">Para clínicas em crescimento que querem agenda cheia e zero no-show.</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "R$ 97" : "R$ 127"}
                </span>
                <span className="text-xs text-[#8a7f9a]"> /mês {isAnnual && "(cobrado anualmente)"}</span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-200 font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> <strong className="text-white">Mensagens & Disparos Ilimitados</strong>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Até 5 Médicos / Especialistas
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Voz & Regras Personalizadas da Clínica
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Confirmações Ativas Anti No-Show
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Reativação Automática de Pacientes Sumidos
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Painel Completo de BI & Métricas
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-purple-400 font-bold">✓</span> Suporte Prioritário no WhatsApp
                </li>
              </ul>
            </div>

            <Link
              href="/cadastro"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-center text-xs font-extrabold text-white transition-all active:scale-[0.97] shadow-lg shadow-purple-900/40"
            >
              Testar PRO por 14 Dias Grátis ⚡
            </Link>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between border border-white/[0.06] hover:border-purple-500/30 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <span className="text-[10px] font-bold uppercase bg-[#181129] text-[#8a7f9a] px-2.5 py-1 rounded-full border border-[#2b1f48]">
                  Corporativo
                </span>
              </div>
              <p className="text-xs text-[#8a7f9a] mb-6">Para redes de clínicas, hospitais e grandes centros médicos.</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">
                  {isAnnual ? "R$ 247" : "R$ 297"}
                </span>
                <span className="text-xs text-[#8a7f9a]"> /mês {isAnnual && "(cobrado anualmente)"}</span>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 font-medium mb-8">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Multi-unidades & Médicos Ilimitados
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Integração Customizada com Prontuários (API/Webhook)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Agente IA de Voz para Ligações Telefônicas
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Treinamento de IA Exclusivo da Equipe
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> Gerente de Conta Dedicado
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span> SLA de 99.9% de Disponibilidade
                </li>
              </ul>
            </div>

            <Link
              href="/cadastro"
              className="w-full py-3 rounded-xl glass-panel text-center text-xs font-bold text-slate-200 hover:text-white hover:border-purple-500/40 transition-all active:scale-[0.97]"
            >
              Falar com Consultor
            </Link>
          </div>

        </div>
      </section>

      {/* Social Proof & Testimonials Section */}
      <section id="depoimentos" className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Depoimentos Reais</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Quem usa recomenda o Clínica.ai
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl relative">
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              ★★★★★
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic mb-6">
              "Reduzimos nossas faltas de 25% para menos de 4% logo no primeiro mês. O robô atende tão bem no WhatsApp que meus pacientes acham que é a recepcionista."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center font-bold text-xs text-purple-300">
                DR
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dra. Camila Rocha</h4>
                <p className="text-[10px] text-[#8a7f9a]">Odontologia Estética • SP</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative">
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              ★★★★★
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic mb-6">
              "A reativação de pacientes sumidos me trouxe mais de R$ 12 mil em procedimentos que estavam parados no cadastro. O investimento se pagou no primeiro dia."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                RA
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dr. Rodrigo Alves</h4>
                <p className="text-[10px] text-[#8a7f9a]">Dermatologia • RJ</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl relative">
            <div className="flex items-center gap-1 text-amber-400 text-sm mb-4">
              ★★★★★
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic mb-6">
              "Minha recepcionista agora foca em dar atenção aos pacientes presenciais enquanto o WhatsApp é 100% gerenciado pela IA com perfeição."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-xs text-emerald-300">
                FL
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Dra. Fernanda Lima</h4>
                <p className="text-[10px] text-[#8a7f9a]">Clínica Nutrologia • BH</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">Dúvidas Frequentes</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            Perguntas & Respostas
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="glass-panel rounded-2xl overflow-hidden border border-white/[0.06] transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-white hover:text-purple-300 transition-colors"
              >
                <span>{faq.question}</span>
                <span className="text-purple-400 text-lg">{activeFaq === index ? "−" : "+"}</span>
              </button>
              {activeFaq === index && (
                <div className="px-6 pb-6 text-xs text-[#9a8ea8] leading-relaxed border-t border-white/[0.04] pt-4 animate-fade-in-down">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-6">
        <div className="glass-panel-glow rounded-3xl p-12 text-center border-2 border-purple-500/40 relative overflow-hidden bg-gradient-to-r from-[#170e2b] via-[#100821] to-[#1a0a33]">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Pronto para transformar o atendimento da sua clínica?
            </h2>
            <p className="text-sm text-purple-200/80 mt-4 leading-relaxed">
              Crie sua conta em menos de 2 minutos e comece a automatizar seus agendamentos hoje mesmo.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/cadastro"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-sm font-extrabold text-white transition-all duration-200 ease-out-strong active:scale-[0.97] shadow-xl shadow-purple-900/50 flex items-center gap-3"
              >
                <span>Começar Agora Gratuitamente</span>
                <span>⚡</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-12 bg-[#05030b]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#6d6182]">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
              ⚡
            </div>
            <span className="font-bold text-slate-300">Clínica.ai</span>
            <span>• © 2026 Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistemas Operacionais
            </span>
            <a href="/login" className="hover:text-white transition-colors">Login</a>
            <a href="/cadastro" className="hover:text-white transition-colors">Cadastro</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
