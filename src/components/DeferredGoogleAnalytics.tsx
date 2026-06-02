"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

interface DeferredGoogleAnalyticsProps {
  gaId: string;
}

export default function DeferredGoogleAnalytics({ gaId }: DeferredGoogleAnalyticsProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const loadAnalytics = () => setShouldLoad(true);
    
    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(loadAnalytics, { timeout: 3500 });
    } else {
      setTimeout(loadAnalytics, 3000);
    }
  }, []);

  if (!shouldLoad) return null;

  return (
    <>
      <Script
        id="ga-deferred"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="ga-init-deferred"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}