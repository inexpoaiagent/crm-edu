"use client";

import { useEffect } from "react";
import { fetchJson } from "@/lib/client/fetch-json";

export default function CrmAuthGate() {
  useEffect(() => {
    void fetchJson("/api/auth/me");
  }, []);

  return null;
}
