import { create } from "zustand";

/**
 * Estado global de "alterações não salvas" no painel admin.
 *
 * Páginas/forms editáveis registram seu estado `dirty` aqui. Outros componentes
 * (nav lateral, links de "voltar") leem pra interceptar navegação acidental.
 */
type AdminDirtyState = {
  /** Há alterações não salvas em algum form? */
  dirty: boolean;
  /** Quantidade de alterações (mostra no dialog). */
  changesCount: number;
  /** Marca dirty (chamar em useEffect quando o form muda). */
  setDirty: (dirty: boolean, changesCount?: number) => void;
  /** Reseta (chamar ao desmontar form ou ao salvar com sucesso). */
  clear: () => void;
};

export const useAdminDirtyStore = create<AdminDirtyState>((set) => ({
  dirty: false,
  changesCount: 0,
  setDirty: (dirty, changesCount = 0) => set({ dirty, changesCount }),
  clear: () => set({ dirty: false, changesCount: 0 }),
}));
