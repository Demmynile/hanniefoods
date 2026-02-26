import { selectCartTotal, useCartStore } from "@/store/cart";
import { useState } from "react";
import PaystackCheckout from "@/components/PaystackCheckout";
import { useUser, SignInButton } from "@clerk/nextjs";

export default function CartPage() {
  const { user, isLoaded } = useUser();
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const total = selectCartTotal(items);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [continueAsGuest, setContinueAsGuest] = useState(false);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-8 md:p-12 shadow-lg text-center">
          <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">Your cart is empty</h1>
          <p className="mt-3 text-base text-stone-600">
            Add a few essentials to build your next delivery.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
            Your cart
          </h1>
          <button
            onClick={clear}
            className="w-full sm:w-auto rounded-xl border border-stone-200/70 bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-stone-700 transition hover:bg-red-100/60 hover:border-red-300"
          >
            Clear Cart
          </button>
        </div>

        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="rounded-xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-stone-900">
                    {item.product.title}
                  </p>
                  <p className="text-sm text-stone-600 mt-1">
                    ₦{item.product.price.toLocaleString()} × {item.quantity}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-2 rounded-lg border border-stone-200/70 bg-stone-50/50 p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="h-7 w-7 rounded-md hover:bg-stone-200 transition text-stone-600 font-semibold text-sm flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm font-semibold text-stone-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="h-7 w-7 rounded-md hover:bg-stone-200 transition text-stone-600 font-semibold text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="flex-1 sm:flex-none rounded-lg border border-red-200/70 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100/70 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Authentication Check */}
        {isLoaded && !user && !continueAsGuest && (
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-white p-6 md:p-8 shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-stone-900 text-center">
              Checkout Options
            </h2>
            <p className="text-sm text-stone-600 text-center mb-6">
              Sign in for a faster checkout experience, or continue as a guest
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sign In Option */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900">Sign In</h3>
                <p className="text-xs text-stone-600">
                  Track orders and save your info
                </p>
                <SignInButton 
                  mode="redirect" 
                  fallbackRedirectUrl="/cart"
                  forceRedirectUrl="/cart"
                >
                  <button className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600">
                    Sign In with Clerk
                  </button>
                </SignInButton>
              </div>

              {/* Guest Option */}
              <div className="rounded-xl border border-stone-200 bg-white p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900">Continue as Guest</h3>
                <p className="text-xs text-stone-600">
                  Quick checkout without an account
                </p>
                <button
                  onClick={() => setContinueAsGuest(true)}
                  className="w-full rounded-lg border-2 border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-900 transition hover:bg-stone-50"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Customer Information Form - Show if logged in OR guest selected */}
        {(user || continueAsGuest) && (
          <div className="rounded-2xl border border-stone-200/80 bg-white/90 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <h2 className="mb-6 text-2xl font-semibold text-stone-900">Customer Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email || user?.primaryEmailAddress?.emailAddress || ""}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                disabled={!!user?.primaryEmailAddress?.emailAddress}
                className="w-full rounded-xl border border-stone-200/70 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-stone-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name || user?.fullName || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={!!user?.fullName}
                className="w-full rounded-xl border border-stone-200/70 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-stone-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full rounded-xl border border-stone-200/70 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>
        </div>
        )}
        
        {/* Total and Checkout - Show if logged in OR guest selected */}
        {(user || continueAsGuest) && (
        <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white/90 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">Order Total</p>
              <p className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">₦{total.toLocaleString()}</p>
            </div>
            <PaystackCheckout 
              email={email || user?.primaryEmailAddress?.emailAddress || ""} 
              name={name || user?.fullName || ""} 
              phone={phone} 
            />
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
