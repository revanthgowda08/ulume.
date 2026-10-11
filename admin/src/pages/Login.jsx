import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ERROR_MESSAGES = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(ERROR_MESSAGES[err.code] || "Couldn't sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl">🍃</div>
          <h1 className="text-center text-2xl font-bold text-primary">ULUME Admin</h1>
          <p className="mt-1 text-center text-sm text-gray-500">Sign in to continue</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-2 text-sm text-errorRed">{error}</p>}

        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primaryMid focus:outline-none"
        />

        <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
        <div className="mb-6 flex items-center rounded-lg border border-gray-300 focus-within:border-primaryMid">
          <input
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3 py-2 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="px-3 text-sm text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-primaryMid disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
