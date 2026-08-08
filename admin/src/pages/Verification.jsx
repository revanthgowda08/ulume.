import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { db } from "../firebase/config";
import StatCard from "../components/StatCard";

const ROLE_META = {
  admin: { label: "Admin", collection: "admins" },
  vendor: { label: "Vendor", collection: "sellers" },
  farmer: { label: "Farmer", collection: "users" },
  buyer: { label: "Buyer", collection: "buyers" },
};

const nameFor = (role, data) => {
  if (role === "vendor") return data.shopName || data.ownerName || "Unnamed vendor";
  return data.name || data.email || "Unnamed";
};

const locationFor = (data) => [data.district, data.state].filter(Boolean).join(", ") || "—";

export default function Verification() {
  const [collections, setCollections] = useState({ admins: [], sellers: [], users: [], buyers: [] });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("verification");

  useEffect(() => {
    const unsubs = ["admins", "sellers", "users", "buyers"].map((name) =>
      onSnapshot(collection(db, name), (snap) => {
        setCollections((prev) => ({ ...prev, [name]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }));
      })
    );
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) =>
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) =>
      setOrders(snap.docs.map((d) => d.data()))
    );
    return () => {
      unsubs.forEach((u) => u());
      unsubProducts();
      unsubOrders();
    };
  }, []);

  const allUsers = useMemo(() => {
    return [
      ...collections.admins.map((d) => ({ ...d, role: "admin", isVerified: true })),
      ...collections.sellers.map((d) => ({ ...d, role: "vendor" })),
      ...collections.users.map((d) => ({ ...d, role: "farmer" })),
      ...collections.buyers.map((d) => ({ ...d, role: "buyer" })),
    ];
  }, [collections]);

  const pendingCount = allUsers.filter((u) => u.role !== "admin" && !u.isVerified).length;
  const revenue = orders.reduce((sum, o) => sum + (o.status === "delivered" ? o.total || 0 : 0), 0);

  const distribution = [
    { name: "Farmers", value: collections.users.length },
    { name: "Buyers", value: collections.buyers.length },
    { name: "Vendors", value: collections.sellers.length },
  ];

  const productsAwaitingApproval = products.filter((p) => p.pendingApproval === true);

  const handleVerify = async (user) => {
    await updateDoc(doc(db, ROLE_META[user.role].collection, user.id), { isVerified: true });
  };

  const handleApproveProduct = async (productId) => {
    await updateDoc(doc(db, "products", productId), { pendingApproval: false, isAvailable: true });
  };

  const handleRejectProduct = async (productId) => {
    await updateDoc(doc(db, "products", productId), { pendingApproval: false, isAvailable: false });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-primary">Admin Dashboard</h1>
      <p className="mb-6 text-sm text-gray-500">Platform oversight &amp; verification.</p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Users" value={allUsers.length} icon="👥" />
        <StatCard label="Farmers" value={collections.users.length} icon="🌱" />
        <StatCard label="Vendors" value={collections.sellers.length} icon="🏪" />
        <StatCard label="Products" value={products.length} icon="📦" />
        <StatCard label="Pending" value={pendingCount} icon="🛡️" accent={pendingCount > 0} />
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} icon="₹" />
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-700">User Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={distribution}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2E7D52" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 mt-6 flex gap-2">
        {[
          { key: "verification", label: "User Verification" },
          { key: "approval", label: "Product Approval" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tab === t.key ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "verification" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((u) => (
            <div key={`${u.role}-${u.id}`} className="rounded-xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-primary">{nameFor(u.role, u)}</p>
                  <p className="text-xs text-gray-500">{ROLE_META[u.role].label}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">{u.email || "—"}</p>
              <p className="text-xs text-gray-500">{locationFor(u)}</p>
              <div className="mt-3">
                {u.isVerified ? (
                  <span className="rounded-full bg-errorRed px-3 py-1 text-xs font-bold text-white">Verified</span>
                ) : (
                  <button
                    onClick={() => handleVerify(u)}
                    className="rounded-full bg-primaryMid px-3 py-1 text-xs font-bold text-white hover:bg-primary"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
          ))}
          {allUsers.length === 0 && <p className="text-gray-500">No users yet.</p>}
        </div>
      )}

      {tab === "approval" && (
        <div className="rounded-xl bg-white p-5 shadow-sm">
          {productsAwaitingApproval.length === 0 ? (
            <p className="text-gray-500">No products awaiting approval.</p>
          ) : (
            <div className="space-y-3">
              {productsAwaitingApproval.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-primary">{p.nameKannada || p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} · ₹{p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveProduct(p.id)}
                      className="rounded-lg bg-primaryMid px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(p.id)}
                      className="rounded-lg border border-errorRed px-3 py-1.5 text-sm font-semibold text-errorRed hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
