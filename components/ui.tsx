import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="WatchRead home">
      <span className="brand-mark">
        <BookOpen size={19} strokeWidth={1.5} />
      </span>
      watchread<span className="brand-dot">.</span>
    </Link>
  );
}
export function Loading() {
  return (
    <div className="loading-screen">
      <Brand />
      <div className="loading-line" />
      <p>Opening your reading room…</p>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <Link href="/credits">
        Prepared companions composed and reviewed by Fable 5.1
      </Link>
      <Link href="/guide">
        Take a quick tour <ArrowUpRight size={14} />
      </Link>
    </footer>
  );
}
