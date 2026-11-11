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

/** One observer and one frame loop own all editorial reveals and transient motion. */
export function MotionRoot() {
  const pathname = usePathname();
  useEffect(() => {
    window.__motionReady = true;
    const root = document.documentElement;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const hover = matchMedia("(hover:hover)");
    const targets = [...document.querySelectorAll<HTMLElement>("[data-r],[data-mask],[data-split],[data-zoom],.quote")];
    const header = document.querySelector<HTMLElement>(".hdr");
    const hero = document.querySelector<HTMLElement>(".hero");
    const parallax = document.querySelector<HTMLElement>("[data-par]");
    const cover = document.querySelector<HTMLElement>(".cover-n");
    const preview = document.querySelector<HTMLElement>("#recipe-preview");
    const counter = document.querySelector<HTMLElement>("#index-counter");
    const rail = document.querySelector<HTMLElement>("#category-rail");
    const motionAllowed = () => !media.matches && !window.__motionTimedOut;
    let enabled = motionAllowed(), frame = 0, heroHeight = 0, coverTop = 0;
    let mx = 0, my = 0, px = 0, py = 0, showing = false, lastScroll = -1;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          // The mobile caption sits below the observer's negative bottom margin.
          if (entry.target === hero) hero.querySelectorAll("[data-r]").forEach(node => node.classList.add("in"));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .2, rootMargin: "0px 0px -6% 0px" });

    function measure() {
      heroHeight = hero?.offsetHeight ?? 0;
      coverTop = cover ? cover.getBoundingClientRect().top + window.scrollY : 0;
      lastScroll = -1;
    }
    function solidHeader() { header?.classList.toggle("solid", !hero || window.scrollY > heroHeight - 72); }
    function tick() {
      const y = window.scrollY;
      if (y !== lastScroll) {
        solidHeader();
        if (parallax) parallax.style.transform = `translate3d(0,${(y * .18).toFixed(1)}px,0)`;
        if (cover) cover.style.transform = `translate3d(0,${((coverTop - y - innerHeight * .5) * -.06).toFixed(1)}px,0)`;
        lastScroll = y;
      }
      if (showing && preview) {
        const dx = mx - px; px += dx * .14; py += (my - py) * .14;
        const x = Math.max(8, Math.min(innerWidth - 308, px - 150));
        const y = Math.max(8, Math.min(innerHeight - 233, py - 112));
        preview.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${Math.max(-8, Math.min(8, dx * .14 * .25)).toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    }
    function configure() {
      enabled = motionAllowed(); root.dataset.motion = enabled ? "on" : "off";
      cancelAnimationFrame(frame); observer.disconnect(); measure(); solidHeader();
      if (enabled) { targets.forEach(target => observer.observe(target)); frame = requestAnimationFrame(tick); }
      else { targets.forEach(target => target.classList.add("in")); parallax?.style.removeProperty("transform"); cover?.style.removeProperty("transform"); preview?.classList.remove("on"); showing = false; }
    }
    function roll(number: string) {
      if (!counter || counter.lastElementChild?.textContent === `Nº ${number}`) return;
      const old = counter.lastElementChild!;
      if (!enabled) { counter.textContent = `Nº ${number}`; return; }
      const next = document.createElement("span"); next.className = "rn arriving"; next.textContent = `Nº ${number}`;
      // Keep at most two transient counter nodes during rapid pointer movement.
      [...counter.children].slice(0, -1).forEach(node => node.remove()); counter.append(next);
      old.classList.add("leaving");
      const timer = setTimeout(() => { next.classList.remove("arriving"); timers.delete(timer); }, 16); timers.add(timer);
      const cleanup = setTimeout(() => { old.remove(); timers.delete(cleanup); }, 470); timers.add(cleanup);
    }
    function enter(event: Event) {
      const row = (event.target as Element).closest<HTMLElement>(".row[data-n]");
      if (!row) return;
      roll(row.dataset.n!);
      if (event.type === "pointerover" && enabled && hover.matches && preview) {
        preview.querySelectorAll<HTMLElement>("[data-preview-image]").forEach(image => { image.hidden = image.dataset.previewImage !== row.dataset.preview; });
        if (!showing) { px = mx; py = my; } showing = true; preview.classList.add("on");
      }
    }
    function leave(event: PointerEvent) {
      if (!(event.target as Element).closest("#recipe-index")) { showing = false; preview?.classList.remove("on"); }
    }
    function pointer(event: PointerEvent) { mx = event.clientX; my = event.clientY; leave(event); }
    function click(event: MouseEvent) {
      const button = (event.target as Element).closest<HTMLElement>("[data-rail-dir]");
      if (button && rail) rail.scrollBy({ left: Number(button.dataset.railDir) * Math.max(240, rail.clientWidth * .6), behavior: enabled ? "smooth" : "auto" });
    }
    function scroll() { if (!enabled) solidHeader(); }
    configure();
    const resize = new ResizeObserver(measure); if (hero) resize.observe(hero); if (cover?.parentElement) resize.observe(cover.parentElement);
    media.addEventListener("change", configure); window.addEventListener("resize", measure);
    window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("pointerover", enter); document.addEventListener("focusin", enter); document.addEventListener("click", click);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); resize.disconnect(); timers.forEach(clearTimeout); media.removeEventListener("change", configure); window.removeEventListener("resize", measure); window.removeEventListener("scroll", scroll); window.removeEventListener("pointermove", pointer); document.removeEventListener("pointerover", enter); document.removeEventListener("focusin", enter); document.removeEventListener("click", click); };
  }, [pathname]);
  return null;
}
