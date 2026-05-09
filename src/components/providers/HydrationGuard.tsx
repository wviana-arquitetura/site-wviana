"use client";

import { useEffect } from "react";

const BIS_ATTRS = ["bis_skin_checked", "bis_use", "bis_register"];
const BIS_DATA_PREFIXES = ["data-bis-", "data-dynamic-id"];

function cleanInjectedAttrs(root: ParentNode = document) {
  const all = root.querySelectorAll("*");
  for (const el of Array.from(all)) {
    for (const attr of BIS_ATTRS) {
      if (el.hasAttribute(attr)) el.removeAttribute(attr);
    }
    for (const a of Array.from(el.attributes)) {
      if (BIS_DATA_PREFIXES.some((p) => a.name.startsWith(p))) {
        el.removeAttribute(a.name);
      }
    }
  }
}

export function HydrationGuard() {
  useEffect(() => {
    cleanInjectedAttrs();

    const observer = new MutationObserver(() => cleanInjectedAttrs());
    observer.observe(document.documentElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    const timeout = window.setTimeout(() => observer.disconnect(), 10000);

    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return null;
}
