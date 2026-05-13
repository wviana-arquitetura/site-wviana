/** Disparado quando a cortina taupe do PageTransition termina (todas as rotas). */
export const PAGE_TRANSITION_COMPLETE_EVENT = "wviana:page-transition-complete";

export function dispatchPageTransitionComplete() {
  window.dispatchEvent(new CustomEvent(PAGE_TRANSITION_COMPLETE_EVENT));
}
