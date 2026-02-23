"use client";

import { ReactNode, useState, useEffect } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";

interface AdminAuthGuardProps {
  children: ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const [passwordInput, setPasswordInput] = useState("");
  const [isPasswordAuthenticated, setIsPasswordAuthenticated] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const isAdmin = Boolean(user?.publicMetadata?.isAdmin);

  // Check sessionStorage on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem("adminPasswordAuthenticated");
    if (isAuthenticated === "true") {
      setIsPasswordAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordInput.trim()) {
      setPasswordError("Please enter a password");
      return;
    }

    try {
      const response = await fetch("/api/admin/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput }),
      });

      if (response.ok) {
        setIsPasswordAuthenticated(true);
        sessionStorage.setItem("adminPasswordAuthenticated", "true");
        setPasswordInput("");
        toast.success("Welcome to the admin panel!");
      } else {
        setPasswordError("Invalid password. Please try again.");
      }
    } catch (error) {
      setPasswordError("Error verifying password. Please try again.");
    }
  };

  const handleGrantAdmin = async () => {
    try {
      const response = await fetch("/api/admin/setup", { method: "POST" });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      await user?.reload();
      toast.success("Admin status granted!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to grant admin access"
      );
    }
  };

  // Show loading state while checking authentication and permissions
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900 mx-auto"></div>
          <p className="text-stone-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not signed in, show login
  if (!isSignedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8 text-center">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Admin Portal</h1>
            <p className="text-stone-600 mb-8">Please sign in to access the admin dashboard</p>
            <SignInButton mode="modal">
              <button className="w-full rounded-lg bg-stone-900 px-4 py-3 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  // If signed in but not admin, show admin setup option
  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2 text-center">Admin Access</h1>
            <p className="text-center text-stone-600 mb-8">You don't have admin access yet. Contact an administrator or use the setup option below.</p>
            
            <button
              onClick={handleGrantAdmin}
              className="w-full rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50"
            >
              Grant Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show password authentication form if not authenticated
  if (!isPasswordAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white shadow-2xl p-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2 text-center">Admin Access</h1>
            <p className="text-center text-stone-600 mb-8">Enter the admin password to continue</p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-stone-900 mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-stone-200 bg-white px-4 py-2 text-stone-900 placeholder-stone-500 focus:border-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900/20"
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">{passwordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-900/50"
              >
                Unlock Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
