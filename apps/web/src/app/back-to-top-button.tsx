"use client";

import { useEffect, useState } from "react";

/** The button appears only past the first screen. */
const SHOW_AFTER = 600;
/** Ignore scroll jitter smaller than this when deciding the direction. */
const DIRECTION_STEP = 6;

/**
 * "Back to top" stays out of the reader's way: it shows only while the visitor scrolls back up
 * past the first screen, hides while they read downwards, and never sits on the footer.
 */
export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let goingUp = false;
    let footerInView = false;
    function update() {
      setIsVisible(goingUp && window.scrollY > SHOW_AFTER && !footerInView);
    }
    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < DIRECTION_STEP) return;
      goingUp = y < lastY;
      lastY = y;
      update();
    }
    const footer = document.querySelector("footer");
    const observer = new IntersectionObserver(([entry]) => {
      footerInView = entry.isIntersecting;
      update();
    });
    if (footer) observer.observe(footer);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  return (
    <button
      aria-label="Върни се най-горе"
      className="back-to-top back-to-top-control no-print"
      data-hidden={isVisible ? undefined : ""}
      onClick={scrollToTop}
      tabIndex={isVisible ? 0 : -1}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
