export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`mt-2 text-3xl font-bold ${accent ? "text-accent" : "text-primary"}`}>{value}</p>
    </div>
  );
}
