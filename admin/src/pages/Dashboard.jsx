import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import StatCard from "../components/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState({ gmv: 0, orders: 0, farmers: 0, sellers: 0 });

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      let gmv = 0;
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.status === "delivered") gmv += data.total || 0;
      });
      setStats((prev) => ({ ...prev, gmv, orders: snap.size }));
    });

    const unsubFarmers = onSnapshot(collection(db, "users"), (snap) => {
      setStats((prev) => ({ ...prev, farmers: snap.size }));
    });

    const unsubSellers = onSnapshot(collection(db, "sellers"), (snap) => {
      setStats((prev) => ({ ...prev, sellers: snap.size }));
    });

    return () => {
      unsubOrders();
      unsubFarmers();
      unsubSellers();
    };
  }, []);

  const [pendingSellers, setPendingSellers] = useState(0);
  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "sellers"), where("isVerified", "==", false)), (snap) => {
      setPendingSellers(snap.size);
    });
    return unsub;
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Dashboard</h1>
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
            <a href="/sellers" className="underline">
              review now
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
