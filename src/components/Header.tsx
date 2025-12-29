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
    "Match Algorithm",
    "Car Listings",
    "Compare",
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
              ) : (
                <button key={item} className={styles.navButton}>
                  {item}
                </button>
              )
            ))}
          </nav>
        </div>

        <div className={styles.headerRight}>
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
            </div>
          </div>
        </>
      )}
    </>
  );
}
