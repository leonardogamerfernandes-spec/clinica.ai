"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

interface EstoqueItem {
  name: string;
  qty: string;
  expiry: string;
  supplier: string;
  status: string;
  code: string;
}

interface RhStaff {
  name: string;
  role: string;
  appointmentsCount: number;
  efficiency: string;
  billing: string;
  commission: string;
}

interface UnitData {
  name: string;
  billing: string;
  patientsCount: number;
  occupationRate: string;
  noShows: string;
}

interface SubscriptionInfo {
  planType: string;
  subscriptionStatus: string;
  messagesUsed: number;
  messagesLimit: number | string;
  features: string[];
}

export default function ConfiguraçõesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("assinatura");
  const [estoqueItems, setEstoqueItems] = useState<EstoqueItem[]>([]);
  const [rhStaff, setRhStaff] = useState<RhStaff[]>([]);
  const [unitsData, setUnitsData] = useState<UnitData[]>([]);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo>({
    planType: "FREE",
    subscriptionStatus: "FREE",
    messagesUsed: 14,
    messagesLimit: 100,
    features: ["100 Mensagens/mês", "1 Atendente", "Agendamento Básico"],
  });
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (searchParams.get("billing_success") === "true") {
      setShowSuccessToast(true);
      // Simular atualização no localStorage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          user.subscriptionStatus = "ACTIVE";
          user.planType = searchParams.get("plan") || "PRO";
          localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {}
      }
    }
  }, [searchParams]);

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/billing/status`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubInfo(data);
      }
    } catch (e) {
      console.warn("Failed to fetch subscription status");
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/settings/inventory`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEstoqueItems(data);
      }
    } catch (e) {
      console.warn("Failed to fetch inventory from server");
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/settings/staff`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRhStaff(data);
      }
    } catch (e) {
      console.warn("Failed to fetch staff from server");
    }
  };

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE_URL}/api/settings/branches`, { headers });
      if (res.ok) {
        const data = await res.json();
        setUnitsData(data);
      }
    } catch (e) {
      console.warn("Failed to fetch branches from server");
    }
  };

  useEffect(() => {
    fetchSubscription();
    if (activeTab === "estoque") fetchInventory();
    if (activeTab === "rh") fetchStaff();
    if (activeTab === "unidades") fetchBranches();
  }, [activeTab]);

  const handleCheckout = async (planType: string) => {
    setIsUpgrading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/billing/checkout`, {
        method: "POST",
        headers,
        body: JSON.stringify({ planType, interval: "annual" }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      }
    } catch (e) {
      console.warn("Failed to start checkout");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleAddInventoryItem = async () => {
    const newItem = {
      name: "Resina Filtek Z250 3M",
      code: "RE-" + Math.floor(100 + Math.random() * 900),
      qty: "5 bisnagas",
      expiry: "15 Jan 2027",
      supplier: "Dental Cremer",
      status: "ok"
    };

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_BASE_URL}/api/settings/inventory`, {
        method: "POST",
        headers,
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        fetchInventory();
      }
    } catch (e) {
      console.warn("Failed to add inventory item on server.");
      setEstoqueItems(prev => [...prev, newItem]);
    }
  };

  const isProActive = subInfo.subscriptionStatus === "ACTIVE" || subInfo.planType === "PRO" || subInfo.planType === "ENTERPRISE";

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-xl animate-fade-in-down">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">🎉</span>
            <div>
              <p className="text-white font-extrabold">Parabéns! Seu Plano PRO foi ativado com sucesso!</p>
              <p className="text-[11px] text-emerald-300/80 font-normal">Sua clínica agora tem disparos ilimitados e acesso total às funcionalidades de IA.</p>
            </div>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-400 hover:text-white px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {/* Sub-navigation tabs */}
      <div className="flex bg-[#0d071b]/60 border border-[#1b122c] p-1 rounded-xl backdrop-blur-md self-start max-w-xl">
        <button
          onClick={() => setActiveTab("assinatura")}
          className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "assinatura"
              ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] shadow-[0_0_8px_rgba(139,92,246,0.15)]"
              : "text-[#746985] hover:text-slate-300"
          }`}
        >
          Plano & Assinatura
        </button>
        <button
          onClick={() => setActiveTab("estoque")}
          className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "estoque"
              ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] shadow-[0_0_8px_rgba(139,92,246,0.15)]"
              : "text-[#746985] hover:text-slate-300"
          }`}
        >
          Estoque Clínico
        </button>
        <button
          onClick={() => setActiveTab("rh")}
          className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "rh"
              ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] shadow-[0_0_8px_rgba(139,92,246,0.15)]"
              : "text-[#746985] hover:text-slate-300"
          }`}
        >
          RH & Comissões
        </button>
        <button
          onClick={() => setActiveTab("unidades")}
          className={`flex-1 text-center py-2 px-4 text-xs font-semibold rounded-lg transition-all duration-150 ${
            activeTab === "unidades"
              ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/35 text-[#c084fc] shadow-[0_0_8px_rgba(139,92,246,0.15)]"
              : "text-[#746985] hover:text-slate-300"
          }`}
        >
          Multi-Unidades
        </button>
      </div>

      {/* Tab content wrapper */}
      <div className="animate-fade-in-up">

        {/* Tab 0: Plano & Assinatura */}
        {activeTab === "assinatura" && (
          <div className="space-y-6">
            {/* Current Plan Overview Card */}
            <div className="glass-panel-glow p-8 rounded-2xl border border-[#2b1c4b] relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border bg-purple-500/10 border-purple-500/20 text-purple-300 mb-3">
                    <span className={`w-2 h-2 rounded-full ${isProActive ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                    <span>Status: {isProActive ? "Plano Ativo (PRO)" : "Plano Gratuito"}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {subInfo.planType === "ENTERPRISE" ? "Plano Enterprise" : subInfo.planType === "PRO" ? "Plano Profissional (PRO)" : "Plano Starter Gratuito"}
                  </h2>
                  <p className="text-xs text-[#8a7f9a] mt-1">
                    {isProActive
                      ? "Sua clínica possui acesso ilimitado a todos os disparos de IA e copiloto."
                      : "Você está usando a versão de testes. Faça upgrade para desbloquear disparos ilimitados."}
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2">
                  {!isProActive ? (
                    <button
                      onClick={() => handleCheckout("PRO")}
                      disabled={isUpgrading}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-extrabold text-white transition-all active:scale-[0.97] shadow-lg shadow-purple-900/40"
                    >
                      {isUpgrading ? "Gerando Checkout..." : "Fazer Upgrade para PRO ⚡"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckout("ENTERPRISE")}
                      disabled={isUpgrading}
                      className="px-5 py-2.5 rounded-xl glass-panel text-xs font-bold text-slate-200 hover:text-white transition-all"
                    >
                      Fazer Upgrade para Enterprise →
                    </button>
                  )}
                </div>
              </div>

              {/* Usage Progress Bar */}
              <div className="mt-8 pt-6 border-t border-[#1f1437]">
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-[#8a7f9a]">Consumo de Mensagens no Mês</span>
                  <span className="text-purple-300 font-extrabold">
                    {subInfo.messagesUsed} / {subInfo.messagesLimit}
                  </span>
                </div>
                <div className="h-2 w-full bg-[#160d29] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{
                      width: typeof subInfo.messagesLimit === "number"
                        ? `${Math.min(100, (subInfo.messagesUsed / subInfo.messagesLimit) * 100)}%`
                        : "100%"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Plans Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-[#1f1437] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Starter</h3>
                  <p className="text-xs text-[#8a7f9a] mb-4">Gratuito para testes</p>
                  <p className="text-2xl font-extrabold text-white mb-4">R$ 0</p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>✓ 100 mensagens/mês</li>
                    <li>✓ Agendamento básico</li>
                  </ul>
                </div>
              </div>

              <div className="glass-panel-glow p-6 rounded-2xl border-2 border-purple-500/50 flex flex-col justify-between relative bg-purple-950/20">
                <div className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-extrabold uppercase">
                  Recomendado
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">PRO</h3>
                  <p className="text-xs text-purple-300 mb-4">Para clínicas ativas</p>
                  <p className="text-2xl font-extrabold text-white mb-4">R$ 97 <span className="text-xs text-[#8a7f9a]">/mês</span></p>
                  <ul className="space-y-2 text-xs text-slate-200">
                    <li>✓ Mensagens Ilimitadas</li>
                    <li>✓ Confirmador Anti No-Show</li>
                    <li>✓ Reativação de Pacientes</li>
                    <li>✓ Suporte Prioritário</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout("PRO")}
                  className="mt-6 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white transition-all"
                >
                  {subInfo.planType === "PRO" ? "Plano Atual" : "Selecionar PRO"}
                </button>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-[#1f1437] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Enterprise</h3>
                  <p className="text-xs text-[#8a7f9a] mb-4">Multi-unidades e hospitais</p>
                  <p className="text-2xl font-extrabold text-white mb-4">R$ 247 <span className="text-xs text-[#8a7f9a]">/mês</span></p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li>✓ Multi-unidades ilimitadas</li>
                    <li>✓ IA de Voz por Telefone</li>
                    <li>✓ Integração via API/Webhook</li>
                    <li>✓ Gerente de Conta Dedicado</li>
                  </ul>
                </div>
                <button
                  onClick={() => handleCheckout("ENTERPRISE")}
                  className="mt-6 w-full py-2.5 rounded-xl glass-panel text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  Selecionar Enterprise
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab 1: Estoque Clínico */}
        {activeTab === "estoque" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="glass-panel rounded-xl overflow-hidden border border-[#1b122c] lg:col-span-2">
              <div className="px-6 py-4 border-b border-[#1b122c] flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Controle de Insumos & Validade</h3>
                <button 
                  onClick={handleAddInventoryItem}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-colors btn-interactive"
                >
                  Adicionar Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#120822]/60 text-[#8a7f9a] border-b border-[#1b122c]">
                      <th className="px-6 py-3 font-semibold">Cód</th>
                      <th className="px-6 py-3 font-semibold">Item / Nome</th>
                      <th className="px-6 py-3 font-semibold">Qtd Disponível</th>
                      <th className="px-6 py-3 font-semibold">Validade</th>
                      <th className="px-6 py-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1b122c]">
                    {estoqueItems.map((item) => (
                      <tr key={item.code} className="hover:bg-white/[0.01] transition-colors duration-150">
                        <td className="px-6 py-4 font-mono text-[#786b8c]">{item.code}</td>
                        <td className="px-6 py-4 font-bold text-slate-200">{item.name}</td>
                        <td className="px-6 py-4 text-[#8a7f9a] font-medium">{item.qty}</td>
                        <td className="px-6 py-4 text-[#8a7f9a] font-medium">{item.expiry}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                            item.status === "ok"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : item.status === "critical"
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                          }`}>
                            {item.status === "ok" ? "Estoque Seguro" : item.status === "critical" ? "Reposição Imediata" : "Estoque Crítico"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel-glow rounded-xl p-5 border border-purple-950/20 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider text-glow-purple flex items-center gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                  Sugestões de Compra IA
                </h3>
                <p className="text-[10px] text-[#8a7f9a] leading-relaxed">
                  Previsões baseadas na média de procedimentos marcados para os próximos 15 dias.
                </p>

                <div className="space-y-3 mt-4">
                  <div className="p-3 bg-slate-950/40 rounded-lg border border-[#21163e]/40">
                    <span className="text-[10px] text-[#c084fc] font-bold">Compra Automática Sugerida</span>
                    <p className="text-xs text-white font-bold mt-1">2 caixas de Luva Látex Supermax</p>
                    <p className="text-[9px] text-[#8a7f9a] mt-0.5">Estoque dura apenas mais 4 dias.</p>
                  </div>

                  <div className="p-3 bg-slate-950/40 rounded-lg border border-[#21163e]/40">
                    <span className="text-[10px] text-[#c084fc] font-bold">Renovação Próxima</span>
                    <p className="text-xs text-white font-bold mt-1">1 bisnaga Resina Composta Z350</p>
                    <p className="text-[9px] text-[#8a7f9a] mt-0.5">Evitar falta para procedimentos de quinta.</p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-colors btn-interactive shadow shadow-purple-950">
                Aprovar & Emitir Ordem de Compra
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: RH & Produtividade */}
        {activeTab === "rh" && (
          <div className="glass-panel rounded-xl overflow-hidden border border-[#1b122c]">
            <div className="px-6 py-4 border-b border-[#1b122c]">
              <h3 className="text-sm font-bold text-white">Quadro de Colaboradores & Comissões</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#120822]/60 text-[#8a7f9a] border-b border-[#1b122c]">
                    <th className="px-6 py-3 font-semibold">Profissional</th>
                    <th className="px-6 py-3 font-semibold">Função / Cargo</th>
                    <th className="px-6 py-3 font-semibold">Consultas Efetuadas</th>
                    <th className="px-6 py-3 font-semibold">Taxa Ocupação</th>
                    <th className="px-6 py-3 font-semibold text-right">Faturamento Gerado</th>
                    <th className="px-6 py-3 font-semibold text-right">Comissão Devida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b122c]">
                  {rhStaff.map((staff) => (
                    <tr key={staff.name} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-6 py-4 font-bold text-slate-200">{staff.name}</td>
                      <td className="px-6 py-4 text-[#8a7f9a] font-medium">{staff.role}</td>
                      <td className="px-6 py-4 text-[#8a7f9a] font-semibold">{staff.appointmentsCount}</td>
                      <td className="px-6 py-4 text-[#8a7f9a] font-semibold">{staff.efficiency}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-200">{staff.billing}</td>
                      <td className="px-6 py-4 text-right font-extrabold text-purple-300">{staff.commission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Unidades */}
        {activeTab === "unidades" && (
          <div className="glass-panel rounded-xl overflow-hidden border border-[#1b122c]">
            <div className="px-6 py-4 border-b border-[#1b122c]">
              <h3 className="text-sm font-bold text-white">Comparativo de Desempenho entre Unidades</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#120822]/60 text-[#8a7f9a] border-b border-[#1b122c]">
                    <th className="px-6 py-3 font-semibold">Nome da Unidade</th>
                    <th className="px-6 py-3 font-semibold text-right">Faturamento Mensal</th>
                    <th className="px-6 py-3 font-semibold text-right">Atendimentos</th>
                    <th className="px-6 py-3 font-semibold text-right">Taxa Ocupação</th>
                    <th className="px-6 py-3 font-semibold text-right">No-Show / Falta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b122c]">
                  {unitsData.map((unit) => (
                    <tr key={unit.name} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-6 py-4 font-bold text-slate-200">{unit.name}</td>
                      <td className="px-6 py-4 text-right font-bold text-purple-300">{unit.billing}</td>
                      <td className="px-6 py-4 text-right text-[#8a7f9a] font-medium">{unit.patientsCount}</td>
                      <td className="px-6 py-4 text-right text-[#8a7f9a] font-medium">{unit.occupationRate}</td>
                      <td className="px-6 py-4 text-right font-semibold text-rose-400">{unit.noShows}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
