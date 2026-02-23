"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { SignOutButton } from "@clerk/nextjs";
import { 
  FiHome, 
  FiPackage, 
  FiBarChart2, 
  FiLogOut,
  FiMenu,
  FiX
} from "react-icons/fi";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/admin", label: "Dashboard", icon: FiHome },
  { href: "/admin/products", label: "Products", icon: FiPackage },
  { href: "/admin/analytics", label: "Analytics", icon: FiBarChart2 },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarExpanded, setIsDesktopSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-white">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-stone-200/70 bg-white/95 backdrop-blur-sm px-4 py-3">
        <h1 className="text-lg font-bold text-stone-900">Admin Panel</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="rounded-lg border border-stone-200 bg-white p-2 transition hover:bg-stone-50"
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-40 border-r border-stone-200/70 bg-white shadow-sm transition-all duration-300 ${
          isDesktopSidebarExpanded ? "lg:w-64" : "lg:w-20"
        }`}>
          <div className="flex flex-col h-full">
            {/* Logo and Toggle */}
            <div className="border-b border-stone-200/70 px-6 py-5 relative">
              {isDesktopSidebarExpanded ? (
                <>
                  <h1 className="text-xl font-bold text-stone-900 [font-family:var(--font-display)]">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">Manage your store</p>
                </>
              ) : (
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">AP</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => setIsDesktopSidebarExpanded(!isDesktopSidebarExpanded)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 rounded-full border border-stone-200 bg-white p-1.5 shadow-sm transition hover:bg-stone-50 hover:shadow"
                title={isDesktopSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
              >
                {isDesktopSidebarExpanded ? <FiX size={14} /> : <FiMenu size={14} />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-amber-100/70 text-amber-900"
                        : "text-stone-700 hover:bg-stone-100"
                    } ${!isDesktopSidebarExpanded ? "justify-center" : ""}`}
                    title={!isDesktopSidebarExpanded ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {isDesktopSidebarExpanded && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="border-t border-stone-200/70 p-3">
              <SignOutButton>
                <button className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 ${
                  !isDesktopSidebarExpanded ? "justify-center" : ""
                }`}
                title={!isDesktopSidebarExpanded ? "Logout" : undefined}
                >
                  <FiLogOut size={18} />
                  {isDesktopSidebarExpanded && <span>Logout</span>}
                </button>
              </SignOutButton>
            </div>
          </div>
        </aside>

        {/* Sidebar - Mobile */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 w-64 transform border-r border-stone-200/70 bg-white lg:hidden">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="border-b border-stone-200/70 px-6 py-5">
                  <h1 className="text-xl font-bold text-stone-900 [font-family:var(--font-display)]">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-stone-500 mt-1">Manage your store</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = router.pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                          isActive
                            ? "bg-amber-100/70 text-amber-900"
                            : "text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <Icon size={18} />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                {/* Logout Button */}
                <div className="border-t border-stone-200/70 p-3">
                  <SignOutButton>
                    <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50">
                      <FiLogOut size={18} />
                      Logout
                    </button>
                  </SignOutButton>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          isDesktopSidebarExpanded ? "lg:pl-64" : "lg:pl-20"
        }`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
