import { Prisma } from '@/generated/prisma/client';
import { getDb } from '@/server/db';
import { BusinessError } from './business';

type ServiceInput = {
  name: string;
  durationMinutes: number;
  isActive: boolean;
};
export function validateService(
  input: unknown,
  partial = false,
): Partial<ServiceInput> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BusinessError(400, 'Expected a JSON object');
  const body = input as Record<string, unknown>;
  if (
    !Object.keys(body).length ||
    Object.keys(body).some(
      (key) => !['name', 'durationMinutes', 'isActive'].includes(key),
    )
  )
    throw new BusinessError(
      400,
      'Supply only name, durationMinutes and isActive',
    );
  const result: Partial<ServiceInput> = {};
  if (!partial || 'name' in body) {
    if (
      typeof body.name !== 'string' ||
      !body.name.trim() ||
      body.name.trim().length > 120
    )
      throw new BusinessError(400, 'Name must contain 1 to 120 characters');
    result.name = body.name.trim();
  }
  if (!partial || 'durationMinutes' in body) {
    if (
      typeof body.durationMinutes !== 'number' ||
      !Number.isInteger(body.durationMinutes) ||
      body.durationMinutes <= 0 ||
      body.durationMinutes > 2147483647
    )
      throw new BusinessError(
        400,
        'Duration must be a positive whole number of minutes',
      );
    result.durationMinutes = body.durationMinutes;
  }
  if ('isActive' in body) {
    if (typeof body.isActive !== 'boolean')
      throw new BusinessError(400, 'isActive must be a boolean');
    result.isActive = body.isActive;
  }
  return result;
}

async function requireBusiness(ownerClerkUserId: string) {
  const business = await getDb().business.findUnique({
    where: { ownerClerkUserId },
    select: { id: true },
  });
  if (!business) throw new BusinessError(404, 'Register your business first');
  return business;
}

export async function listServices(ownerClerkUserId: string) {
  const business = await requireBusiness(ownerClerkUserId);
  return getDb().service.findMany({
    where: { businessId: business.id },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
}

export async function createService(ownerClerkUserId: string, input: unknown) {
  const data = validateService(input);
  const business = await requireBusiness(ownerClerkUserId);
  return getDb().service.create({
    data: {
      name: data.name!,
      durationMinutes: data.durationMinutes!,
      isActive: data.isActive ?? true,
      businessId: business.id,
    },
  });
}

export async function updateService(
  ownerClerkUserId: string,
  id: string,
  input: unknown,
) {
  const data = validateService(input, true);
  try {
    return await getDb().service.update({
      where: { id, business: { ownerClerkUserId } },
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
      throw new BusinessError(404, 'Service not found');
    throw error;
  }
}

export async function getPublicBusiness(slug: string) {
  if (slug.length > 63 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return getDb().business.findUnique({
    where: { slug },
    select: {
      name: true,
      timezone: true,
      services: {
        where: { isActive: true },
        select: { id: true, name: true, durationMinutes: true },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      },
    },
  });
}
