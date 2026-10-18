'use client';

import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { LogoutButton } from './logout-button';

export function HomeAccountNav() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <nav
      aria-label="Main navigation"
      className="flex flex-wrap items-center gap-3"
    >
      {!isLoaded ? (
        <span role="status" className="px-3 py-3 text-sm text-stone-500">
          Checking sign-in…
        </span>
      ) : isSignedIn ? (
        <>
          <Link href="/owner" className="btn-primary">
            My workspace
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/sign-in" className="btn-secondary">
            Sign in
          </Link>
          <Link href="/sign-up" className="btn-primary">
            Get started <span aria-hidden="true">↗</span>
          </Link>
        </>
      )}
    </nav>
  );
}
