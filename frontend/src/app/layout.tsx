import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/AuthGuard";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Clínica.ai | Painel do Agente",
  description: "Gerencie os agendamentos e o agente de IA da sua clínica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative">
        {/* Glowing Mesh Background */}
        <div className="fixed inset-0 -z-10 bg-[#07040e] overflow-hidden pointer-events-none select-none">
          <div className="absolute top-[-20%] left-[-10%] w-[65%] h-[65%] rounded-full bg-purple-950/15 blur-[140px] opacity-80 animate-glow-pulse" />
          <div className="absolute bottom-[-15%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#200b47]/15 blur-[160px] opacity-75" />
          <div className="absolute top-[25%] right-[20%] w-[45%] h-[45%] rounded-full bg-indigo-950/10 blur-[120px] opacity-60" />
        </div>

        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
