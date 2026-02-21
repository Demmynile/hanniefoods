import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-lg border border-stone-200/70 bg-white/60 p-2 transition disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:bg-amber-100/70"
        aria-label="Previous page"
      >
        <ChevronLeft size={20} className="text-stone-700" />
      </button>

      <div className="flex gap-1">
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              page === pageNum
                ? "bg-stone-900 text-white"
                : "border border-stone-200/70 bg-white/60 text-stone-700 hover:bg-amber-100/70"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className=