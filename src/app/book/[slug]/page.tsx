import { Suspense } from 'react';
import { BookingContent } from '@/features/public-booking/booking-content';
export const metadata = { title: 'Explore services' };
export default function Page(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="page-width py-16" role="status">
          Loading business services…
        </main>
      }
    >
      <BookingContent {...props} />
    </Suspense>
  );
}
