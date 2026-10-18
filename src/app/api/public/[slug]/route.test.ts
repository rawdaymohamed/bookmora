// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('@/server/db', () => ({ getDb: () => ({ business: { findUnique } }) }));
import { GET } from './route';
const get = (slug: string) =>
  GET(new Request(`http://localhost/api/public/${slug}`), {
    params: Promise.resolve({ slug }),
  });
beforeEach(() => vi.resetAllMocks());
it('returns a business to anonymous visitors using only safe public fields', async () => {
  const business = {
    name: 'Studio',
    timezone: 'Africa/Cairo',
    services: [{ id: 'service-a', name: 'Consultation', durationMinutes: 30 }],
  };
  findUnique.mockResolvedValue(business);
  const response = await get('studio');
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(business);
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(findUnique).toHaveBeenCalledWith({
    where: { slug: 'studio' },
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
});
it('returns 404 for an unknown business', async () => {
  findUnique.mockResolvedValue(null);
  const response = await get('missing-business');
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: 'Business not found' });
});
it.each(['', 'UPPER', 'bad slug', '-bad', 'a'.repeat(64)])(
  'returns 404 for invalid slug %s without querying the database',
  async (slug) => {
    expect((await get(slug)).status).toBe(404);
    expect(findUnique).not.toHaveBeenCalled();
  },
);
it('does not leak internal errors', async () => {
  findUnique.mockRejectedValue(new Error('private connection details'));
  const response = await get('studio');
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: 'Unable to load business' });
});
it('returns an empty services array for businesses without active services', async () => {
  findUnique.mockResolvedValue({
    name: 'Studio',
    timezone: 'UTC',
    services: [],
  });
  expect(await (await get('studio')).json()).toMatchObject({ services: [] });
});
