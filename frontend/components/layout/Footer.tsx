import Link from "next/link";
import { Github } from "lucide-react";
import { GEMMA_FULL_LABEL, GEMMA_BADGE_LABEL, GEMMA_VERSION } from "@/lib/gemma";
import { Logo } from "@/components/brand/Logo";

export function Footer() {
  return (
    <footer className="relative border-t border-primary bg-primary text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo size="md" variant="light" />
            <p className="mt-5 max-w-sm text-sm text-white/60 leading-relaxed">
              Discover Your Skills. Build Your Career. Enterprise-grade career guidance powered by {GEMMA_VERSION}.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <a href="#features" className="transition-colors hover:text-accent-light">
                  Features
                </a>
              </li>
              <li>
                <a href="#why-gemma" className="transition-colors hover:text-accent-light">
                  Why Gemma
                </a>
              </li>
              <li>
                <Link href="/signup" className="transition-colors hover:text-accent-light">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              <li>
                <a href="#" className="transition-colors hover:text-accent-light">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-accent-light">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent-light"
                >
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <span>© {new Date().getFullYear()} AI Career Copilot. {GEMMA_BADGE_LABEL}.</span>
          <span className="font-mono text-white/40">{GEMMA_FULL_LABEL}</span>
        </div>
      </div>
    </footer>
  );
}
