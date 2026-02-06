"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './journal.module.css';

const ARTICLES = [
  {
    id: 1,
    title: "Why Your Next Car Should Match Your Lifestyle, Not Just Your Budget",
    category: "Expert Advice",
    excerpt: "Most buyers focus on price and MPG, but the real satisfaction comes from how a car fits into your daily routine. Learn how to identify your true automotive needs.",
    image: "/photos-cars/amir-riazipour-TeYK3zOIkUk-unsplash.jpg",
    slug: "match-lifestyle-not-budget",
    isFeatured: true
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
  },
  {
    id: 4,
    title: "The Rise of Hybrids: Is It Finally Time to Switch?",
    category: "Trends",
    excerpt: "Electric cars get all the headlines, but modern hybrids might be the smarter choice for most drivers today.",
    image: "/photos-cars/christian-agbede-j0SfhblI3Bk-unsplash.jpg",
    slug: "rise-of-hybrids"
  },
  {
    id: 5,
    title: "Safety First: Understanding Modern Driver Assistance Tech",
    category: "Safety",
    excerpt: "From lane keeping to adaptive cruise control - decoding the acronyms that keep you safe on the road.",
    image: "/photos-cars/dylan-posso-nqsiVHA7HFY-unsplash.jpg",
    slug: "understanding-driver-assistance"
  }
];

export default function JournalPage() {
  const featuredArticle = ARTICLES.find(a => a.isFeatured);
  const regularArticles = ARTICLES.filter(a => !a.isFeatured);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        
        <div className={styles.grid}>
          {/* Featured Article */}
          {featuredArticle && (
            <Link href={`/journal/${featuredArticle.slug}`} className={styles.featured}>
              <div className={styles.featuredImageWrapper}>
                <Image
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  fill
                  className={styles.featuredImage}
                  priority
                />
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.featuredLabel}>Featured Story</span>
                <h2 className={styles.featuredTitle}>{featuredArticle.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredArticle.excerpt}</p>
                <div className={styles.readMore}>
                  Read Full Story
                  <svg className={styles.arrow} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </Link>
          )}

          {/* Regular Articles */}
          {regularArticles.map((article) => (
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
    </div>
  );
}
