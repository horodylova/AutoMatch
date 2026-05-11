"use client";

import styles from "../legal.module.css";

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.date}>Effective Date: January 30, 2026</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Introduction</h2>
        <p className={styles.text}>
          CarCupid (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
          and use our services, including our car matching platform.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Information We Collect</h2>
        <p className={styles.text}>We collect information that you provide directly to us, including:</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Personal identification information (name, email address, phone number).</li>
          <li className={styles.listItem}>Vehicle preferences and requirements (budget, car type, features).</li>
          <li className={styles.listItem}>Information provided in forms, such as dealer inquiries or feedback.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. How We Use Your Information</h2>
        <p className={styles.text}>We use the information we collect to:</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Provide, operate, and maintain our services.</li>
          <li className={styles.listItem}>Match buyers with appropriate vehicle inventory and dealers.</li>
          <li className={styles.listItem}>Communicate with you regarding your inquiries and our services.</li>
          <li className={styles.listItem}>Improve our website and user experience.</li>
          <li className={styles.listItem}>Comply with legal obligations.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Information Sharing</h2>
        <p className={styles.text}>
          We may share your information with third-party partners, such as automotive dealers, solely for the purpose of 
          facilitating the services you have requested (e.g., connecting you with a dealer who has the car you want). 
          We do not sell your personal information to third parties for marketing purposes unrelated to our services.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Data Security</h2>
        <p className={styles.text}>
          We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, 
          alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Your Rights</h2>
        <p className={styles.text}>
          Depending on your location, you may have certain rights regarding your personal information, such as the right to access, 
          correct, or delete your data. To exercise these rights, please contact us.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Contact Us</h2>
        <p className={styles.text}>
          If you have any questions about this Privacy Policy, please contact us at: <a href="mailto:admin@carcupid.fit" className={styles.link}>admin@carcupid.fit</a>.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Cookies, Tracking Technologies, and Advertising</h2>
        <p className={styles.text}>
          We use cookies and similar technologies (such as pixels, SDKs, and local storage) to operate our website, understand how visitors use it, and (where enabled) support marketing and advertising.
        </p>
        <p className={styles.text}>We use the following cookie categories:</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Strictly Necessary: Required to provide core functionality and security (for example, admin authentication and session management).</li>
          <li className={styles.listItem}>Analytics: Help us understand site usage and improve performance (for example, pages visited, time on page, interactions).</li>
          <li className={styles.listItem}>Advertising/Marketing: Used to measure ad performance and build audiences for advertising (for example, tracking conversions and optimizing campaigns).</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>9. Tools We Use (Analytics &amp; Advertising)</h2>
        <p className={styles.text}>
          We may use third-party tools that set cookies or collect information from your device/browser.
        </p>
        <p className={styles.text}>
          Google Analytics (GA4) (Provider: Google LLC) is used for analytics and measurement (site usage, performance, and conversions). It may collect information such as page views, events (e.g., button clicks), approximate location (derived from IP), device/browser information, and identifiers (which may include cookies and other device identifiers). We configure GA4 data retention in our Google Analytics settings and aim to use the shortest practical retention period for our analytics needs.
        </p>
        <p className={styles.text}>
          Meta Pixel (Facebook Pixel) (Provider: Meta Platforms, Inc.) may be used for advertising/marketing measurement (conversion tracking), analytics related to ad performance, and audience building (where enabled). It may collect information such as page views and events, device/browser information, and identifiers (which may include cookies and other device identifiers). Meta may use this information in accordance with its own policies.
        </p>
        <p className={styles.text}>
          These providers may process information as independent controllers for their own purposes. We encourage you to review their privacy policies for details.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>10. Your Choices (Cookies &amp; Tracking)</h2>
        <p className={styles.text}>
          You can control cookies and tracking in several ways:
        </p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Browser controls: Most browsers allow you to block or delete cookies.</li>
          <li className={styles.listItem}>Device controls: Your device may provide additional privacy controls.</li>
          <li className={styles.listItem}>Cookie preferences: Where available on our site, you can manage your cookie preferences and reject non-essential cookies (such as Analytics and Advertising/Marketing).</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>11. California Privacy Rights (CCPA/CPRA)</h2>
        <p className={styles.text}>
          If you are a California resident, you may have rights under the California Consumer Privacy Act (as amended by the CPRA), subject to exceptions, including the right to know, delete, correct, and opt out of sale/sharing of personal information, where applicable. We will not discriminate against you for exercising your rights.
        </p>
        <p className={styles.text}>Depending on how you use the site, we may collect the following categories of personal information:</p>
        <ul className={styles.list}>
          <li className={styles.listItem}>Identifiers: email address, online identifiers, IP address.</li>
          <li className={styles.listItem}>Internet or network activity: pages viewed, interactions, device/browser details.</li>
          <li className={styles.listItem}>Commercial information: preferences related to vehicles, quiz responses, saved items.</li>
          <li className={styles.listItem}>Approximate geolocation: inferred from IP address.</li>
        </ul>
        <p className={styles.text}>
          Sale or Share: Some advertising technologies may be considered a sale or sharing of personal information under California law, even if no money changes hands, when used for cross-context behavioral advertising.
        </p>
        <p className={styles.text}>
          How to opt out (Do Not Sell or Share): You may opt out by using our &quot;Do Not Sell or Share My Personal Information&quot; link (where available) and/or adjusting cookie preferences to reject Advertising/Marketing cookies.
        </p>
        <p className={styles.text}>
          Global Privacy Control (GPC): We recognize the Global Privacy Control (GPC) signal as a valid request to opt out of sale/sharing for the browser/device where the signal is enabled, where required by law. If GPC is enabled, we will treat it as an opt-out of Advertising/Marketing cookies and similar tracking used for cross-context behavioral advertising for that browser/device.
        </p>
        <p className={styles.text}>
          To better respect user privacy choices, when GPC is enabled we may also disable non-essential analytics cookies and analytics tracking for that browser/device.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>12. Retention</h2>
        <p className={styles.text}>
          We retain personal information only as long as reasonably necessary for the purposes described in this Privacy Policy, unless a longer retention period is required or permitted by law. Analytics retention is configured in the relevant provider settings (for example, Google Analytics).
        </p>
      </div>
    </div>
  );
}
