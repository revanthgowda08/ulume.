import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    const q = query(collection(db, "sellers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => setSellers(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const filtered = sellers.filter((s) => (tab === "pending" ? !s.isVerified : s.isVerified));

  const handleApprove = async (sellerId) => {
    // Flipping isVerified triggers functions/index.js#onSellerVerified, which
    // sends the WhatsApp approval message server-side (token never touches the browser).
    await updateDoc(doc(db, "sellers", sellerId), { isVerified: true });
  };

  const handleReject = async (sellerId) => {
    await updateDoc(doc(db, "sellers", sellerId), { isVerified: false, isActive: false });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-primary">Sellers</h1>

      <div className="mb-4 flex gap-2">
        {["pending", "verified"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${
              tab === t ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((seller) => (
          <div key={seller.id} className="rounded-xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-primary">{seller.shopName}</h3>
                <p className="text-xs text-gray-500">{seller.shopNameKannada}</p>
              </div>
              {seller.isVerified && <span className="text-primaryMid">✓</span>}
            </div>
            <div className="mt-3 space-y-1 text-sm text-gray-600">
              <p>👤 {seller.ownerName}</p>
              <p>📞 {seller.phone}</p>
              <p>📍 {seller.village}, {seller.district}</p>
              <p>GSTIN: {seller.gstin || "—"}</p>
            </div>

            {seller.documents?.length > 0 && (
              <div className="mt-3 flex gap-2">
                {seller.documents.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs text-primaryMid underline">
                    Doc {i + 1}
                  </a>
                ))}
              </div>
            )}

            {!seller.isVerified && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleApprove(seller.id)}
                  className="flex-1 rounded-lg bg-primaryMid py-2 text-sm font-semibold text-white hover:bg-primary"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(seller.id)}
                  className="flex-1 rounded-lg border border-errorRed py-2 text-sm font-semibold text-errorRed hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-gray-500">No sellers in this list.</p>}
      </div>
    </div>
  );
}
