import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Sellers from "./pages/Sellers";
import Farmers from "./pages/Farmers";
import Analytics from "./pages/Analytics";
import Verification from "./pages/Verification";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-2xl text-primary" aria-label="Open menu">
            ☰
          </button>
          <span className="text-lg font-bold text-primary">ULUME Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>} />
          <Route path="/sellers" element={<ProtectedRoute><Layout><Sellers /></Layout></ProtectedRoute>} />
          <Route path="/farmers" element={<ProtectedRoute><Layout><Farmers /></Layout></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
          <Route path="/verification" element={<ProtectedRoute><Layout><Verification /></Layout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
