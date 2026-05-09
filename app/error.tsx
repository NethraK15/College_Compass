"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-shell py-12">
      <div className="mx-auto max-w-md">
        <div className="card border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-red-900">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-700">{error.message || "An unexpected error occurred"}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => reset()}
              className="btn-primary flex-1"
            >
              Try again
            </button>
            <Link href="/" className="btn-secondary flex-1">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
