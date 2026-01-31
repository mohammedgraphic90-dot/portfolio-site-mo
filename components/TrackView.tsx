"use client";

import { useEffect } from "react";

export default function TrackView({ pageKey }: { pageKey: string }) {
  useEffect(() => {
    const key = `viewed:${pageKey}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageKey }),
    }).catch(() => {});
  }, [pageKey]);

  return null;
}
