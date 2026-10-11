import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/orders", label: "Orders", icon: "📦" },
  { to: "/sellers", label: "Sellers", icon: "🏪" },
  { to: "/farmers", label: "Farmers", icon: "🧑‍🌾" },
  { to: "/analytics", label: "Analytics", icon: "📈" },
  { to: "/verification", label: "Verification", icon: "🛡️" },
];

export default function Sidebar({ isOpen, onClose }) {
  const { logout, user } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 flex-shrink-0 flex-col bg-primary text-white transition-transform duration-200 ease-in-out lg:static lg:w-60 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">ULUME</h1>
            <p className="text-xs text-primaryLight">Admin Panel</p>
          </div>
          <button onClick={onClose} className="text-xl text-primaryLight lg:hidden" aria-label="Close menu">
            ✕
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
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
    </>
  );
}
