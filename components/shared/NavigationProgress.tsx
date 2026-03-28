"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

function ProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const prevRoute = useRef(pathname + searchParams.toString());

  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  // Navigation tamamlandı
  useEffect(() => {
    const route = pathname + searchParams.toString();
    if (route === prevRoute.current) return;
    prevRoute.current = route;

    clearTimers();
    setWidth(100);
    timers.current.push(
      setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 350)
    );
  }, [pathname, searchParams]);

  // Link tıklamalarını yakala
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      )
        return;

      clearTimers();
      setVisible(true);
      setWidth(15);
      timers.current.push(setTimeout(() => setWidth(40), 150));
      timers.current.push(setTimeout(() => setWidth(65), 500));
      timers.current.push(setTimeout(() => setWidth(80), 1200));
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearTimers();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] bg-brand-primary shadow-[0_0_6px_rgba(99,102,241,0.6)]"
      style={{
        width: `${width}%`,
        transition: width === 100 ? "width 200ms ease-out" : "width 400ms ease-out",
      }}
    />
  );
}

export default function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <ProgressBar />
    </Suspense>
  );
}
