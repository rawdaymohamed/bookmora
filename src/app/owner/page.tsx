import Link from 'next/link';
import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { getBusiness } from '@/server/services/business';
import { BusinessForm } from '@/features/business/business-form';
export const metadata = { title: 'Business settings' };
async function OwnerContent() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const business = await getBusiness(userId);
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow">Your workspace</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {business ? 'Business settings' : 'Let’s make it yours.'}
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-stone-600">
          {business
            ? 'Keep your business details up to date, so customers know where to find you.'
            : 'Start with the essentials. Next, you’ll add the services your customers can explore.'}
        </p>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="panel">
          <BusinessForm
            business={
              business
                ? {
                    name: business.name,
                    slug: business.slug,
                    timezone: business.timezone,
                  }
                : null
            }
          />
        </section>
        <aside className="rounded-2xl bg-teal-950 p-6 text-white">
          <p className="text-xs font-semibold tracking-widest text-teal-200 uppercase">
            {business ? 'Your next step' : 'Make a good first impression'}
          </p>
          <h2 className="mt-4 text-xl font-semibold">
            {business
              ? 'Bring your services to life.'
              : 'A little detail goes a long way.'}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-teal-100">
            {business
              ? 'Add your services and durations, then share your page with customers.'
              : 'Choose a name customers recognize and a short, memorable page address.'}
          </p>
          {business && (
            <div className="mt-6 flex flex-col gap-4">
              <Link href="/owner/services" className="btn-secondary">
                Manage services →
              </Link>
              <Link
                href={`/book/${business.slug}`}
                className="text-sm font-medium underline underline-offset-4"
              >
                View public page ↗
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
export default function OwnerPage() {
  return (
    <Suspense fallback={<p role="status">Loading your business…</p>}>
      <OwnerContent />
    </Suspense>
  );
}
