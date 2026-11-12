"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    /** Set by MotionRoot once it owns the reveals; read by the boot script in layout.tsx. */
    __motionReady?: boolean;
    /** Set by the boot script when MotionRoot missed its deadline; motion stays off for this load. */
    __motionTimedOut?: boolean;
  }
}

/** Selectors that start hidden under [data-motion=on] and are revealed with `.in` (globals.css). */
const REVEAL = ".rv,.mask,[data-split]";

/** One observer owns every reveal; the header turns solid once the page's hero text reaches it. */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    window.__motionReady = true;
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const targets = [...document.querySelectorAll<HTMLElement>(REVEAL)];
    const header = document.querySelector<HTMLElement>(".hdr");
    // Any page can declare a full-bleed hero with [data-hero]: the header stays transparent over it.
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    const motionAllowed = () => !media.matches && !window.__motionTimedOut;
    let solidAt = 0, frame = 0;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
      });
    }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });

    function measure() {
      // Solid once the hero's text block reaches the header (72px + 8px), so the logo never runs over
      // the title; offsetTop ignores the title's rise transform.
      const text = hero?.querySelector<HTMLElement>(".hero-in");
      solidAt = hero ? Math.min(hero.offsetHeight, text ? text.offsetTop : hero.offsetHeight) - 80 : 0;
      solidHeader();
    }
    function solidHeader() { header?.classList.toggle("solid", !hero || window.scrollY > solidAt); }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(solidHeader);
    }
    function configure() {
      const enabled = motionAllowed();
      root.dataset.motion = enabled ? "on" : "off";
      observer.disconnect();
      if (enabled) targets.forEach(target => observer.observe(target));
      else targets.forEach(target => target.classList.add("in"));
      measure();
    }
    configure();
    // Content that arrives later (a streamed Suspense segment, a client list) is revealed too.
    const mutations = new MutationObserver(records => {
      const added: HTMLElement[] = [];
      for (const record of records) record.addedNodes.forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(REVEAL)) added.push(node);
        added.push(...node.querySelectorAll<HTMLElement>(REVEAL));
      });
      for (const node of added) {
        if (node.classList.contains("in") || targets.includes(node)) continue;
        targets.push(node);
        if (root.dataset.motion === "on") observer.observe(node); else node.classList.add("in");
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });
    const resize = new ResizeObserver(measure);
    if (hero) resize.observe(hero);
    media.addEventListener("change", configure);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect(); resize.disconnect();
      media.removeEventListener("change", configure); window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);
  return null;
}
