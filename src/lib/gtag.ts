import { sendGAEvent } from '@next/third-parties/google';

type EventProps = {
  [key: string]: string | number | boolean;
};

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

export const sendEvent = (eventName: string, params?: EventProps) => {
  if (!canTrack()) return;
  sendGAEvent('event', eventName, params || {});
};

export const trackQuizStart = () => {
  sendEvent('quiz_start');
};

export const trackQuizComplete = (matchCount: number) => {
  sendEvent('quiz_complete', {
    match_count: matchCount,
  });
};

export const trackDealerClick = (
  carMake: string, 
  carModel: string, 
  dealerName: string,
  price?: number
) => {
  sendEvent('dealer_click', {
    car_make: carMake,
    car_model: carModel,
    dealer_name: dealerName,
    price: price || 0,
  });
};
