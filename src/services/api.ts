import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});
let token = "";
if (typeof window !== "undefined") {
  const auth = localStorage.getItem("auth-storage");
  const authData = auth ? JSON.parse(auth) : null;
  token = authData?.state?.session?.access_token || "";
}
api.defaults.headers.common["apikey"] =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

api.interceptors.response.use(
  (response) => response, // Pass successful responses
  (error) => {
    let retryCount = 0;
    const MAX_RETRIES = 1; // Reload once before forcing logout

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        if (retryCount < MAX_RETRIES) {
          console.log(`Unauthorized or forbidden. Reloading page...`);
          retryCount++;
          window.location.reload();
        } else {
          console.log("Error persists. Logging out user...");
          supabase.auth.signOut(); // Implement this function to clear auth state and redirect to login
        }
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response, // Return successful response
  async (error) => {
    const MAX_RETRIES = 3;

    // Define retryable error codes
    const RETRYABLE_STATUS_CODES = [500, 502, 503, 504]; // Server errors
    const RETRYABLE_METHODS = ["get", "post"];

    const { config, response, code } = error;

    // If no request config is found, return error
    if (!config) {
      console.error("Axios request failed:", error.message);
      return Promise.reject(error);
    }

    // Set up retry count if not already defined
    config.__retryCount = config.__retryCount || 0;

    // Check if method is retryable
    const shouldRetryMethod = RETRYABLE_METHODS.includes(
      config.method.toLowerCase()
    );

    // Handle server errors (5xx) and retryable methods
    if (
      response &&
      RETRYABLE_STATUS_CODES.includes(response.status) &&
      shouldRetryMethod
    ) {
      if (config.__retryCount < (config.maxRetries || MAX_RETRIES)) {
        config.__retryCount += 1;
        const retryDelay = Math.pow(2, config.__retryCount) * 1000; // Exponential backoff

        console.warn(
          `Request failed with status ${response.status}. Retrying ${
            config.__retryCount
          }/${config.maxRetries || MAX_RETRIES} after ${retryDelay}ms...`
        );

        await new Promise((res) => setTimeout(res, retryDelay));
        return api(config);
      }
    }

    // Handle network errors (e.g., ECONNABORTED, ENOTFOUND)
    if (code === "ECONNABORTED" || error.message.includes("Network Error")) {
      console.error("Network error or timeout. Request failed:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
