"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./dealers.module.css";
import { submitForm } from "../../utils/formSubmission";
import Toast, { ToastType } from "../../components/Toast";
import { event } from "@/lib/pixel";

export default function PartnersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType; title?: string } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    event("ForDealersView");
  }, []);

  const showToast = (message: string, type: ToastType, title?: string) => {
    setToast({ message, type, title });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    const company = formData.get("company")?.toString().trim();
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();

    if (!company || !name || !email) {
      showToast("Please fill in all required fields.", "error", "Validation Error");
      return;
    }

    setIsSubmitting(true);

    const endpoint =
      process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || "https://formspree.io/f/mqebkzdj";

    if (!endpoint) {
      showToast(
        "Form submission is not configured (missing endpoint).",
        "error",
        "Configuration Error"
      );
      setIsSubmitting(false);
      return;
    }

    const result = await submitForm(endpoint, formData);

    if (result.ok) {
      showToast("Your message has been sent successfully!", "success", "Success!");
      event("ForDealersRequest");

      try {
        const payload = {
          company,
          name,
          email,
          interest: formData.get("interest")?.toString() || "",
          phone: formData.get("phone")?.toString() || "",
        };

        await fetch("/api/dealers/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error("Dealer contact logging failed:", error);
      }

      form.reset();
    } else {
      showToast(
        result.error || "There was an error sending your message. Please try again later.",
        "error",
        "Submission Failed"
      );
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
        {/* ── LEFT: Info ── */}
        <div className={styles.infoSection}>

          {/* Header */}
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
            <h1 className={styles.title}>
              <span className={styles.mobileOnly}>High-Intent Buyers. Your Inventory.</span>
              <span className={styles.desktopOnly}>
                High-Intent Buyers<br />Sent Straight to Your Inventory
              </span>
            </h1>
          </div>

          <p className={styles.subtitle}>
            CarCupid matches serious buyers to your actual stock — no listings marketplace, no lead auctions, no wasted spend.
          </p>

          {/* Stats strip */}
          <div className={styles.statRow}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>$150</span>
              <span className={styles.statLabel}>flat / month</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>$0</span>
              <span className={styles.statLabel}>per-lead fees</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>&lt;3</span>
              <span className={styles.statLabel}>days to activate</span>
            </div>
          </div>

          {/* CTA hero */}
          <div className={styles.ctaHero}>
            <div className={styles.ctaHeroInner}>
              <div className={styles.ctaPriceRow}>
                <span className={styles.ctaPrice}>$150</span>
                <span className={styles.ctaPriceSub}>/ month · flat rate · cancel anytime</span>
              </div>
              <Link
                href="/dealers/order"
                className={`${styles.orderButton} ${styles.orderButtonXL} ${styles.orderButtonActive}`}
              >
                Add Your Inventory
              </Link>
              <p className={styles.ctaNote}>
                Full visibility into every match, view, and buyer intent signal. No black boxes.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className={styles.howItWorksSection}>
            <h3 className={styles.howItWorksTitle}>How It Works</h3>
            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <div className={styles.stepNumBadge}>1</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>Connect your inventory</div>
                  <p className={styles.stepDescription}>
                    We hook into your existing feed — Cox Automotive, your website export, or a custom source.
                  </p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumBadge}>2</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>Buyers declare real intent</div>
                  <p className={styles.stepDescription}>
                    Shoppers tell CarCupid their exact budget, specs, and timeline — before they ever see a car.
                  </p>
                </div>
              </div>
              <div className={styles.stepItem}>
                <div className={styles.stepNumBadge}>3</div>
                <div className={styles.stepBody}>
                  <div className={styles.stepTitle}>We route them to you</div>
                  <p className={styles.stepDescription}>
                    Matched buyers land directly on your inventory — already pre-qualified, already motivated.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature list */}
          <ul className={styles.featuresList}>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Matched to your actual stock — not generic lead pools</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Feed integration in days (Cox, site feed, or custom)</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Full visibility — matches, views, and buyer intent signals</span>
            </li>
            <li className={styles.featureItem}>
              <span className={styles.featureIcon}>✓</span>
              <span>Direct dealer support. No outsourced call centers.</span>
            </li>
          </ul>

          <div className={styles.trustSignal}>
            Built for dealers who are done paying for tyrekickers
          </div>

        </div>

        {/* ── RIGHT: Form ── */}
        <div className={styles.formSection} id="dealerForm">
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Request a Dealer Walkthrough</h2>
            <p className={styles.formSubnote}>
              We&rsquo;ll show you exactly how CarCupid matches buyers to your inventory.
            </p>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="company" className={styles.label}>Dealership Name</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className={styles.input}
                  placeholder="e.g. Best Cars Ltd."
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contact" className={styles.label}>Your Name</label>
                <input
                  type="text"
                  id="contact"
                  name="name"
                  className={styles.input}
                  placeholder="First and last name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Work Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  placeholder="name@dealership.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="interest" className={styles.label}>
                  What best describes you? <span className={styles.labelOptional}>(optional)</span>
                </label>
                <select
                  id="interest"
                  name="interest"
                  className={styles.select}
                  defaultValue=""
                >
                  <option value="" disabled>Select an option</option>
                  <option value="learn_more">See how buyer matching works</option>
                  <option value="inventory_integration">Connect my inventory feed</option>
                  <option value="partnership_pricing">Evaluate pricing options</option>
                  <option value="other">Just exploring</option>
                </select>
              </div>

              <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Request a Walkthrough →"}
              </button>

              <p className={styles.disclaimer}>
                By submitting, you agree to our{" "}
                <Link href="/terms">dealer terms</Link> and{" "}
                <Link href="/privacy">privacy policy</Link>.
              </p>
            </form>
          </div>

          {/* Reassurance block below form */}
          <div className={styles.formReassurance}>
            <div className={styles.reassuranceItem}>No spam. Ever.</div>
            <div className={styles.reassuranceDot} />
            <div className={styles.reassuranceItem}>Reply within 1 business day</div>
            <div className={styles.reassuranceDot} />
            <div className={styles.reassuranceItem}>No commitment required</div>
          </div>
        </div>
      </div>
    </div>
  );
}