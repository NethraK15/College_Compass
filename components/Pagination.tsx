"use client";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button className="btn-secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        Previous
      </button>
      <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
        Page {page} of {totalPages}
      </span>
      <button className="btn-secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Next
      </button>
    </div>
  );
}
