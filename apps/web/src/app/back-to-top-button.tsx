"use client";

import { useEffect, useState } from "react";

const scrollThreshold = 350;

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > scrollThreshold);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      aria-label="Върни се най-горе"
      className={[
        "fixed bottom-5 right-4 z-50 inline-grid h-12 w-12 place-items-center rounded-full bg-brand-600 text-white shadow-[0_14px_34px_rgba(127,51,19,0.28)] transition duration-200 hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 sm:bottom-7 sm:right-6",
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      ].join(" ")}
      onClick={scrollToTop}
      type="button"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        viewBox="0 0 24 24"
      >
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
