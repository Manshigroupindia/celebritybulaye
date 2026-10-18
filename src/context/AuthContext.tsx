"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface AdminUserProfile {
  uid: string;
  email: string | null;
  role: "admin" | "editor" | "viewer";
  displayName?: string | null;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  adminProfile: AdminUserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  adminProfile: null,
  isAdmin: false,
  loading: true,
  error: null,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  sendPasswordReset: async () => ({ success: false }),
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve admin profile from authenticated Firebase user
  // Any user who successfully authenticates via Firebase Authentication is authorized
  const resolveAdminProfile = async (firebaseUser: User): Promise<AdminUserProfile> => {
    let profile: AdminUserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      role: "admin",
      displayName:
        firebaseUser.displayName ||
        (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Admin"),
    };

    // Optional: if an adminUsers/{uid} document exists, merge custom profile metadata
    try {
      if (db) {
        const adminDocRef = doc(db, "adminUsers", firebaseUser.uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (adminDocSnap.exists()) {
          const data = adminDocSnap.data();
          if (data) {
            profile = {
              ...profile,
              role: data.role || "admin",
              displayName: data.displayName || profile.displayName,
              createdAt: data.createdAt,
            };
          }
        }
      }
    } catch {
      // Non-blocking: document lookup is purely optional metadata
    }

    setAdminProfile(profile);
    return profile;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await resolveAdminProfile(firebaseUser);
        setIsAdmin(true);
      } else {
        setAdminProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await resolveAdminProfile(userCredential.user);
      setIsAdmin(true);
      return { success: true };
    } catch (err: unknown) {
      let message = "Invalid email or password. Please verify your credentials.";
      if (err instanceof Error) {
        const code = (err as { code?: string }).code;
        if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
          message = "Invalid email or password. Please check your credentials.";
        } else if (code === "auth/too-many-requests") {
          message = "Too many failed sign-in attempts. Please try again in a few minutes.";
        } else if (code === "auth/user-disabled") {
          message = "This administrator account has been disabled.";
        } else {
          message = err.message;
        }
      }
      setError(message);
      return { success: false, error: message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setAdminProfile(null);
      setIsAdmin(false);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: unknown) {
      // For security and privacy, do not reveal if an email exists
      console.error("sendPasswordResetEmail error:", err);
      return { success: true }; // Treat uniformly for UX security unless fatal
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        adminProfile,
        isAdmin,
        loading,
        error,
        signIn,
        signOut,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AuthContext);
