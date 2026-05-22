export type ConsentDecision = "granted" | "denied";

export const CONSENT_STORAGE_KEY = "wviana.consent.v1";

type GtagConsentState = {
  ad_storage: ConsentDecision;
  analytics_storage: ConsentDecision;
  ad_user_data: ConsentDecision;
  ad_personalization: ConsentDecision;
};

const buildState = (decision: ConsentDecision): GtagConsentState => ({
  ad_storage: decision,
  analytics_storage: decision,
  ad_user_data: decision,
  ad_personalization: decision,
});

export const readStoredDecision = (): ConsentDecision | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (raw === "granted" || raw === "denied") return raw;
    return null;
  } catch {
    return null;
  }
};

export const persistDecision = (decision: ConsentDecision) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, decision);
  } catch {
    /* storage indisponível — segue sem persistir */
  }
};

export const updateConsent = (decision: ConsentDecision) => {
  if (typeof window === "undefined") return;
  if (!window.dataLayer) window.dataLayer = [];
  // O Consent Mode requer o pattern do gtag (arguments empurrados no dataLayer).
  // O wrapper `window.gtag` é definido no script inline do layout antes do GTM carregar.
  window.gtag?.("consent", "update", buildState(decision));
};
