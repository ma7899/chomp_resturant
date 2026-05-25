"use client";

import { useEffect } from "react";

/**
 * Locks the body scroll while `active` is true.
 *
 * Implementation notes:
 *  - Uses the `position: fixed` + negative `top` technique because
 *    `overflow: hidden` alone is NOT enough on iOS Safari — touch
 *    scroll still propagates and the page slides behind any drawer.
 *  - Compensates for scrollbar width on desktop to avoid layout shift.
 *  - Restores scroll position on cleanup.
 *  - Safe when called from multiple components: each lock instance
 *    saves and restores its own snapshot.
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active || typeof document === "undefined") return;

    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY || html.scrollTop || 0;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
      htmlOverscroll: html.style.overscrollBehavior,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.paddingRight = prev.paddingRight;
      html.style.overscrollBehavior = prev.htmlOverscroll;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}
