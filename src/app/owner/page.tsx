import { Suspense } from 'react';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import { getBusiness } from '@/server/services/business';
import { BusinessForm } from '@/features/business/business-form';

async function OwnerContent() {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();
  const business = await getBusiness(userId);
  return (
    <main className="mx-auto w-full max-w-xl space-y-6 px-6 py-16">
      <UserButton />
      <h1 className="text-3xl font-bold">
        {business ? 'Your business' : 'Register your business'}
      </h1>
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
    </main>
  );
}

export default function OwnerPage() {
  return (
    <Suspense fallback={<p>Loading your business…</p>}>
      <OwnerContent />
    </Suspense>
  );
}
