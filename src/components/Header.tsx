"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Header.module.css";

export default function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems: string[] = [
    "How It Works",
    "Car Personalities",
    "Match Algorithm",
    
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
                src="/logo.svg"
                alt="CarCupid logo"
                fill
                priority
                className={styles.logoImg}
                style={{ objectFit: "contain" }}
              />
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className={styles.desktopNav}>
          {menuItems.map((item) => (
            item === "How It Works" ? (
              <Link key={item} href="/#how-it-works" className={styles.navButton}>
                {item}
              </Link>
            ) : item === "Car Personalities" ? (
              <Link key={item} href="/#car-personalities" className={styles.navButton}>
                {item}
              </Link>
            ) : (
              <button key={item} className={styles.navButton}>
                {item}
              </button>
            )
          ))}
          <button className={styles.contactButton}>Start Quiz</button>
        </nav>

        {/* Mobile hamburger */}
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

      {/* Mobile drawer + backdrop */}
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
                item === "How It Works" ? (
                  <Link
                    key={item}
                    href="/#how-it-works"
                    className={styles.drawerItem}
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {item}
                  </Link>
                ) : item === "Car Personalities" ? (
                  <Link
                    key={item}
                    href="/#car-personalities"
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

              <button
                className={styles.drawerContactButton}
                onClick={() => setIsDrawerOpen(false)}
              >
                Start Quiz
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}


