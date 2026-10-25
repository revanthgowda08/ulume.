import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isAdmin, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surfaceMuted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primaryLight border-t-primary" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-surfaceMuted px-6 text-center">
        <span className="text-4xl">🛡️</span>
        <h1 className="text-xl font-bold text-primary">Access restricted</h1>
        <p className="max-w-sm text-sm text-inkMuted">
          {user.email} isn't set up as an ULUME admin. If you believe this is a mistake, contact the team to get
          an admin account provisioned.
        </p>
        <button
          onClick={logout}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primaryMid"
        >
          Sign out
        </button>
      </div>
    );
  }
  return children;
}
