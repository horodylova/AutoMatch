import { sendGAEvent } from '@next/third-parties/google';

type EventProps = {
  [key: string]: string | number | boolean;
};

export const sendEvent = (eventName: string, params?: EventProps) => {
  if (typeof window !== 'undefined') {
    sendGAEvent('event', eventName, params || {});
  }
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
