import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';
import { Brand } from '@/components/brand';
export default function Page() {
  return (
    <>
      <header className="page-width py-6">
        <Brand />
      </header>
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8"
      >
        <p className="eyebrow">Welcome back</p>
        <Suspense fallback={<p role="status">Loading…</p>}>
          <SignIn />
        </Suspense>
      </main>
    </>
  );
}
