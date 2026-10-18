import { Suspense } from 'react';
import { UserButton } from '@clerk/nextjs';
import { LogoutButton } from '@/components/logout-button';
import { OwnerShell } from '@/components/owner-shell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <p className="page-width py-12" role="status">
          Loading your workspace…
        </p>
      }
    >
      <OwnerShell
        account={
          <>
            <UserButton />
            <LogoutButton />
          </>
        }
      >
        {children}
      </OwnerShell>
    </Suspense>
  );
}
