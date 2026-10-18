import { getPublicBusiness } from '@/server/services/service';
export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  try {
    const business = await getPublicBusiness(slug);
    if (!business)
      return Response.json({ error: 'Business not found' }, { status: 404 });
    return Response.json(business, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'Unable to load business' }, { status: 500 });
  }
}
