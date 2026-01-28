"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";
import { RESULTS_UPDATED_EVENT, RESULTS_STORE_KEY } from "../utils/storage";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [hasSavedResults, setHasSavedResults] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

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
    checkSavedResults();
    
    window.addEventListener(RESULTS_UPDATED_EVENT, checkSavedResults);
    window.addEventListener("storage", checkSavedResults);

    return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener(RESULTS_UPDATED_EVENT, checkSavedResults);
        window.removeEventListener("storage", checkSavedResults);
    };
  }, []);

  const menuItems: string[] = [
    "Match Algorithm",
    "Car Listings",
    "Compare",
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
                src="/logos/logo.svg"
                alt="CarCupid logo"
                fill
                priority
                className={styles.logoImg}
                style={{ objectFit: "contain" }}
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
                <Link key={item} href="/cars" className={styles.navButton}>
                  {item}
                </Link>
              ) : item === "Compare" ? (
                <Link key={item} href="/compare" className={styles.navButton}>
                  {item}
                </Link>
              ) : item === "For Dealers" ? (
                <Link key={item} href="/dealers" className={styles.navButton}>
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
          {hasSavedResults && (
            <Link href="/results" className={styles.resultsButton}>Your Results</Link>
          )}
          <Link href="/quiz" className={styles.contactButton}>Start Quiz</Link>
        </div>

     
        <div className={styles.mobileMenu}>
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
