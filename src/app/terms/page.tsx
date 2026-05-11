"use client";

import styles from "../legal.module.css";

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Terms of Service</h1>
        <p className={styles.date}>Effective Date: January 30, 2026</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Agreement to Terms</h2>
        <p className={styles.text}>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you&quot;) 
          and CarCupid (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the CarCupid website and related services.
          By accessing the site, you acknowledge that you have read, understood, and agree to be bound by all of these Terms of Service.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Use of Services</h2>
        <p className={styles.text}>
          Our services are intended for users who are at least 18 years old. You agree to use our services only for lawful purposes 
          and in accordance with these Terms.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Dealer Services</h2>
        <p className={styles.text}>
          For automotive dealers, our services include connecting you with potential buyers. By using our dealer services, 
          you agree to provide accurate inventory information and to treat all potential buyers referred by us in a professional and lawful manner.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Intellectual Property</h2>
        <p className={styles.text}>
          The site and its original content, features, and functionality are owned by CarCupid and are protected by international copyright, 
          trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>5. Limitation of Liability</h2>
        <p className={styles.text}>
          In no event shall CarCupid, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, 
          incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other 
          intangible losses, resulting from your access to or use of or inability to access or use the services.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>6. Governing Law</h2>
        <p className={styles.text}>
          These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>7. Changes to Terms</h2>
        <p className={styles.text}>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our services 
          after those revisions become effective, you agree to be bound by the revised terms.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>8. Contact Us</h2>
        <p className={styles.text}>
          If you have any questions about these Terms, please contact us at: <a href="mailto:admin@carcupid.fit" className={styles.link}>admin@carcupid.fit</a>.
        </p>
      </div>
    </div>
  );
}
