"use client";

import { useEffect } from "react";

export function MduiBoot() {
  useEffect(() => {
    import("mdui");
  }, []);

  return null;
}
