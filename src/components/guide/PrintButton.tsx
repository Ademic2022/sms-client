"use client";

/** "Download PDF": the browser's print dialog, where Save as PDF is one of the destinations. */
export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <path d="M8 2v8m0 0 3-3m-3 3L5 7M3 12v1.5h10V12" />
      </svg>
      Download PDF
    </button>
  );
}
