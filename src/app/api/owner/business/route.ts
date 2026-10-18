import { auth } from '@clerk/nextjs/server';
import {
  BusinessError,
  getBusiness,
  saveBusiness,
} from '@/server/services/business';

async function handle(request?: Request, update = false) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    if (!request) {
      const business = await getBusiness(userId);
      return business
        ? Response.json(business)
        : Response.json({ error: 'Business not found' }, { status: 404 });
    }
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      throw new BusinessError(400, 'Invalid JSON');
    }
    const business = await saveBusiness(userId, input, update);
    return Response.json(business, { status: update ? 200 : 201 });
  } catch (error) {
    if (error instanceof BusinessError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error('Business request failed', error);
    return Response.json(
      { error: 'Unable to process business request' },
      { status: 500 },
    );
  }
}

export function GET() {
  return handle();
}
export function POST(request: Request) {
  return handle(request);
}
export function PATCH(request: Request) {
  return handle(request, true);
}
