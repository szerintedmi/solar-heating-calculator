import { useState } from "react";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="info-button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-label="More information"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-64 p-3 mt-1 text-sm text-neutral-200 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg -left-28 top-full">
          {content}
          <div className="absolute w-2 h-2 bg-neutral-800 border-l border-t border-neutral-700 transform rotate-45 -top-1 left-1/2 -ml-1" />
        </div>
      )}
    </div>
  );
}
