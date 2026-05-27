"use client";

import { useEffect } from "react";

/**
 * Avisa o usuário ao tentar sair da página quando há mudanças não salvas.
 *
 * Cobre:
 *  - Fechar a aba/navegador
 *  - Recarregar (F5)
 *  - Voltar/avançar pelas setas do browser
 *
 * NÃO cobre cliques em links/botões internos do app — esses precisam ser
 * tratados manualmente nos componentes (com dialog customizado).
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // O texto não é exibido em navegadores modernos (mostram mensagem padrão
      // do próprio browser), mas precisa estar setado pra disparar o aviso.
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);
}
