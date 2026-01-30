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
    </div>
  );
}
