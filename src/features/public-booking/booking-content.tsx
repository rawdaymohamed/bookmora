import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getPublicBusiness } from '@/server/services/service';
import { PublicBusinessPage } from './business-page';
export async function BookingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) notFound();
  return <PublicBusinessPage business={business} />;
}
