export const FB_PIXEL_ID = "1594732338344456";

export const pageview = () => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq("track", "PageView");
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const event = (name: string, options: any = {}) => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).fbq("trackCustom", name, options);
  }
};
