import { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
async function Redirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/book/${encodeURIComponent(slug)}`);
  return null;
}
export default function Page(props: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p>Opening business page…</p>}>
      <Redirect {...props} />
    </Suspense>
  );
}
