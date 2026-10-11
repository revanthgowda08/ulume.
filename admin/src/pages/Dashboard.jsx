import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../firebase/config";
import StatCard from "../components/StatCard";
import { PageSpinner } from "../components/Spinner";

export default function Dashboard() {
  const [stats, setStats] = useState({ gmv: 0, orders: 0, farmers: 0, sellers: 0 });
  const [pendingSellers, setPendingSellers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pending = new Set(["orders", "farmers", "sellers"]);
    const markLoaded = (key) => {
      pending.delete(key);
      if (pending.size === 0) setLoading(false);
    };

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      let gmv = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.status === "delivered") gmv += data.total || 0;
      });
      setStats((prev) => ({ ...prev, gmv, orders: snap.size }));
      markLoaded("orders");
    });

    const unsubFarmers = onSnapshot(collection(db, "users"), (snap) => {
      setStats((prev) => ({ ...prev, farmers: snap.size }));
      markLoaded("farmers");
    });

    const unsubSellers = onSnapshot(collection(db, "sellers"), (snap) => {
      setStats((prev) => ({ ...prev, sellers: snap.size }));
      markLoaded("sellers");
    });

    return () => {
      unsubOrders();
      unsubFarmers();
      unsubSellers();
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "sellers"), where("isVerified", "==", false)), (snap) => {
      setPendingSellers(snap.size);
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Dashboard</h1>

      {loading ? (
        <PageSpinner />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total GMV" value={`₹${stats.gmv.toLocaleString("en-IN")}`} icon="💰" accent />
            <StatCard label="Total Orders" value={stats.orders} icon="📦" />
            <StatCard label="Farmers" value={stats.farmers} icon="🧑‍🌾" />
            <StatCard label="Sellers" value={stats.sellers} icon="🏪" />
          </div>

          {pendingSellers > 0 && (
            <div className="mt-6 rounded-xl border border-accent bg-primaryLight p-4">
              <p className="font-semibold text-primary">
                ⚠️ {pendingSellers} seller{pendingSellers > 1 ? "s" : ""} pending verification —{" "}
                <Link to="/sellers" className="underline">
                  review now
                </Link>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
