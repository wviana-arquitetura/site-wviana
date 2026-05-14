export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";

type AnalyticsParam = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsParam>;

const getDataLayer = () => {
  if (typeof window === "undefined") return null;
  if (!window.dataLayer) {
    window.dataLayer = [];
  }
  return window.dataLayer;
};

const sanitizeParams = (params: AnalyticsParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );

export const trackEvent = (eventName: string, params: AnalyticsParams = {}) => {
  const dataLayer = getDataLayer();
  if (!dataLayer) return;

  dataLayer.push({
    event: eventName,
    ...sanitizeParams(params),
  });
};

export const trackPageView = (pagePath?: string) => {
  if (typeof window === "undefined") return;

  trackEvent("page_view", {
    page_path: pagePath ?? window.location.pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
};
