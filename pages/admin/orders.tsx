"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FiEdit2, FiSave, FiRefreshCw, FiX } from "react-icons/fi";
import { AdminAuthGuard } from "@/components/AdminAuthGuard";
import { AdminLayout } from "@/components/AdminLayout";
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
  paymentStatus: "pending" | "success" | "failed" | string;
  orderStatus?: "pending" | "paid" | "delivered" | string;
  paystackReference?: string;
  createdAt: string;
  userId?: string | null;
}

const orderStatusOptions = ["pending", "paid", "delivered"] as const;
const paymentStatusOptions = ["pending", "success", "failed"] as const;

const statusBadgeStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  success: "bg-emerald-100 text-emerald-800 border-emerald-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  delivered: "bg-blue-100 text-blue-800 border-blue-200",
};

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editOrderStatus, setEditOrderStatus] = useState<string>("pending");
  const [editPaymentStatus, setEditPaymentStatus] = useState<string>("pending");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/admin/orders?t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
    setCurrentPage(1);
  }, [orders.length]);

  const startEditing = (order: Order) => {
    setEditingOrder(order);
    setEditOrderStatus(order.orderStatus || "pending");
    setEditPaymentStatus(order.paymentStatus || "pending");
  };

  const cancelEditing = () => {
    setEditingOrder(null);
  };

  const saveChanges = async (order: Order) => {
    const nextOrderStatus = editOrderStatus || order.orderStatus || "pending";
    const nextPaymentStatus = editPaymentStatus || order.paymentStatus || "pending";

    try {
      setSavingId(order._id);
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order._id,
          orderStatus: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update order");
      }

      toast.success("Order updated");
      setOrders((prev) =>
        prev.map((existing) =>
          existing._id === order._id
            ? {
                ...existing,
                orderStatus: nextOrderStatus,
                paymentStatus: nextPaymentStatus,
              }
            : existing
        )
      );
      setEditingOrder(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update order");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">Orders</h1>
          <p className="mt-1 text-sm md:text-base text-stone-600">{totalOrders} total orders</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            fetchOrders();
          }}
          className="flex items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          <FiRefreshCw size={18} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white border border-stone-200/70 p-6 shadow-sm">
          <div className="text-stone-600 flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900"></div>
            Loading orders...
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-white border border-stone-200/70 shadow-sm overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-6 text-sm text-stone-600">No orders found yet.</div>
          ) : (
            <div>
              <div className="divide-y divide-stone-100 md:hidden">
                {pagedOrders.map((order) => (
                  <div key={order._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-stone-900 break-all">{order.orderNumber}</p>
                        <p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => startEditing(order)}
                        className="flex items-center gap-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        <FiEdit2 size={13} />
                        Edit
                      </button>
                    </div>

                    <div className="space-y-1 text-sm text-stone-700">
                      <p className="font-semibold text-stone-900">{order.customerName}</p>
                      <p className="break-all">{order.customerEmail}</p>
                      {order.customerPhone ? <p>{order.customerPhone}</p> : null}
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={`${order._id}-${item.productId}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                          <span className="text-stone-700">{item.title} x{item.quantity}</span>
                          <span className="font-medium text-stone-900">₦{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[order.paymentStatus] || "bg-stone-100 text-stone-700 border-stone-200"
                      }`}>
                        Payment: {order.paymentStatus}
                      </span>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusBadgeStyles[order.orderStatus || "pending"] || "bg-stone-100 text-stone-700 border-stone-200"
                      }`}>
                        Order: {order.orderStatus || "pending"}
                      </span>
                    </div>

                    <div className="text-right text-sm font-semibold text-stone-900">
                      Total: ₦{order.totalAmount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-61.25">
                <thead className="border-b border-stone-200 bg-stone-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Items</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Payment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((order) => {
                    return (
                      <tr key={order._id} className="border-b border-stone-100 align-top">
                        <td className="px-4 py-4 text-sm text-stone-900">
                          <div className="font-semibold">{order.orderNumber}</div>
                          {order.paystackReference ? (
                            <div className="text-xs text-stone-500">Ref: {order.paystackReference}</div>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-sm text-stone-700">
                          <div className="font-semibold text-stone-900">{order.customerName}</div>
                          <div>{order.customerEmail}</div>
                          {order.customerPhone ? <div>{order.customerPhone}</div> : null}
                        </td>
                        <td className="px-4 py-4 text-sm text-stone-600">
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <div key={`${order._id}-${item.productId}-${index}`} className="flex justify-between gap-4">
                                <span>{item.title} x{item.quantity}</span>
                                <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-stone-900">
                          ₦{order.totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusBadgeStyles[order.paymentStatus] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                              statusBadgeStyles[order.orderStatus || "pending"] ||
                              "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {order.orderStatus || "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-xs text-stone-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <button
                            onClick={() => startEditing(order)}
                            className="flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
          )}
        </div>
      )}

      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Edit Order</h2>
                <p className="text-xs text-stone-500 break-all">{editingOrder.orderNumber}</p>
              </div>
              <button
                onClick={cancelEditing}
                className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                aria-label="Close edit modal"
              >
                <FiX size={16} />
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Payment Status
                </label>
                <select
                  value={editPaymentStatus}
                  onChange={(event) => setEditPaymentStatus(event.target.value)}
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
                >
                  {paymentStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Order Status
                </label>
                <select
                  value={editOrderStatus}
                  onChange={(event) => setEditOrderStatus(event.target.value)}
                  className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm"
                >
                  {orderStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-4 py-3">
              <button
                onClick={cancelEditing}
                className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveChanges(editingOrder)}
                disabled={savingId === editingOrder._id}
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                <FiSave size={14} />
                {savingId === editingOrder._id ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {orders.length > 0 && totalPages > 1 && (
        <div className="flex justify-center">
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

export default function AdminOrdersPage() {
  return (
    <AdminAuthGuard>
      <AdminLayout>
        <OrdersPageContent />
      </AdminLayout>
    </AdminAuthGuard>
  );
}
