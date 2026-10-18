import { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';
export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<p>Loading…</p>}>
        <SignIn />
      </Suspense>
    </main>
  );
}
