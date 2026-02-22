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
      <div className="rounded-3xl border border-amber-200/60 bg-white/80 p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-stone-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-stone-600">
          Add a few essentials to build your next delivery.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-900 [font-family:var(--font-display)]">
          Your cart
        </h1>
        <button
          onClick={clear}
          className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-stone-700 transition hover:bg-amber-100/70"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-stone-200/70 bg-white/80 px-6 py-4 shadow-xl"
          >
            <div>
              <p className="text-lg font-semibold text-stone-900">
                {item.product.title}
              </p>
              <p className="text-sm text-stone-600">
                ${item.product.price} each
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="h-8 w-8 rounded-full border border-stone-200/70 bg-white text-sm font-semibold text-stone-600"
              >
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-stone-800">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="h-8 w-8 rounded-full border border-stone-200/70 bg-white text-sm font-semibold text-stone-600"
              >
                +
              </button>
              <button
                onClick={() => removeItem(item.product.id)}
                className="rounded-full border border-stone-200/70 bg-white px-3 py-2 text-xs font-semibold text-stone-600"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Customer Information Form */}
      <div className="rounded-3xl border border-stone-200/70 bg-white/80 px-6 py-4 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-stone-900">Customer Information</h2>
        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full rounded-lg border border-stone-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-200/60 bg-white/80 px-6 py-4 shadow-xl">
        <div>
          <p className="text-sm uppercase tracking-widest text-stone-500">Total</p>
          <p className="text-2xl font-semibold text-stone-900">₦{total.toLocaleString()}</p>
        </div>
        <PaystackCheckout email={email} name={name} phone={phone} />
      </div>
    </div>
  );
}
