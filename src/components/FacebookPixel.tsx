"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { useEffect, useState, Suspense } from "react";

export default function FacebookPixel() {
  return (
    <>
      <Suspense fallback={null}>
        <FacebookPixelInner />
      </Suspense>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=1594732338344456&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}

function FacebookPixelInner() {
  const [loaded, setLoaded] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loaded) return;
    
    const w = window as unknown as { fbq: (...args: unknown[]) => void };
    if (typeof w.fbq === "function") {
      w.fbq("track", "PageView");
    }
  }, [pathname, searchParams, loaded]);

  return (
    <Script
      id="fb-pixel"
      strategy="afterInteractive"
      onLoad={() => setLoaded(true)}
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1594732338344456');
        `,
      }}
    />
  );
}
