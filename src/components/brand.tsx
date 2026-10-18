import Link from 'next/link';
export function Brand() {
  return (
    <Link
      href="/"
      aria-label="Bookmora home"
      className="inline-flex shrink-0 items-center gap-2.5 text-xl font-bold tracking-tight"
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white"
      >
        b<span className="text-lime-300">.</span>
      </span>
      bookmora<span className="text-teal-600">.</span>
    </Link>
  );
}
