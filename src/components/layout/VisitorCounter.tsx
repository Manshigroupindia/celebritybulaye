"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SESSION_KEY = "cb_session_visited_v1";

export const VisitorCounter: React.FC = () => {
  const pathname = usePathname();
  const { settings, isMounted } = useSiteSettings();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const incrementAttemptedRef = useRef(false);

  // Check if counter is enabled in settings
  const isEnabled = settings.visitorCounter?.enabled !== false;
  const initialBase = settings.visitorCounter?.currentCount ?? settings.visitorCounter?.startingCount ?? 10000;

  useEffect(() => {
    // Exclude admin pages from registering or showing the public visitor count
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    if (!isEnabled) {
      setIsLoading(false);
      return;
    }

    // Set fallback initial count from settings immediately to prevent layout shift
    setCount((prev) => (prev !== null ? prev : initialBase));

    // Prevent duplicate calls during React 19 Strict Mode mounts or re-renders
    if (incrementAttemptedRef.current) {
      return;
    }
    incrementAttemptedRef.current = true;

    const recordVisitOrFetch = async () => {
      try {
        const hasVisitedThisSession = typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) === "1";

        if (!hasVisitedThisSession) {
          // Immediately mark session to prevent race conditions or re-renders
          sessionStorage.setItem(SESSION_KEY, "1");

          // Genuine new session visit: atomically increment via server API
          const res = await fetch("/api/visitors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && typeof data.count === "number") {
              setCount(data.count);
              setIsLoading(false);
              return;
            }
          }
        }

        // Existing session or fallback: retrieve current count
        const getRes = await fetch("/api/visitors");
        if (getRes.ok) {
          const getData = await getRes.json();
          if (getData.success && typeof getData.count === "number") {
            setCount(getData.count);
          }
        }
      } catch (err) {
        // Handle network errors gracefully; preserve local settings count
        console.warn("[VisitorCounter] Network fetch warning:", err);
      } finally {
        setIsLoading(false);
      }
    };

    recordVisitOrFetch();
  }, [pathname, isEnabled, initialBase]);

  // Hide completely if disabled by administrator or inside admin section
  if (!isMounted || !isEnabled || pathname?.startsWith("/admin")) {
    return null;
  }

  const displayValue = (count ?? initialBase).toLocaleString();

  return (
    <div
      id="visitor-counter-badge"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/90 border border-gray-800 text-[11px] text-gray-400 shadow-xs transition-opacity"
      title="Total genuine website visits recorded"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span>Visitors:</span>
      <span className="font-semibold text-white tracking-wide">
        {isLoading && count === null ? (
          <span className="inline-block w-10 h-3 bg-gray-800 rounded animate-pulse" />
        ) : (
          displayValue
        )}
      </span>
    </div>
  );
};
