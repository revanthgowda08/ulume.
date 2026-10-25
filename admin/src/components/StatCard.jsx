export default function StatCard({ label, value, icon, accent = false }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-card transition-shadow hover:shadow-cardHover">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-inkMuted">{label}</p>
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-base ${
            accent ? "bg-accent/15" : "bg-primaryLight"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className={`mt-3 text-3xl font-bold tabular-nums ${accent ? "text-accentDark" : "text-primary"}`}>{value}</p>
    </div>
  );
}
