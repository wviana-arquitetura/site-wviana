"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ComponentProps } from "react";
import { useAdminDirtyStore } from "@/store/use-admin-dirty-store";
import { ConfirmLeaveDialog } from "./confirm-leave-dialog";

type GuardedLinkProps = ComponentProps<typeof Link>;

/**
 * Versão de `<Link>` que pergunta ao usuário antes de navegar quando há
 * alterações não salvas (lê o estado de `useAdminDirtyStore`).
 */
export function GuardedLink({ href, onClick, ...rest }: GuardedLinkProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dirty = useAdminDirtyStore((s) => s.dirty);
  const changesCount = useAdminDirtyStore((s) => s.changesCount);
  const clearDirty = useAdminDirtyStore((s) => s.clear);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (!dirty) return;
    e.preventDefault();
    setOpen(true);
  }

  function confirm() {
    setOpen(false);
    clearDirty();
    router.push(typeof href === "string" ? href : href.pathname ?? "/admin");
  }

  return (
    <>
      <Link href={href} onClick={handleClick} {...rest} />
      <ConfirmLeaveDialog
        open={open}
        onOpenChange={setOpen}
        changesCount={changesCount}
        onConfirm={confirm}
      />
    </>
  );
}
