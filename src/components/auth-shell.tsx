"use client";

import { useApp } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";
import { Loader2 } from "lucide-react";

export default function AuthShell({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useApp((s) => s.isAuthenticated);
  const pathname = usePathname();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLoginRoute = pathname === "/login";

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !isLoginRoute) {
      router.replace("/login");
    } else if (isAuthenticated && isLoginRoute) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, isLoginRoute, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main
          id="main-content"
          className="flex-1 px-6 lg:px-10 py-8 max-w-[1600px] w-full mx-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
