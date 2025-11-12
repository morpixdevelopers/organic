// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import {
  storeUserCredentials,
  storeAdminCredentials,
} from "../config/firestore";

const AuthContext = createContext();

// Admin credentials: only userId + password (no email needed)
const ADMIN_CREDENTIALS = {
  userId: "Krishnaraja",
  password: "Krishnaraja@0311",
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if a user object represents the configured admin
  const checkAdminStatus = (user) => {
    if (!user) return false;
    // If user object contains userId (our local admin shape), compare it
    if (user.userId && user.userId === ADMIN_CREDENTIALS.userId) return true;
    // If user is a Firebase user, we don't treat them as admin here (unless you add admin logic in Firebase)
    return false;
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        role: "user",
      };
      setCurrentUser(user);
      setIsAdmin(false);

      // Store user credentials in Firestore
      await storeUserCredentials(user.uid, user.email, "google");

      return { success: true, user };
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return { success: false, error: error.message };
    }
  };

  // Sign up with Email and Password
  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || result.user.email.split("@")[0],
        photoURL: null,
        role: "user",
      };
      setCurrentUser(user);
      setIsAdmin(false);

      // Store user credentials
      await storeUserCredentials(user.uid, user.email, "email-signup");

      return { success: true, user };
    } catch (error) {
      console.error("Error signing up with email:", error);
      let errorMessage = error.message;

      // Friendly messages
      if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please sign in instead.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }

      return { success: false, error: errorMessage };
    }
  };

  // Sign in with Email and Password
  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || result.user.email.split("@")[0],
        photoURL: result.user.photoURL,
        role: "user",
      };
      setCurrentUser(user);
      setIsAdmin(false);

      // Store user credentials
      await storeUserCredentials(user.uid, user.email, "email");

      return { success: true, user };
    } catch (error) {
      console.error("Error signing in with email:", error);
      let errorMessage = error.message;

      // Friendly messages
      if (error.code === "auth/user-not-found") {
        errorMessage =
          "No account found with this email. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled.";
      }

      return { success: false, error: errorMessage };
    }
  };

  // Sign in with admin credentials (local)
  const signInWithAdmin = async (userId, password) => {
    try {
      // Verify admin credentials against configured values
      if (
        userId === ADMIN_CREDENTIALS.userId &&
        password === ADMIN_CREDENTIALS.password
      ) {
        // Create a local admin user object (no email)
        const adminUser = {
          userId: ADMIN_CREDENTIALS.userId,
          uid: `admin_${ADMIN_CREDENTIALS.userId}`, // synthetic uid
          displayName: ADMIN_CREDENTIALS.userId,
          role: "admin",
          photoURL: null,
        };

        setCurrentUser(adminUser);
        setIsAdmin(true);

        // Persist admin session locally
        localStorage.setItem("adminUser", JSON.stringify(adminUser));

        // Store admin credentials in Firestore, passing the admin userId so doc id uses it
        await storeAdminCredentials(
          ADMIN_CREDENTIALS.userId,
          ADMIN_CREDENTIALS.password
        );

        return { success: true, user: adminUser };
      } else {
        return { success: false, error: "Invalid admin credentials" };
      }
    } catch (error) {
      console.error("Error signing in as admin:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout (handles both Firebase users and local admin)
  const logout = async () => {
    try {
      if (isAdmin) {
        // Clear admin session
        localStorage.removeItem("adminUser");
      } else {
        // Sign out from Firebase
        await signOut(auth);
      }
      setCurrentUser(null);
      setIsAdmin(false);
      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      return { success: false, error: error.message };
    }
  };

  // Listen for Firebase auth state changes; if none, restore admin from localStorage
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "user",
        };
        setCurrentUser(user);
        setIsAdmin(false);
      } else {
        // Try to restore a locally-signed-in admin
        const adminUser = localStorage.getItem("adminUser");
        if (adminUser) {
          const parsedAdmin = JSON.parse(adminUser);
          setCurrentUser(parsedAdmin);
          setIsAdmin(checkAdminStatus(parsedAdmin));
        } else {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
