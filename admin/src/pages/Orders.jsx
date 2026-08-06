import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, doc, updateDoc, addDoc, serverTimestamp, where, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";

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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>
        <div className="space-y-1 text-sm">
          <p><span className="text-gray-500">Farmer:</span> {order.farmerName || "—"} ({order.farmerPhone})</p>
          <p><span className="text-gray-500">Seller:</span> {order.sellerName}</p>
          <p><span className="text-gray-500">Address:</span> {order.farmerAddress}</p>
          <p><span className="text-gray-500">Status:</span> {order.status}</p>
          <p><span className="text-gray-500">Payment:</span> {order.paymentMethod} ({order.paymentStatus})</p>
        </div>
        <div className="mt-4 border-t pt-4">
          <h3 className="mb-2 font-semibold text-gray-700">Items</h3>
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

  useEffect(() => {
    getDocs(collection(db, "sellers")).then((snap) =>
      setSellers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    if (!selectedSellerId) return;
    getDocs(query(collection(db, "products"), where("sellerId", "==", selectedSellerId))).then((snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [selectedSellerId]);

  const handleSearchFarmer = async () => {
    const snap = await getDocs(query(collection(db, "users"), where("phone", "==", phone), limit(1)));
    setFarmer(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() });
  };

  const toggleProduct = (id) =>
    setSelectedProductIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));
  const subtotal = selectedProducts.reduce((s, p) => s + p.price, 0);
  const seller = sellers.find((s) => s.id === selectedSellerId);

  const handleCreateOrder = async () => {
    if (!farmer || !seller || selectedProducts.length === 0) return;
    setSaving(true);
    try {
      const commissionRate = seller.commissionRate || 0.065;
      await addDoc(collection(db, "orders"), {
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
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">Manual Order</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">✕</button>
        </div>

        <label className="mb-1 block text-sm font-medium text-gray-700">Farmer phone</label>
        <div className="mb-4 flex gap-2">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 rounded-lg border px-3 py-2" placeholder="+919876543210" />
          <button onClick={handleSearchFarmer} className="rounded-lg bg-primary px-4 py-2 text-white">Search</button>
        </div>
        {farmer && <p className="mb-4 text-sm text-primaryMid">✓ {farmer.name || farmer.phone}</p>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Seller</label>
        <select value={selectedSellerId} onChange={(e) => setSelectedSellerId(e.target.value)} className="mb-4 w-full rounded-lg border px-3 py-2">
          <option value="">Select seller</option>
          {sellers.map((s) => (
            <option key={s.id} value={s.id}>{s.shopName}</option>
          ))}
        </select>

        {products.length > 0 && (
          <>
            <label className="mb-1 block text-sm font-medium text-gray-700">Products</label>
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

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
    const unsub = onSnapshot(q, (snap) => setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
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
              filter === f ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {f.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
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
              <tr key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.orderId}</td>
                <td className="px-4 py-3">{order.farmerName || order.farmerPhone}</td>
                <td className="px-4 py-3">{order.sellerName}</td>
                <td className="px-4 py-3">₹{order.total}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] || "bg-gray-200"}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      {showManualOrder && <ManualOrderModal onClose={() => setShowManualOrder(false)} />}
    </div>
  );
}
