import { auth } from '@clerk/nextjs/server';
import { BusinessError } from '@/server/services/business';
import {
  createService,
  listServices,
  updateService,
} from '@/server/services/service';

export async function handleService(request?: Request, id?: string) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    if (!request) return Response.json(await listServices(userId));
    let input: unknown;
    try {
      input = await request.json();
    } catch {
      throw new BusinessError(400, 'Invalid JSON');
    }
    const service =
      id === undefined
        ? await createService(userId, input)
        : await updateService(userId, id, input);
    return Response.json(service, { status: id === undefined ? 201 : 200 });
  } catch (error) {
    if (error instanceof BusinessError)
      return Response.json({ error: error.message }, { status: error.status });
    console.error('Service request failed', error);
    return Response.json(
      { error: 'Unable to process service request' },
      { status: 500 },
    );
  }
}
