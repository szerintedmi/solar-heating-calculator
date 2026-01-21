export function Header() {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-3">
        <svg
          className="w-8 h-8 text-orange-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-100">Solar Heating Calculator</h1>
          <p className="text-sm text-neutral-400">
            Estimate how hot objects get under light exposure
          </p>
        </div>
      </div>
    </header>
  );
}
