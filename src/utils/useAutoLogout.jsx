import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import axios from "axios";

export default function useAutoLogout(token, logoutFn) {
  useEffect(() => {
    if (!token) return;

    try {
      const { exp } = jwtDecode(token); // exp in seconds
      const expiryTime = exp * 1000 - Date.now();

      if (expiryTime <= 0) {
        logoutFn();
        toast.info("Session expired, please log in again");
        return;
      }

      // ✅ Schedule logout at expiry
      const timer = setTimeout(() => {
        logoutFn();
        toast.info("Session expired, please log in again");
      }, expiryTime);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Invalid token", err);
      logoutFn();
    }
  }, [token, logoutFn]);

  // ✅ Axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          logoutFn();
          toast.error("Session expired");
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logoutFn]);
}
