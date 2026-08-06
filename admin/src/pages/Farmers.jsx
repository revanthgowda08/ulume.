import { useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Farmers() {
  const [phone, setPhone] = useState("");
  const [farmer, setFarmer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setSearched(true);
    const snap = await getDocs(query(collection(db, "users"), where("phone", "==", phone), limit(1)));
    if (snap.empty) {
      setFarmer(null);
      setOrders([]);
      return;
    }
    const farmerDoc = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setFarmer(farmerDoc);

    const ordersSnap = await getDocs(
      query(collection(db, "orders"), where("farmerId", "==", farmerDoc.id), orderBy("createdAt", "desc"), limit(20))
    );
    setOrders(ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Farmers</h1>

      <div className="mb-6 flex gap-2">
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search by phone e.g. +919876543210"
          className="w-80 rounded-lg border px-3 py-2"
        />
        <button onClick={handleSearch} className="rounded-lg bg-primary px-4 py-2 text-white">Search</button>
      </div>

      {searched && !farmer && <p className="text-gray-500">No farmer found with this phone number.</p>}

      {farmer && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-1">
            <h3 className="font-bold text-primary">{farmer.name || "Unnamed farmer"}</h3>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>📞 {farmer.phone}</p>
              <p>📍 {farmer.village}, {farmer.taluk}, {farmer.district}</p>
              <p>🌾 Crops: {farmer.crops?.join(", ") || "—"}</p>
              <p>Farm size: {farmer.farmSizeAcres || "—"} acres</p>
            </div>
            <div className="mt-4 rounded-lg bg-primaryLight p-3 text-center">
              <p className="text-xs text-primaryMid">Wallet Balance</p>
              <p className="text-2xl font-bold text-primary">₹{farmer.walletBalance || 0}</p>
            </div>
            <p className="mt-3 text-sm text-gray-600">Total orders: {farmer.totalOrders || 0}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
            <h3 className="mb-3 font-bold text-primary">Order History</h3>
            <table className="w-full text-left text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="py-2">{o.orderId}</td>
                    <td className="py-2">₹{o.total}</td>
                    <td className="py-2">{o.status}</td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={3} className="py-3 text-gray-500">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
