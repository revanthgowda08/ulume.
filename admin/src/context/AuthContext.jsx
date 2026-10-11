import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // A farmer/seller/buyer account from the mobile app can also sign in
      // here (same Firebase project) but only a doc at admins/{uid} grants
      // real access — firestore.rules lets a user always read their own
      // admins/{uid} doc, so this check never hits permission-denied.
      try {
        const snap = await getDoc(doc(db, "admins", u.uid));
        setIsAdmin(snap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
