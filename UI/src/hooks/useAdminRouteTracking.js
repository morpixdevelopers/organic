import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { storeAdminRouteEntry } from "../config/firestore";

export const useAdminRouteTracking = () => {
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin && currentUser) {
      // Track admin route access
      storeAdminRouteEntry(
        currentUser.userId || currentUser.uid,
        location.pathname,
        "visit"
      );
    }
  }, [location.pathname, isAdmin, currentUser]);
};

export default useAdminRouteTracking;
