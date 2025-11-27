"use client";

import { useState, useEffect } from "react";

interface UseLoadingOptions {
  initialDelay?: number;
  minLoadingTime?: number;
}

export function useLoading(
  isLoading: boolean,
  { initialDelay = 0, minLoadingTime = 500 }: UseLoadingOptions = {},
) {
  const [showLoading, setShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let delayTimer: NodeJS.Timeout | null = null;
    let minTimer: NodeJS.Timeout | null = null;

    if (isLoading) {
      // Start timer when loading begins
      setStartTime(Date.now());

      // Delay showing loading indicator
      delayTimer = setTimeout(() => {
        setShowLoading(true);
      }, initialDelay);
    } else {
      // Calculate elapsed time
      const elapsed = startTime ? Date.now() - startTime : 0;
      const remaining = Math.max(0, minLoadingTime - elapsed);

      // Keep loading indicator visible for minimum time
      if (remaining > 0 && showLoading) {
        minTimer = setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remaining);
      } else {
        setShowLoading(false);
        setStartTime(null);
      }
    }

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      if (minTimer) clearTimeout(minTimer);
    };
  }, [isLoading, initialDelay, minLoadingTime, startTime, showLoading]);

  return showLoading;
}
