"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, LogIn, ShoppingCart } from "lucide-react";
import { useCartStore, selectCartCount } from "@/store/cart";
import { useCartUIStore } from "@/store/cartUI";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const cartCount = selectCartCount(items);
  const openCart = useCartUIStore((state) => state.open);
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/60 bg-white/95 backdrop-blur-sm px-6 py-4 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-xl font-bold text-stone-900 [font-family:var(--font-display)]">
            Hannies
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {user?.publicMetadata?.role === "admin" && (
            <Link href="/admin" className="text-stone-600 hover:text-stone-900 transition">
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={openCart}
            className="relative rounded-lg border border-stone-200/70 bg-white/60 p-2 transition hover:bg-amber-100/70"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} className="text-stone-700" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-xs font-semibold text-white">
                {cartCount}
              </span>
            )}
          </button>
          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton>
                <button className="flex items-center gap-2 rounded-lg border border-stone-200/70 bg-white/60 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-amber-100/70">
                  <Log