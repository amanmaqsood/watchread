import Link from "next/link";
import { Brand } from "@/components/ui";
export default function NotFound() {
  return (
    <main className="empty-page">
      <Brand />
      <p className="eyebrow">A PAGE OUT OF PLACE</p>
      <h1>This chapter isn&apos;t here.</h1>
      <p>
        Open your library to find a saved companion or try a prepared lesson.
      </p>
      <Link className="button primary" href="/app">
        Go to your library
      </Link>
    </main>
  );
}
