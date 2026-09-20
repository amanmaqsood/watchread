"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page">
      <h1>This page could not be opened.</h1>
      <p>
        Your saved projects remain on this device. Try opening the page again.
      </p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
