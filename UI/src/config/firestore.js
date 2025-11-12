// src/firestore.js
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDocs,
  limit as queryLimit,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import app from "./firebase";

// Firestore instance
export const db = getFirestore(app);
export const auth = getAuth(app);

// ==================== COLLECTION NAMES ====================
export const COLLECTIONS = {
  ADMIN_CREDENTIALS: "admincredential",
  USER_CREDENTIALS: "usercredential",
  PRODUCTS: "products",
  USER_CHECKOUTS: "usercheckouts",
};

// ==================== UTILS ====================

// clean up name for safe Firestore ID
const sanitizeForId = (str = "anon", maxLen = 30) => {
  const safe = String(str || "anon")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return safe.slice(0, maxLen);
};

// derive username safely from Firebase Auth
const getCurrentUsername = () => {
  const user = auth.currentUser;
  if (!user) return "guest";
  if (user.displayName) return sanitizeForId(user.displayName);
  if (user.email) return sanitizeForId(user.email.split("@")[0]);
  return sanitizeForId(user.uid.slice(0, 10));
};

// build doc ID = YYYYMMDD_HHMMSS_mmm_username
const getDocIdWithUser = (username = getCurrentUsername()) => {
  const d = new Date();
  const pad = (n, w = 2) => String(n).padStart(w, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);
  return `${yyyy}${mm}${dd}_${hh}${mi}${ss}_${ms}_${sanitizeForId(username)}`;
};

const docRefWithDateUserId = (collectionName, username, providedId = null) => {
  const id = providedId || getDocIdWithUser(username);
  return doc(db, collectionName, id);
};

// ==================== ADMIN CREDENTIALS ====================
/**
 * Store admin login credentials.
 * IMPORTANT: if you pass `adminUserId` it will be used as the username portion
 * of the document id (so you won't get "..._guest").
 */
export const storeAdminCredentials = async (
  adminUserId,
  password,
  providedId = null
) => {
  try {
    // If caller provided adminUserId, use it as username in doc id; else use auth user
    const usernameForId = adminUserId
      ? sanitizeForId(adminUserId)
      : getCurrentUsername();

    const data = {
      adminUserId,
      password,
      timestamp: serverTimestamp(),
      createdBy: usernameForId,
    };

    const docRef = docRefWithDateUserId(
      COLLECTIONS.ADMIN_CREDENTIALS,
      usernameForId,
      providedId
    );
    await setDoc(docRef, data);
    return { success: true, credentialId: docRef.id };
  } catch (error) {
    console.error("Error storing admin credentials:", error);
    return { success: false, error: error.message };
  }
};

// ==================== USER CREDENTIALS ====================
export const storeUserCredentials = async (
  userId,
  email,
  loginMethod,
  providedId = null
) => {
  try {
    const username = getCurrentUsername();
    const data = {
      userId,
      email,
      loginMethod,
      timestamp: serverTimestamp(),
      createdBy: username,
    };
    const docRef = docRefWithDateUserId(
      COLLECTIONS.USER_CREDENTIALS,
      username,
      providedId
    );
    await setDoc(docRef, data);
    return { success: true, credentialId: docRef.id };
  } catch (error) {
    console.error("Error storing user credentials:", error);
    return { success: false, error: error.message };
  }
};

// ==================== PRODUCT OPERATIONS ====================
/**
 * Store product operation.
 * Document ID pattern:
 *   <date>_<ms>_<username>_<action>_<shortProductName>
 * Example:
 *   20251112_134021_345_admin_create_mygreenapple
 *
 * If adminUserId is provided it will be used as the username portion.
 */
export const storeProductOperation = async (
  adminUserId,
  productId,
  productName,
  action,
  productCategory,
  productPrice,
  productDescription,
  providedId = null
) => {
  try {
    // Prefer explicit adminUserId if provided (caller knows who performed the action)
    const username = adminUserId
      ? sanitizeForId(adminUserId)
      : getCurrentUsername();

    const data = {
      adminUserId,
      productId,
      productName,
      action,
      productCategory,
      productPrice,
      productDescription,
      timestamp: serverTimestamp(),
      createdBy: username,
    };

    // short sanitized product name for id (fallback to 'no-name' if none)
    const shortName = productName ? sanitizeForId(productName, 20) : "no-name";
    // base id uses username so it becomes <date>..._<username>
    const idBase = getDocIdWithUser(username);
    const id =
      providedId ||
      `${idBase}_${sanitizeForId(action || "action", 10)}_${shortName}`;

    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await setDoc(docRef, data);
    return { success: true, operationId: docRef.id };
  } catch (error) {
    console.error("Error storing product operation:", error);
    return { success: false, error: error.message };
  }
};

// ==================== USER CHECKOUT ====================
export const storeCheckout = async (
  name,
  whatsapp,
  address,
  productList,
  total,
  providedId = null
) => {
  try {
    const username = getCurrentUsername();
    const userId = auth.currentUser?.uid || "guest";

    const data = {
      userId,
      name,
      whatsapp,
      address,
      productList,
      total,
      timestamp: serverTimestamp(),
      createdBy: username,
    };

    const docRef = docRefWithDateUserId(
      COLLECTIONS.USER_CHECKOUTS,
      username,
      providedId
    );
    await setDoc(docRef, data);
    return { success: true, checkoutId: docRef.id };
  } catch (error) {
    console.error("Error storing checkout:", error);
    return { success: false, error: error.message };
  }
};

// ==================== FETCH HELPERS ====================
export const getUserCredentialsHistory = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_CREDENTIALS),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      queryLimit(limit)
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    console.error("Error getting user credentials history:", error);
    return { success: false, error: error.message };
  }
};

export const getUserCheckoutHistory = async (userId, limit = 50) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.USER_CHECKOUTS),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      queryLimit(limit)
    );
    const snap = await getDocs(q);
    return {
      success: true,
      data: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
    };
  } catch (error) {
    console.error("Error getting checkout history:", error);
    return { success: false, error: error.message };
  }
};

// ==================== UTILITIES ====================
export const formatFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    return timestamp.toDate().toLocaleString();
  } catch {
    return "Invalid";
  }
};
