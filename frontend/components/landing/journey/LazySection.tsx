"use client";

import { useEffect, useRef, useState } from "react";

type LazySectionProps = {
  id?: string;
  minHeight?: string;
  rootMargin?: string;
  children: React.ReactNode;
};

export function LazySection({
  id,
  minHeight = "80vh",
  rootMargin = "240px 0px",
  children,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} id={id} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
