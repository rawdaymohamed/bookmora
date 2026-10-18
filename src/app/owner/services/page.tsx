import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { getBusiness } from '@/server/services/business';
import { listServices } from '@/server/services/service';
import { ServiceManager } from '@/features/services/service-manager';
export const metadata = { title: 'Your services' };
async function Content() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const business = await getBusiness(userId);
  if (!business)
    return (
      <section className="panel">
        <p className="eyebrow">First things first</p>
        <h1 className="mt-3 text-3xl font-semibold">
          Give your business a home.
        </h1>
        <p className="mt-3 text-stone-600">
          Register your business before adding your first service.
        </p>
        <Link className="btn-primary mt-6" href="/owner">
          Register your business
        </Link>
      </section>
    );
  const services = await listServices(userId);
  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">What you do best</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Your services
          </h1>
          <p className="mt-3 max-w-lg text-stone-600">
            Help customers find the right fit. Add your services and keep the
            details fresh.
          </p>
        </div>
        <Link className="btn-secondary" href={`/book/${business.slug}`}>
          View public page ↗
        </Link>
      </div>
      <ServiceManager
        initialServices={services.map(
          ({ id, name, durationMinutes, isActive }) => ({
            id,
            name,
            durationMinutes,
            isActive,
          }),
        )}
      />
    </>
  );
}
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Loading services…</p>}>
      <Content />
    </Suspense>
  );
}
