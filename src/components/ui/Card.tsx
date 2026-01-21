import type { ReactNode } from "react";

interface CardProps {
  title: string;
  children: ReactNode;
  info?: string;
}

export function Card({ title, children, info }: CardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="card-title mb-0">{title}</h2>
        {info && (
          <button
            type="button"
            className="info-button"
            title={info}
            aria-label={`Info about ${title}`}
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
        )}
      </div>
      {children}
    </div>
  );
}
