"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./dealers.module.css";
import { submitForm } from "../../utils/formSubmission";
import Toast, { ToastType } from "../../components/Toast";

export default function PartnersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; title?: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const showToast = (message: string, type: ToastType, title?: string) => {
    setToast({ message, type, title });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Validate required fields
    const company = formData.get('company')?.toString().trim();
    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim();

    if (!company || !name || !email) {
      showToast('Please fill in all required fields.', 'error', 'Validation Error');
      return;
    }

    setIsSubmitting(true);

    const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mqebkzdj";
    
    if (!endpoint) {
      showToast('Form submission is not configured (missing endpoint).', 'error', 'Configuration Error');
      setIsSubmitting(false);
      return;
    }

    const result = await submitForm(endpoint, formData);

    if (result.ok) {
      showToast('Your message has been sent successfully!', 'success', 'Success!');
      form.reset();
    } else {
      showToast(result.error || 'There was an error sending your message. Please try again later.', 'error', 'Submission Failed');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className={styles.container}>
      {toast && (
        <div className={styles.toastContainer}>
          <Toast
            message={toast.message}
            type={toast.type}
            title={toast.title}
            onClose={() => setToast(null)}
          />
        </div>
      )}
      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <div className={styles.headerRow}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/cupids/Helmet%20and%20Keys.png"
                alt="CarCupid Dealer Logo"
                fill
                className={styles.image}
                unoptimized
              />
            </div>
            
            <h1 className={styles.title}>Send High-Intent Buyers Directly to Your Inventory</h1>
          </div>
          <p className={styles.subtitle}>
            CarCupid matches serious buyers directly to your actual inventory — without selling listings or auctioning leads.
          </p>

          <div className={styles.howItWorksSection}>
            <h3 className={styles.howItWorksTitle}>How CarCupid Works</h3>
            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <div className={styles.stepTitle}>1. Connect your inventory</div>
                <p className={styles.stepDescription}>We connect to your existing inventory feed (Cox, your website, or custom).</p>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepTitle}>2. Buyers declare real intent</div>
                <p className={styles.stepDescription}>Shoppers tell CarCupid exactly what they want — budget, specs, timing.</p>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepTitle}>3. Matched buyers land on your cars</div>
                <p className={styles.stepDescription}>High-intent buyers are routed directly to the dealer that actually has the right vehicle.</p>
              </div>
            </div>
          </div>

          <div className={styles.trustSignal}>
            Built for dealers tired of paying for unqualified leads
          </div>

          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span className={styles.desktopOnly}>Buyers matched to your actual inventory (not generic leads)</span>
              <span className={styles.mobileOnly}>Matches to actual inventory (no generic leads)</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span className={styles.desktopOnly}>Inventory feed integration (Cox, website feed, or custom)</span>
              <span className={styles.mobileOnly}>Easy feed integration (Cox, website, custom)</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span className={styles.desktopOnly}>Transparent performance visibility (matches, views, buyer intent)</span>
              <span className={styles.mobileOnly}>Full transparency on matches & intent</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span className={styles.desktopOnly}>Direct dealer support — no outsourced call centers</span>
              <span className={styles.mobileOnly}>Direct support. No call centers.</span>
            </li>
          </ul>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Get Matched Buyers (No Listings, No Leads)</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.label}>Dealership Name</label>
                <input type="text" id="company" name="company" className={styles.input} placeholder="e.g. Best Cars Ltd." required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.label}>Contact Name</label>
                <input type="text" id="contact" name="name" className={styles.input} placeholder="Your Name" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input type="email" id="email" name="email" className={styles.input} placeholder="name@dealership.com" required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="interest" className={styles.label}>What best describes your interest? (optional)</label>
                <select 
                  id="interest" 
                  name="interest"
                  className={styles.select}
                  defaultValue=""
                >
                  <option value="" disabled>Select an option</option>
                  <option value="learn_more">See how CarCupid matches buyers to inventory</option>
                  <option value="inventory_integration">Connect my inventory feed</option>
                  <option value="partnership_pricing">Evaluate pricing options</option>
                  <option value="other">Just exploring</option>
                </select>
              </div>

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : '👉 Request a Dealer Walkthrough'}
              </button>

              <p className={styles.disclaimer}>
                By submitting this form, you agree to our <Link href="/terms">dealer terms</Link> and <Link href="/privacy">privacy policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.pricingTeaser}>
        Most dealers activate CarCupid in under a week. Flat monthly pricing. No per-lead fees. No commissions.
      </div>

      <div className={styles.certaintyCue}>
        <p>
          <strong>CarCupid doesn’t sell listings or leads.</strong>
          We match serious buyers to the dealer that actually has the right car.
        </p>
      </div>
    </div>
  );
}