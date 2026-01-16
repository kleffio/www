import { useEffect } from "react";

export function SilentLogoutCallback() {
  useEffect(() => {
    console.log("Silent callback received");
    
    if (window.parent !== window) {
      try {
        window.parent.postMessage({ type: "silent_logout_complete" }, window.location.origin);
      } catch (e) {
        console.warn("Failed to notify parent:", e);
      }
    } else {
      console.log("Not in iframe, redirecting to home");
      window.location.href = "/";
    }
  }, []);

  return null;
}