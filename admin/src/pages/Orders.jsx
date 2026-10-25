import { useEffect, useMemo, useState } from "react";
import {
  collection, onSnapshot, orderBy, query, doc, updateDoc, setDoc, runTransaction,
  serverTimestamp, where, getDocs, limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { PageSpinner } from "../components/Spinner";

// Mirrors generateOrderId() in src/services/firebase/firestore.js so
// admin-created orders get the same ULM-YYYY-NNNNN scheme and share the
// counter with orders placed from the mobile app.
async function generateOrderId() {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", `orders-${year}`);
  return runTransaction(db, async (tx) => {
    const counterDoc = await tx.get(counterRef);
    const next = (counterDoc.exists() ? counterDoc.data().count : 0) + 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return `ULM-${year}-${String(next).padStart(5, "0")}`;
  });
}

const STATUS_FILTERS = ["all", "placed", "confirmed", "out_for_delivery", "delivered", "cancelled", "returned"];

const STATUS_COLORS = {
  placed: "bg-accent text-white",
  confirmed: "bg-primaryMid text-white",
  out_for_delivery: "bg-accentDark text-white",
  delivered: "bg-primary text-white",
  cancelled: "bg-errorRed text-white",
  returned: "bg-errorRed text-white",
};

function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">{order.orderId}</h2>
          <button onClick={onClose} className="text-inkFaint hover:text-ink">✕</button>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-inkMuted">Farmer:</span> {order.farmerName || "—"} ({order.farmerPhone})</p>
          <p><span className="text-inkMuted">Seller:</span> {order.sellerName}</p>
          <p><span className="text-inkMuted">Address:</span> {order.farmerAddress}</p>
          <p><span className="text-inkMuted">Status:</span> {order.status}</p>
          <p><span className="text-inkMuted">Payment:</span> {order.paymentMethod} ({order.paymentStatus})</p>
        </div>
        <div className="mt-4 border-t pt-4">
          <h3 className="mb-2 font-semibold text-ink">Items</h3>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.subtotal}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManualOrderModal({ onClose }) {
  const [phone, setPhone] = useState("");
  const [farmer, setFarmer] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDocs(collection(db, "sellers"))
      .then((snap) => setSellers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setError("Couldn't load sellers. Please try again."));
  }, []);

  useEffect(() => {
    if (!selectedSellerId) return;
    getDocs(query(collection(db, "products"), where("sellerId", "==", selectedSellerId)))
      .then((snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() }))))
      .catch(() => setError("Couldn't load products for this seller."));
  }, [selectedSellerId]);

  const handleSearchFarmer = async () => {
    if (!phone.trim()) return;
    setSearching(true);
    setError("");
    try {
      const snap = await getDocs(query(collection(db, "users"), where("phone", "==", phone.trim()), limit(1)));
      setFarmer(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
      if (snap.empty) setError("No farmer found with this phone number.");
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const toggleProduct = (id) =>
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));
  const subtotal = selectedProducts.reduce((s, p) => s + p.price, 0);
  const seller = sellers.find((s) => s.id === selectedSellerId);

  const handleCreateOrder = async () => {
    if (!farmer || !seller || selectedProducts.length === 0) return;
    setSaving(true);
    setError("");
    try {
      const commissionRate = seller.commissionRate || 0.065;
      const orderId = await generateOrderId();
      await setDoc(doc(db, "orders", orderId), {
        orderId,
        farmerId: farmer.id,
        farmerName: farmer.name || "",
        farmerPhone: farmer.phone,
        farmerAddress: farmer.village || "",
        sellerId: seller.id,
        sellerName: seller.shopName,
        sellerPhone: seller.phone,
        items: selectedProducts.map((p) => ({
          productId: p.id,
          productName: p.name,
          productNameKannada: p.nameKannada,
          quantity: 1,
          price: p.price,
          subtotal: p.price,
        })),
        subtotal,
        deliveryCharge: 0,
        total: subtotal,
        commissionRate,
        commissionAmount: Math.round(subtotal * commissionRate),
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "placed",
        statusHistory: [{ status: "placed", timestamp: Date.now(), updatedBy: "admin" }],
        isFirstOrder: (farmer.totalOrders || 0) === 0,
        whatsappSent: false,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch {
      setError("Couldn't create the order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Manual Order</h2>
          <button onClick={onClose} className="text-inkFaint hover:text-ink">✕</button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-errorRed">{error}</p>}

        <label className="mb-1 block text-sm font-medium text-ink">Farmer phone</label>
        <div className="mb-4 flex gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" placeholder="+919876543210" />
          <button onClick={handleSearchFarmer} disabled={searching} className="rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50">
            {searching ? "Searching…" : "Search"}
          </button>
        </div>
        {farmer && <p className="mb-4 text-sm text-primaryMid">✓ {farmer.name || farmer.phone}</p>}

        <label className="mb-1 block text-sm font-medium text-ink">Seller</label>
        <select value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)} className="mb-4 w-full rounded-lg border px-3 py-2">
          <option value="">Select seller</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.shopName}</option>
          ))}
        </select>

        {products.length > 0 && (
          <>
            <label className="mb-1 block text-sm font-medium text-ink">Products</label>
            <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border p-2">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 py-1 text-sm">
                  <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  {p.name} — ₹{p.price}
                </label>
              ))}
            </div>
          </>
        )}

        <div className="mb-4 rounded-lg bg-primaryLight p-3 text-sm">
          Subtotal: ₹{subtotal} · Payment: Cash on Delivery
        </div>

        <button
          onClick={handleCreateOrder}
          disabled={saving || !farmer || !selectedSellerId || selectedProducts.length === 0}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Order"}
        </button>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Orders</h1>
        <button onClick={() => setShowManualOrder(true)} className="rounded-lg bg-accent px-4 py-2 font-semibold text-primary hover:bg-accentDark hover:text-white">
          + Manual Order
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              filter === f ? "bg-primary text-white" : "bg-white text-inkMuted hover:bg-surfaceMuted"
            }`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : (
      <div className="overflow-x-auto rounded-xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-surfaceMuted text-inkMuted">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Farmer</th>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer border-t hover:bg-surfaceMuted">
                <td className="px-4 py-3 font-medium">{order.orderId}</td>
                <td className="px-4 py-3">{order.farmerName || order.farmerPhone}</td>
                <td className="px-4 py-3">{order.sellerName}</td>
                <td className="px-4 py-3">₹{order.total}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-line"}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-inkMuted">No orders in this filter yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      {showManualOrder && <ManualOrderModal onClose={() => setShowManualOrder(false)} />}
    </div>
  );
}
