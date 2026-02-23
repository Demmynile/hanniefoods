import { selectCartTotal, useCartStore } from "@/store/cart";
import { useState } from "react";
import PaystackCheckout from "@/components/PaystackCheckout";

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);
  const total = selectCartTotal(items);
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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
        
        {/* Customer Information Form */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                className="w-full rounded-xl border border-stone-200/70 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-xl border border-stone-200/70 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 placeholder-stone-400 outline-none transition hover:border-stone-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
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
        
        {/* Total and Checkout */}
        <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white/90 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-stone-600">Order Total</p>
              <p className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">₦{total.toLocaleString()}</p>
            </div>
            <PaystackCheckout email={email} name={name} phone={phone} />
          </div>
        </div>
      </div>
    </div>
  );
}
