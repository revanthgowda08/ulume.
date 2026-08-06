import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/orders", label: "Orders", icon: "📦" },
  { to: "/sellers", label: "Sellers", icon: "🏪" },
  { to: "/farmers", label: "Farmers", icon: "🧑‍🌾" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-60 flex-col bg-primary text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-wide">ULUME</h1>
        <p className="text-xs text-primaryLight">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive ? "bg-primaryMid font-semibold" : "hover:bg-primaryMid/50"
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-primaryMid p-4">
        <p className="truncate text-xs text-primaryLight">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-2 w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-primary hover:bg-accentDark hover:text-white"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
