"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "./JournalPreview.module.css";

const ARTICLES = [
  {
    id: 1,
    title: "Why Your Next Car Should Match Your Lifestyle, Not Just Your Budget",
    category: "Expert Advice",
    excerpt: "Most buyers focus on price and MPG, but the real satisfaction comes from how a car fits into your daily routine.",
    image: "/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg",
    slug: "match-lifestyle-not-budget"
  },
  {
    id: 2,
    title: "Hidden Gems: 5 Underrated Models That Offer Incredible Value",
    category: "Market Watch",
    excerpt: "Looking for luxury or performance on a budget? These overlooked models deliver premium features for less.",
    image: "/photos-cars/dhiva-krishna-YApS6TjKJ9c-unsplash.jpg",
    slug: "underrated-models-value"
  },
  {
    id: 3,
    title: "Lease vs. Buy: The Ultimate Guide for 2026",
    category: "Financial Smarts",
    excerpt: "With changing interest rates and residual values, the old rules of financing have changed. Here's what you need to know.",
    image: "/photos-cars/jake-blucker-tMzCrBkM99Y-unsplash.jpg",
    slug: "lease-vs-buy-2026"
  }
];

export default function JournalPreview() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.label}>CarCupid Journal</span>
            <h2 className={styles.title}>Stories & Insights for Smart Drivers</h2>
          </div>
          <Link href="/journal" className={styles.viewAll}>
            View All Articles
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <div className={styles.grid}>
          {ARTICLES.map((article) => (
            <Link key={article.id} href={`/journal/${article.slug}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className={styles.image}
                />
              </div>
              <div className={styles.cardBody}>
                <span className={styles.category}>{article.category}</span>
                <h3 className={styles.cardTitle}>{article.title}</h3>
                <p className={styles.cardExcerpt}>{article.excerpt}</p>
                <div className={styles.readMore}>
                  Read Article
                  <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
