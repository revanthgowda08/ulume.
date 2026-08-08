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
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8" style={{ height: "100vh" }}>
        {children}
      </main>
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
