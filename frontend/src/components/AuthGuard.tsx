"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/cadastro" ||
    pathname === "/agendar" ||
    (pathname?.startsWith("/agendar/") ?? false);

  const isAuthPage = pathname === "/login" || pathname === "/cadastro";

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthenticated(false);
      if (!isPublicPage) {
        router.push("/login");
      }
    } else {
      setIsAuthenticated(true);
      if (isAuthPage) {
        router.push("/dashboard");
      }
    }
  }, [pathname, router, isPublicPage, isAuthPage]);

  // Loading state to prevent flashing of protected contents
  if (isAuthenticated === null && !isPublicPage) {
    return (
      <div className="fixed inset-0 bg-[#080511] flex flex-col items-center justify-center gap-4 z-50">
        <span className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest animate-pulse">Carregando...</span>
      </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <Topbar />
      <main className="ml-64 p-8 flex-1 relative z-0">
        {children}
      </main>
    </>
  );
}
