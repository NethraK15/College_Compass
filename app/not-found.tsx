"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-shell py-12">
      <div className="mx-auto max-w-md">
        <div className="card p-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">404</h2>
          <p className="mt-2 text-sm text-slate-600">Page not found</p>
          <Link href="/" className="btn-primary mt-4 inline-block">
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
