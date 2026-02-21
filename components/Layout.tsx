import type { ReactNode } from "react";
import { useRouter } from "next/router";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartModal } from "@/components/CartModal";

export function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-[-120px] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute top-40 left-[-160px] h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
      </div>
      {!isAdminPage && <Header />}
      <main className={`relative z-10 px-6 pb-16 lg:px-12 ${isAdminPage ? "pt-8" : "pt-10"}`}>{children}</main>
      <Footer />
      <CartModal />
    </div>
  );
}
