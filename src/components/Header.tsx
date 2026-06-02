"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { RESULTS_UPDATED_EVENT, RESULTS_STORE_KEY, WISHLIST_UPDATED_EVENT, getWishlistCount } from "../utils/storage";
import { event } from "@/lib/pixel";
import { trackQuizStart } from "@/lib/gtag";
import ThemeToggle from "./ThemeToggle";
import { FaHeart } from "react-icons/fa6";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [hasSavedResults, setHasSavedResults] = useState<boolean>(false);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const logoSrc = "/optimized/cropped-logo.webp";
  const scrollElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    scrollElRef.current = document.getElementById("app-scroll");
    const getScrollTop = () => (scrollElRef.current ? scrollElRef.current.scrollTop : window.scrollY);
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(getScrollTop() > 50);
        ticking = false;
      });
    };

    handleScroll();
    const scrollTarget: EventTarget = scrollElRef.current || window;
    scrollTarget.addEventListener("scroll", handleScroll, { passive: true } as AddEventListenerOptions);

    const checkSavedResults = () => {
      const savedData = localStorage.getItem(RESULTS_STORE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (parsed.expiresAt && parsed.expiresAt > new Date().getTime() && Array.isArray(parsed.results) && parsed.results.length > 0) {
            setHasSavedResults(true);
            return;
          }
        } catch {
        }
      }
      setHasSavedResults(false);
    };
    const handleWishlist = () => setWishlistCount(getWishlistCount());

    const scheduleNonCritical = () => {
      checkSavedResults();
      handleWishlist();
    };

    if ("requestIdleCallback" in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback(scheduleNonCritical, { timeout: 1500 });
    } else {
      setTimeout(scheduleNonCritical, 0);
    }

    window.addEventListener(RESULTS_UPDATED_EVENT, checkSavedResults);
    window.addEventListener("storage", checkSavedResults);
    window.addEventListener(WISHLIST_UPDATED_EVENT, handleWishlist);
    window.addEventListener("storage", handleWishlist);

    return () => {
        scrollTarget.removeEventListener("scroll", handleScroll);
        window.removeEventListener(RESULTS_UPDATED_EVENT, checkSavedResults);
        window.removeEventListener("storage", checkSavedResults);
        window.removeEventListener(WISHLIST_UPDATED_EVENT, handleWishlist);
        window.removeEventListener("storage", handleWishlist);
    };
  }, []);

  const menuItems: string[] = [
    "Match Algorithm",
    "Car Listings",
    "Compare",
    "Journal",
    "For Dealers",
  ];

  return (
    <>
      <header
        className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logoContainer}>
            <div className={styles.logoBox}>
              <Image
                src={logoSrc}
                alt="CarCupid logo"
                fill
                priority
                sizes="64px"
                className={styles.logoImg}
                style={{ objectFit: "contain" }}
                quality={70}
              />
            </div>
          </Link>
          <nav className={styles.desktopNav}>
            {menuItems.map((item) => (
              item === "Match Algorithm" ? (
                <Link key={item} href="/scores" className={styles.navButton}>
                  {item}
                </Link>
              ) : item === "Car Listings" ? (
                <Link key={item} href="/cars" className={styles.navButton} onClick={() => event("CarListingClick")}>
                  {item}
                </Link>
              ) : item === "Compare" ? (
                <Link key={item} href="/compare" className={styles.navButton} onClick={() => event("CompareCarsClick")}>
                  {item}
                </Link>
              ) : item === "Journal" ? (
                <Link key={item} href="/journal" className={styles.navButton} onClick={() => event("JournalClick")}>
                  {item}
                </Link>
              ) : item === "For Dealers" ? (
                <Link key={item} href="/dealers" className={styles.navButton} onClick={() => event("ForDealersClick")}>
                  {item}
                </Link>
              ) : (
                <button key={item} className={styles.navButton}>
                  {item}
                </button>
              )
            ))}
          </nav>
        </div>

        <div className={styles.headerRight}>
          <Link href="/wishlist" className={styles.wishlistIconBtn} aria-label="Open wishlist">
            <FaHeart />
            <span className={styles.wishlistBadge}>{wishlistCount}</span>
          </Link>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggle />
          </div>
          {hasSavedResults && (
            <Link href="/results" className={styles.resultsButton}>Your Results</Link>
          )}
          <Link href="/quiz" className={styles.contactButton} onClick={() => {
            trackQuizStart();
            event("StartQuiz");
          }}>Start Quiz</Link>
        </div>

     
        <div className={styles.mobileMenu}>
          <Link href="/wishlist" className={styles.wishlistIconBtn} aria-label="Open wishlist">
            <FaHeart />
            <span className={styles.wishlistBadge}>{wishlistCount}</span>
          </Link>
          <button
            className={styles.hamburger}
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {isDrawerOpen && (
        <>
          <div
            className={styles.backdrop}
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className={styles.mobileDrawer}>
            <div className={styles.drawerHeader}>
              <div className={styles.drawerHeaderLeft}>
                <ThemeToggle />
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <div className={styles.drawerContent}>
              {menuItems.map((item) => (
                item === "Match Algorithm" ? (
                  <Link
                    key={item}
                    href="/scores"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : item === "Car Listings" ? (
                  <Link
                    key={item}
                    href="/cars"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : item === "Compare" ? (
                  <Link
                    key={item}
                    href="/compare"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : item === "Journal" ? (
                  <Link
                    key={item}
                    href="/journal"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : item === "For Dealers" ? (
                  <Link
                    key={item}
                    href="/dealers"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : (
                  <button
                    key={item}
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </button>
                )
              ))}

              <Link
                href="/wishlist"
                className={styles.drawerItem}
                onClick={() => setIsDrawerOpen(false)}
              >
                Wishlist
              </Link>
              <Link
                href="/quiz"
                className={styles.drawerContactButton}
                onClick={() => setIsDrawerOpen(false)}
              >
                Start Quiz
              </Link>
              {hasSavedResults && (
                <Link
                  href="/results"
                  className={styles.drawerResultsButton}
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Your Results
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
