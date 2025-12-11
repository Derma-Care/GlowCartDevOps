import axios from "axios";
import { showCustomToast } from "./Toaster"; // your existing toast utils

// 🚀 Intercept ALL Request Errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // ❌ No internet or API server down
    if (!error.response) {
      showCustomToast("⚠️ No Internet Connection. Please check your network.", "error");
    }

    // ❌ API responded but failed
    else if (error.response.status >= 500) {
      showCustomToast("⚠️ Server is not responding. Try again later.", "error");
    }

    return Promise.reject(error);
  }
);
