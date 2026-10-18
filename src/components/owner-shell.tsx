'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brand } from './brand';
export function OwnerShell({
  children,
  account,
}: {
  children: React.ReactNode;
  account: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="page-width flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-stone-500 sm:inline">
              Your workspace
            </span>
            {account}
          </div>
        </div>
      </header>
      <div className="page-width grid gap-8 py-6 md:grid-cols-[190px_minmax(0,1fr)] md:py-10">
        <nav
          aria-label="Owner navigation"
          className="flex gap-2 self-start md:sticky md:top-6 md:flex-col"
        >
          {[
            ['/owner', 'Business settings'],
            ['/owner/services', 'Services'],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? 'page' : undefined}
              className={`flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium ${pathname === href ? 'bg-teal-100 text-teal-950' : 'text-stone-600 hover:bg-white'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <main id="main-content" className="min-w-0">
          {children}
        </main>
      </div>
    </>
  );
}
