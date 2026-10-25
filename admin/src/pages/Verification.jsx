import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, where } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { db } from "../firebase/config";
import StatCard from "../components/StatCard";
import { PageSpinner } from "../components/Spinner";

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
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let pending = new Set(["admins", "sellers", "users", "buyers", "products", "orders"]);
    const markLoaded = (key) => {
      pending.delete(key);
      if (pending.size === 0) setLoading(false);
    };

    const unsubs = ["admins", "sellers", "users", "buyers"].map((name) =>
      onSnapshot(collection(db, name), (snap) => {
        setCollections((prev) => ({ ...prev, [name]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) }));
        markLoaded(name);
      })
    );
    const unsubProducts = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      markLoaded("products");
    });
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      setOrders(snap.docs.map((d) => d.data()));
      markLoaded("orders");
    });
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
    setBusyId(`${user.role}-${user.id}`);
    setActionError("");
    try {
      await updateDoc(doc(db, ROLE_META[user.role].collection, user.id), { isVerified: true });
    } catch {
      setActionError("Couldn't verify this user. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleApproveProduct = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await updateDoc(doc(db, "products", productId), { pendingApproval: false, isAvailable: true });
    } catch {
      setActionError("Couldn't approve this product. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRejectProduct = async (productId) => {
    setBusyId(productId);
    setActionError("");
    try {
      await updateDoc(doc(db, "products", productId), { pendingApproval: false, isAvailable: false });
    } catch {
      setActionError("Couldn't reject this product. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="mb-1 text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="mb-6 text-sm text-inkMuted">Platform oversight &amp; verification.</p>
        <PageSpinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-primary">Admin Dashboard</h1>
      <p className="mb-6 text-sm text-inkMuted">Platform oversight &amp; verification.</p>

      {actionError && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-errorRed">{actionError}</div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Users" value={allUsers.length} icon="👥" />
        <StatCard label="Farmers" value={collections.users.length} icon="🌱" />
        <StatCard label="Vendors" value={collections.sellers.length} icon="🏪" />
        <StatCard label="Products" value={products.length} icon="📦" />
        <StatCard label="Pending" value={pendingCount} icon="🛡️" accent={pendingCount > 0} />
        <StatCard label="Revenue" value={`₹${revenue.toLocaleString("en-IN")}`} icon="₹" />
      </div>

      <div className="mt-6 rounded-xl bg-white p-5 shadow-card">
        <h3 className="mb-4 font-semibold text-ink">User Distribution</h3>
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
              tab === t.key ? "bg-primary text-white" : "bg-white text-inkMuted hover:bg-surfaceMuted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "verification" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allUsers.map((u) => (
            <div key={`${u.role}-${u.id}`} className="rounded-xl bg-white p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-primary">{nameFor(u.role, u)}</p>
                  <p className="text-xs text-inkMuted">{ROLE_META[u.role].label}</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-inkMuted">{u.email || "—"}</p>
              <p className="text-xs text-inkMuted">{locationFor(u)}</p>
              <div className="mt-3">
                {u.isVerified ? (
                  <span className="rounded-full bg-primaryMid px-3 py-1 text-xs font-bold text-white">✓ Verified</span>
                ) : (
                  <button
                    onClick={() => handleVerify(u)}
                    disabled={busyId === `${u.role}-${u.id}`}
                    className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary hover:bg-accentDark hover:text-white disabled:opacity-50"
                  >
                    {busyId === `${u.role}-${u.id}` ? "Verifying…" : "Verify"}
                  </button>
                )}
              </div>
            </div>
          ))}
          {allUsers.length === 0 && <p className="text-inkMuted">No users yet.</p>}
        </div>
      )}

      {tab === "approval" && (
        <div className="rounded-xl bg-white p-5 shadow-card">
          {productsAwaitingApproval.length === 0 ? (
            <p className="text-inkMuted">No products awaiting approval.</p>
          ) : (
            <div className="space-y-3">
              {productsAwaitingApproval.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-semibold text-primary">{p.nameKannada || p.name}</p>
                    <p className="text-xs text-inkMuted">{p.category} · ₹{p.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveProduct(p.id)}
                      disabled={busyId === p.id}
                      className="rounded-lg bg-primaryMid px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectProduct(p.id)}
                      disabled={busyId === p.id}
                      className="rounded-lg border border-errorRed px-3 py-1.5 text-sm font-semibold text-errorRed hover:bg-red-50 disabled:opacity-50"
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
