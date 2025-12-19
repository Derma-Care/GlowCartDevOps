// import axios from "axios";
// import { showCustomToast } from "./Toaster"; // your existing toast utils

// // 🚀 Intercept ALL Request Errors
// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // ❌ No internet or API server down
//     if (!error.response) {
//       showCustomToast("⚠️ No Internet Connection. Please check your network.", "error");
//     }

//     // ❌ API responded but failed
//     else if (error.response.status >= 500) {
//       showCustomToast("⚠️ Server is not responding. Try again later.", "error");
//     }

//     return Promise.reject(error);
//   }
// );
import { useEffect, useState } from "react";

const useNetwork = () => {
  const [online, setOnline] = useState(navigator.onLine);
  const [speed, setSpeed] = useState("good");

  useEffect(() => {
    const updateSpeed = () => {
      try {
        const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;

        if (conn && conn.downlink !== undefined) {
          setSpeed(conn.downlink < 1 ? "slow" : "good");
        }
      } catch (e) {
        setSpeed("good");
      }
    };

    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    conn?.addEventListener("change", updateSpeed);

    updateSpeed();

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      conn?.removeEventListener("change", updateSpeed);
    };
  }, []);

  return { online, speed };
};

export default useNetwork;
