import React, { useEffect, useRef, useState } from "react";
import { motion as Motion } from "framer-motion";
import { CheckCircle2, AlertCircle, LoaderCircle } from "lucide-react";
import { fetchHealth } from "../utils/api";

const BACKEND_RECOVERY_KEY = "expense-tracker-backend-recovery-pending";
const BACKEND_RECOVERED_EVENT = "backendRecovered";

export default function StatusIndicator() {
  const [status, setStatus] = useState("checking");
  const statusRef = useRef("checking");
  const recoveryEventSentRef = useRef(false);

  async function checkBackendStatus() {
    try {
      const health = await fetchHealth();
      const nextStatus = health?.status === "healthy" ? "online" : "offline";
      const previousStatus = statusRef.current;

      statusRef.current = nextStatus;
      setStatus(nextStatus);

      if (nextStatus === "offline" && typeof window !== "undefined") {
        window.sessionStorage.setItem(BACKEND_RECOVERY_KEY, "true");
      }

      if (
        nextStatus === "online" &&
        previousStatus === "offline" &&
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(BACKEND_RECOVERY_KEY) === "true" &&
        !recoveryEventSentRef.current
      ) {
        recoveryEventSentRef.current = true;
        window.sessionStorage.removeItem(BACKEND_RECOVERY_KEY);
        window.dispatchEvent(new CustomEvent(BACKEND_RECOVERED_EVENT));
      }

      if (nextStatus !== "online") {
        recoveryEventSentRef.current = false;
      }
    } catch (error) {
      console.error("Backend status check failed:", error);
      statusRef.current = "offline";
      setStatus("offline");
      recoveryEventSentRef.current = false;

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(BACKEND_RECOVERY_KEY, "true");
      }
    }
  }

  useEffect(() => {
    let cancelled = false;
    let timerId;

    const scheduleNextCheck = (delay) => {
      timerId = window.setTimeout(async () => {
        await checkBackendStatus();

        if (!cancelled) {
          const nextDelay = statusRef.current === "online" ? 30000 : 3000;
          scheduleNextCheck(nextDelay);
        }
      }, delay);
    };

    scheduleNextCheck(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, []);

  if (status === "checking") {
    return (
      <Motion.span
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <LoaderCircle size={14} className="animate-spin" />
        Checking
      </Motion.span>
    );
  }

  if (status === "online") {
    return (
      <Motion.span
        className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <CheckCircle2 size={14} />
        Backend Online
      </Motion.span>
    );
  }

  return (
    <Motion.span
      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <AlertCircle size={14} />
      Backend Offline
    </Motion.span>
  );
}
