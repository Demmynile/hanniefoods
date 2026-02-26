import { useEffect, useMemo, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";

interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  orderStatus?: string;
  paystackReference?: string;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delivered: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalOrders = useMemo(() => orders.length, [orders.length]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalOrders / pageSize)),
    [totalOrders, pageSize]
  );
  const pagedOrders = useMemo(
    () => orders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [orders, currentPage, pageSize]
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/orders");
        const contentType = response.headers.get("content-type") || "";
        const data = contentType.includes("application/json") ? await response.json() : null;

        if (!response.ok) {
          const message = data?.message || "Failed to load orders";
          throw new Error(message);
        }

        setOrders(data.orders || []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load orders";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoaded, user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders.length]);

  if (!isLoaded || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-stone-200/80 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-stone-600">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"></div>
            Loading your orders...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <h1 className="text-2xl font-semibold text-stone-900">Sign in to view your orders</h1>
          <p className="mt-2 text-sm text-stone-600">
            Your order history is linked to your account.
          </p>
          <div className="mt-5">
            <SignInButton>
              <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-stone-900 [font-family:var(--font-display)]">
          Your Orders
        </h1>
        <p className="text-sm text-stone-600">{totalOrders} total orders</p>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-200/80 bg-white/90 p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">No orders yet</h2>
          <p className="mt-2 text-sm text-stone-600">
            Place an order and it will show up here.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {pagedOrders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-stone-200/80 bg-white/95 p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-stone-500">Order</p>
                    <p className="text-lg font-semibold text-stone-900">{order.orderNumber}</p>
                    <p className="text-xs text-stone-500">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusStyles[order.paymentStatus] || "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      Payment: {order.paymentStatus}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusStyles[order.orderStatus || "pending"] || "bg-stone-100 text-stone-700 border-stone-200"
                      }`}
                    >
                      Status: {order.orderStatus || "pending"}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-4">
                  <p className="text-sm font-semibold text-stone-800">Items</p>
                  <div className="mt-2 space-y-1 text-sm text-stone-600">
                    {order.items.map((item) => (
                      <div key={`${order._id}-${item.productId}`} className="flex justify-between">
                        <span>
                          {item.title} x{item.quantity}
                        </span>
                        <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-stone-600">
                    <p className="font-medium text-stone-800">Customer</p>
                    <p>{order.customerName}</p>
                    <p>{order.customerEmail}</p>
                    {order.customerPhone ? <p>{order.customerPhone}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-stone-500">Total</p>
                    <p className="text-xl font-semibold text-stone-900">
                      ₦{order.totalAmount.toLocaleString()}
                    </p>
                    {order.paystackReference ? (
                      <p className="text-xs text-stone-500">Ref: {order.paystackReference}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && totalPages > 1 && (
        <div className="mt-10">
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
