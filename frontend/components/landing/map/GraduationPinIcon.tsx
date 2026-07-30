"use client";

import { cn } from "@/lib/utils";

export function GraduationPinIcon({
  className,
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 48 64"
      fill="none"
      className={cn("drop-shadow-[0_4px_12px_rgba(13,148,136,0.45)]", className)}
      aria-hidden
    >
      <path
        d="M24 62C24 62 6 44 6 26C6 14.954 14.954 6 26 6C37.046 6 46 14.954 46 26C46 44 24 62 24 62Z"
        fill="#0D9488"
        stroke="#0F766E"
        strokeWidth="1.5"
      />
      <circle cx="24" cy="24" r="14" fill="#FAFAFA" />
      {/* Graduation cap */}
      <path d="M12 18L24 12L36 18L24 24L12 18Z" fill="#18181B" />
      <path d="M34 19V27" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <rect x="32" y="26" width="4" height="3" rx="1" fill="#18181B" />
      <circle cx="24" cy="24" r="4" fill="#0D9488" opacity="0.35" />
    </svg>
  );
}
