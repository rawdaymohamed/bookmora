import Link from 'next/link';
import { Brand } from '@/components/brand';
export default function NotFound() {
  return (
    <>
      <header className="page-width py-6">
        <Brand />
      </header>
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-5 py-16 text-center"
      >
        <p className="eyebrow">Page not found</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          We couldn’t find that business.
        </h1>
        <p className="mt-4 leading-relaxed text-stone-600">
          The address may have changed, or the link may be incorrect. Check the
          link with the business and try again.
        </p>
        <Link href="/" className="btn-primary mt-8 self-center">
          Back to Bookmora
        </Link>
      </main>
    </>
  );
}
