import { Prisma } from '@/generated/prisma/client';
import { getDb } from '@/server/db';

export class BusinessError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type BusinessInput = { name: string; slug: string; timezone: string };

export function validateBusiness(
  input: unknown,
  partial = false,
): Partial<BusinessInput> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BusinessError(400, 'Expected a JSON object');
  }
  const body = input as Record<string, unknown>;
  const allowed = ['name', 'slug', 'timezone'];
  if (Object.keys(body).some((key) => !allowed.includes(key))) {
    throw new BusinessError(
      400,
      'Only name, slug and timezone may be supplied',
    );
  }
  if (!Object.keys(body).length)
    throw new BusinessError(400, 'Supply at least one field');
  const result: Partial<BusinessInput> = {};
  for (const field of allowed as (keyof BusinessInput)[]) {
    if (partial && !(field in body)) continue;
    if (typeof body[field] !== 'string' || !body[field].trim()) {
      throw new BusinessError(400, `${field} is required`);
    }
    result[field] = body[field].trim();
  }
  if (result.name && result.name.length > 120)
    throw new BusinessError(400, 'Name must be at most 120 characters');
  if (
    result.slug &&
    (result.slug.length > 63 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(result.slug))
  ) {
    throw new BusinessError(
      400,
      'Slug must be at most 63 lowercase letters, numbers or single hyphens',
    );
  }
  if (result.timezone) {
    try {
      if (/^[+-]/.test(result.timezone)) throw new Error();
      result.timezone = new Intl.DateTimeFormat('en', {
        timeZone: result.timezone,
      }).resolvedOptions().timeZone;
    } catch {
      throw new BusinessError(400, 'Invalid IANA timezone');
    }
  }
  return result;
}

export async function getBusiness(ownerClerkUserId: string) {
  return getDb().business.findUnique({ where: { ownerClerkUserId } });
}

export async function saveBusiness(
  ownerClerkUserId: string,
  input: unknown,
  update = false,
) {
  const data = validateBusiness(input, update);
  try {
    if (update)
      return await getDb().business.update({
        where: { ownerClerkUserId },
        data,
      });
    return await getDb().business.create({
      data: { ...(data as BusinessInput), ownerClerkUserId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002')
        throw new BusinessError(
          409,
          'Slug is taken or owner already has a business',
        );
      if (error.code === 'P2025')
        throw new BusinessError(404, 'Business not found');
    }
    throw error;
  }
}
