// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: { business: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } },
}));
vi.mock('@clerk/nextjs/server', () => ({ auth }));
vi.mock('@/server/db', () => ({ getDb: () => db }));
import { Prisma } from '@/generated/prisma/client';
import { GET, POST, PATCH } from './route';

const input = { name: 'Studio', slug: 'studio', timezone: 'Africa/Cairo' };
const request = (body: unknown) =>
  new Request('http://localhost/api/owner/business', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
const prismaError = (code: string) =>
  new Prisma.PrismaClientKnownRequestError('Conflict', {
    code,
    clientVersion: '7',
  });

beforeEach(() => {
  vi.resetAllMocks();
  auth.mockResolvedValue({ userId: 'owner-a' });
});

describe('owner business API', () => {
  it.each(['GET', 'POST', 'PATCH'])(
    'rejects unauthenticated %s with 401',
    async (method) => {
      auth.mockResolvedValue({ userId: null });
      const response =
        method === 'GET'
          ? await GET()
          : await { POST, PATCH }[method as 'POST' | 'PATCH'](request(input));
      expect(response.status).toBe(401);
      expect(db.business.findUnique).not.toHaveBeenCalled();
      expect(db.business.create).not.toHaveBeenCalled();
      expect(db.business.update).not.toHaveBeenCalled();
    },
  );
  it('creates the authenticated owner business', async () => {
    db.business.create.mockResolvedValue({ id: 'business-a', ...input });
    const response = await POST(request(input));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject(input);
    expect(db.business.create).toHaveBeenCalledWith({
      data: { ...input, ownerClerkUserId: 'owner-a' },
    });
  });
  it('reads only the authenticated owner business', async () => {
    db.business.findUnique.mockResolvedValue({ id: 'business-a', ...input });
    expect((await GET()).status).toBe(200);
    expect(db.business.findUnique).toHaveBeenCalledWith({
      where: { ownerClerkUserId: 'owner-a' },
    });
  });
  it('does not expose another owner business', async () => {
    auth.mockResolvedValue({ userId: 'owner-b' });
    db.business.findUnique.mockResolvedValue(null);
    expect((await GET()).status).toBe(404);
    expect(db.business.findUnique).toHaveBeenCalledWith({
      where: { ownerClerkUserId: 'owner-b' },
    });
  });
  it.each(['id', 'ownerClerkUserId'])(
    'rejects cross-owner targeting through %s',
    async (field) => {
      expect(
        (await PATCH(request({ ...input, [field]: 'owner-a' }))).status,
      ).toBe(400);
      expect(db.business.update).not.toHaveBeenCalled();
    },
  );
  it('cannot update another owner business when the caller has none', async () => {
    auth.mockResolvedValue({ userId: 'owner-b' });
    db.business.update.mockRejectedValue(prismaError('P2025'));
    expect((await PATCH(request({ name: 'Changed' }))).status).toBe(404);
    expect(db.business.update).toHaveBeenCalledWith({
      where: { ownerClerkUserId: 'owner-b' },
      data: { name: 'Changed' },
    });
  });
  it('updates only the authenticated owner business', async () => {
    db.business.update.mockResolvedValue({ ...input, name: 'Changed' });
    expect((await PATCH(request({ name: 'Changed' }))).status).toBe(200);
    expect(db.business.update).toHaveBeenCalledWith({
      where: { ownerClerkUserId: 'owner-a' },
      data: { name: 'Changed' },
    });
  });
  it.each(['POST', 'PATCH'] as const)(
    'returns 409 for a uniqueness conflict on %s',
    async (method) => {
      db.business.create.mockRejectedValue(prismaError('P2002'));
      db.business.update.mockRejectedValue(prismaError('P2002'));
      expect((await { POST, PATCH }[method](request(input))).status).toBe(409);
    },
  );
  it.each(['Mars/Olympus', '+02:00', ''])(
    'rejects invalid timezone %s',
    async (timezone) => {
      expect((await POST(request({ ...input, timezone }))).status).toBe(400);
      expect(db.business.create).not.toHaveBeenCalled();
    },
  );
  it.each([
    null,
    [],
    {},
    { ...input, slug: 'Bad Slug' },
    { ...input, name: ' ' },
  ])('rejects invalid input %j', async (body) => {
    expect((await POST(request(body))).status).toBe(400);
  });
  it('rejects malformed JSON', async () => {
    expect(
      (
        await POST(
          new Request('http://localhost', { method: 'POST', body: '{' }),
        )
      ).status,
    ).toBe(400);
  });
});
