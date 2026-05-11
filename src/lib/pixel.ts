export const FB_PIXEL_ID = "1594732338344456";

const canTrack = () => {
  if (typeof window === "undefined") return false;
  const gpc = typeof navigator !== "undefined" && (navigator as unknown as { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  if (gpc) return false;
  try {
    return window.localStorage.getItem("cc_consent_v1") === "accepted";
  } catch {
    return false;
  }
};

export const pageview = () => {
  if (!canTrack()) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    fbq("track", "PageView");
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const event = (name: string, options: any = {}) => {
  if (!canTrack()) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    fbq("trackCustom", name, options);
  }
};
