"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const session = window.localStorage.getItem("ew-session");
    router.replace(session === "1" ? "/client" : "/enter");
  }, [router]);

  return null;
}
