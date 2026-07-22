"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Erro ao realizar login.");
      }

      // Store token and user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to main dashboard
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Não foi possível se conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080511] px-4 relative overflow-hidden select-none">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel-glow rounded-2xl p-8 z-10 animate-fade-in-up">
        {/* Logo/Clinic Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-3.5 h-3.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight uppercase">
              Clínica<span className="text-purple-400 font-medium">.ai</span>
            </h1>
          </div>
          <p className="text-xs text-[#8a7f9a] mt-1">
            Entre na sua conta para gerenciar consultas e automações
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold animate-fade-in-down">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8a7f9a] uppercase tracking-wider block">
              E-mail Comercial
            </label>
            <input
              type="email"
              required
              placeholder="exemplo@clinica.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#100a1f]/80 border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none placeholder:text-[#5a4e6e] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-[#8a7f9a] uppercase tracking-wider block">
                Sua Senha
              </label>
              <a href="#" className="text-[10px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                Esqueceu a senha?
              </a>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#100a1f]/80 border border-[#21163a] focus:border-purple-500/50 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none placeholder:text-[#5a4e6e] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-purple-900/30 btn-interactive flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validando Acesso...
              </>
            ) : (
              "Entrar no Painel ⚡"
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center border-t border-[#1b122c] pt-5">
          <p className="text-xs text-[#8a7f9a]">
            Não tem uma clínica registrada?{" "}
            <Link href="/cadastro" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
              Criar Conta Grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
