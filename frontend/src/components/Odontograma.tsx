"use client";

import { useState, useEffect } from "react";

interface ToothTreatment {
  id?: string;
  toothNumber: number;
  condition: "CARIES" | "CANAL" | "IMPLANT" | "CROWN" | "HEALTHY";
  notes?: string;
}

interface OdontogramaProps {
  patientId: string;
  onTreatmentUpdated?: () => void;
}

export default function Odontograma({ patientId, onTreatmentUpdated }: OdontogramaProps) {
  const [treatments, setTreatments] = useState<ToothTreatment[]>([]);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [condition, setCondition] = useState<"CARIES" | "CANAL" | "IMPLANT" | "CROWN" | "HEALTHY">("HEALTHY");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchTreatments = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`http://localhost:3001/api/patients/${patientId}/teeth`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTreatments(data);
      }
    } catch (e) {
      console.warn("Failed to load teeth treatments");
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchTreatments();
      setSelectedTooth(null);
    }
  }, [patientId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTooth === null) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`http://localhost:3001/api/patients/${patientId}/teeth`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          toothNumber: selectedTooth,
          condition,
          notes,
        }),
      });

      if (res.ok) {
        await fetchTreatments();
        setSelectedTooth(null);
        setNotes("");
        if (onTreatmentUpdated) {
          onTreatmentUpdated();
        }
      }
    } catch (e) {
      console.warn("Failed to save tooth treatment");
    } finally {
      setIsSaving(false);
    }
  };

  const getToothStatus = (num: number) => {
    return treatments.find((t) => t.toothNumber === num) || { toothNumber: num, condition: "HEALTHY" as const, notes: "" };
  };

  const getToothColor = (cond: string) => {
    switch (cond) {
      case "CARIES": return "bg-rose-500/25 border-rose-500 text-rose-300";
      case "CANAL": return "bg-purple-500/25 border-purple-500 text-purple-300";
      case "IMPLANT": return "bg-cyan-500/25 border-cyan-500 text-cyan-300";
      case "CROWN": return "bg-amber-500/25 border-amber-500 text-amber-400";
      default: return "bg-slate-950/40 border-[#22173f] text-[#8a7f9a] hover:bg-purple-900/10";
    }
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case "CARIES": return "Cárie";
      case "CANAL": return "Canal";
      case "IMPLANT": return "Implante";
      case "CROWN": return "Coroa";
      default: return "Saudável";
    }
  };

  // Arches teeth listings (ISO standard)
  const upperRow = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const lowerRow = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-950/20 border border-[#21163e]/40 rounded-xl relative overflow-hidden">
        
        {/* Superior Arch */}
        <div>
          <span className="text-[8px] font-bold text-[#8a7f9a] uppercase tracking-wider block mb-2">Arcada Superior</span>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 justify-center">
            {upperRow.map((num) => {
              const info = getToothStatus(num);
              const isSelected = selectedTooth === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => { setSelectedTooth(num); setCondition(info.condition); setNotes(info.notes || ""); }}
                  className={`p-2 rounded-lg border text-center text-xs font-bold transition-all active:scale-95 ${
                    isSelected ? "ring-2 ring-purple-500 border-purple-500 scale-105" : ""
                  } ${getToothColor(info.condition)}`}
                >
                  <span className="block text-[8px] opacity-75">{num}</span>
                  <span className="block text-[14px] mt-0.5">🦷</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-dashed border-[#22173f]/50" />

        {/* Inferior Arch */}
        <div>
          <span className="text-[8px] font-bold text-[#8a7f9a] uppercase tracking-wider block mb-2">Arcada Inferior</span>
          <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 justify-center">
            {lowerRow.map((num) => {
              const info = getToothStatus(num);
              const isSelected = selectedTooth === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => { setSelectedTooth(num); setCondition(info.condition); setNotes(info.notes || ""); }}
                  className={`p-2 rounded-lg border text-center text-xs font-bold transition-all active:scale-95 ${
                    isSelected ? "ring-2 ring-purple-500 border-purple-500 scale-105" : ""
                  } ${getToothColor(info.condition)}`}
                >
                  <span className="block text-[14px] mb-0.5">🦷</span>
                  <span className="block text-[8px] opacity-75">{num}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Editor Panel Overlay */}
      {selectedTooth !== null && (
        <form onSubmit={handleSave} className="p-4 bg-[#110823]/80 border border-purple-900/30 rounded-xl space-y-3 animate-fade-in-up">
          <div className="flex justify-between items-center border-b border-[#221742] pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>🦷 Editar Dente {selectedTooth}</span>
              <span className="text-[10px] text-purple-400 font-medium">({getConditionLabel(getToothStatus(selectedTooth).condition)})</span>
            </h4>
            <button type="button" onClick={() => setSelectedTooth(null)} className="text-[10px] text-slate-500 hover:text-slate-300">Fechar</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Condition Select */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Condição Dental</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full bg-[#100a1f] border border-[#21163a] text-slate-200 text-xs px-3 py-2 rounded-lg outline-none"
              >
                <option value="HEALTHY">Saudável (Restaurado)</option>
                <option value="CARIES">Cárie Ativa</option>
                <option value="CANAL">Canal Necessário</option>
                <option value="IMPLANT">Implante Realizado</option>
                <option value="CROWN">Coroa Protética</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-[#8a7f9a] uppercase tracking-wider block">Observações do dente</label>
              <input
                type="text"
                placeholder="Ex: canal tratado em sessão única"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#100a1f] border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-3 py-2 rounded-lg outline-none placeholder:text-[#5a4e6e]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-[#1a0f30] text-xs font-bold text-white rounded-lg transition-colors btn-interactive flex items-center justify-center gap-1.5"
          >
            {isSaving ? "Salvando..." : "Salvar Tratamento de Dente 🦷"}
          </button>
        </form>
      )}
    </div>
  );
}
