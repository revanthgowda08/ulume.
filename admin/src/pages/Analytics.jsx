import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend,
} from "recharts";
import { db } from "../firebase/config";

const PIE_COLORS = ["#1A3C34", "#2E7D52", "#F5A623", "#D4891C", "#6B9080", "#C62828"];

export default function Analytics() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) =>
      setOrders(snap.docs.map((d) => d.data()))
    );
    return unsub;
  }, []);

  const dailyGmv = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d.toISOString().slice(5, 10), gmv: 0 });
    }
    const byDate = Object.fromEntries(days.map((d) => [d.date, d]));
    orders.forEach((o) => {
      if (o.status !== "delivered" || !o.createdAt?.toDate) return;
      const key = o.createdAt.toDate().toISOString().slice(5, 10);
      if (byDate[key]) byDate[key].gmv += o.total || 0;
    });
    return days;
  }, [orders]);

  const topCategories = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      o.items?.forEach((item) => {
        const cat = item.category || "other";
        counts[cat] = (counts[cat] || 0) + item.quantity;
      });
    });
    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const districtDistribution = useMemo(() => {
    const counts = {};
    orders.forEach((o) => {
      const d = o.farmerAddress?.split(",").pop()?.trim() || "Unknown";
      counts[d] = (counts[d] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Analytics</h1>

      <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-700">Daily GMV (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyGmv}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" fontSize={11} />
            <YAxis fontSize={11} />
            <Tooltip />
            <Line type="monotone" dataKey="gmv" stroke="#2E7D52" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">Top 5 Categories</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" fill="#F5A623" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-700">District Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={districtDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                {districtDistribution.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
