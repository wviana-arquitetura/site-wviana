import { useEffect, useState } from "react";

/**
 * Em desktop (≥768px, mesmo `md` do Tailwind), mailto abre em nova aba
 * para não sair do site quando o cliente usa webmail.
 */
export function useDesktopMailtoBlankTarget(): "_blank" | undefined {
  const [target, setTarget] = useState<"_blank" | undefined>(undefined);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const sync = () => setTarget(mq.matches ? "_blank" : undefined);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return target;
}
