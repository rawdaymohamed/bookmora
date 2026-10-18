// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { auth, db } = vi.hoisted(() => ({
  auth: vi.fn(),
  db: {
    business: { findUnique: vi.fn() },
    service: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));
vi.mock('@clerk/nextjs/server', () => ({ auth }));
vi.mock('@/server/db', () => ({ getDb: () => db }));
import { Prisma } from '@/generated/prisma/client';
import { GET, POST } from './route';
import { PATCH } from './[id]/route';
import { getPublicBusiness } from '@/server/services/service';
const input = { name: 'Consultation', durationMinutes: 30 };
const request = (body: unknown) =>
  new Request('http://localhost/api/owner/services', {
    method: 'POST',
    body: JSON.stringify(body),
  });
const patch = (body: unknown) =>
  PATCH(request(body), { params: Promise.resolve({ id: 'service-a' }) });
beforeEach(() => {
  vi.resetAllMocks();
  auth.mockResolvedValue({ userId: 'owner-a' });
  db.business.findUnique.mockResolvedValue({ id: 'business-a' });
});
describe('service management', () => {
  it.each(['GET', 'POST', 'PATCH'])('rejects anonymous %s', async (method) => {
    auth.mockResolvedValue({ userId: null });
    const response =
      method === 'GET'
        ? await GET()
        : method === 'POST'
          ? await POST(request(input))
          : await patch(input);
    expect(response.status).toBe(401);
    expect(db.business.findUnique).not.toHaveBeenCalled();
    expect(db.service.update).not.toHaveBeenCalled();
    expect(db.service.create).not.toHaveBeenCalled();
    expect(db.service.findMany).not.toHaveBeenCalled();
  });
  it('creates an active service for the signed-in owner business', async () => {
    db.service.create.mockResolvedValue({
      id: 'service-a',
      ...input,
      isActive: true,
    });
    const response = await POST(request(input));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject(input);
    expect(db.business.findUnique).toHaveBeenCalledWith({
      where: { ownerClerkUserId: 'owner-a' },
      select: { id: true },
    });
    expect(db.service.create).toHaveBeenCalledWith({
      data: { ...input, businessId: 'business-a', isActive: true },
    });
  });
  it('lists all services including inactive ones for the owner only', async () => {
    db.service.findMany.mockResolvedValue([
      { id: 'service-a', isActive: false },
    ]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([
      { id: 'service-a', isActive: false },
    ]);
    expect(db.service.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { businessId: 'business-a' } }),
    );
  });
  it.each([0, -1, 1.5, '30', null, 2147483648])(
    'rejects invalid duration %j on create and edit',
    async (durationMinutes) => {
      expect((await POST(request({ ...input, durationMinutes }))).status).toBe(
        400,
      );
      expect((await patch({ durationMinutes })).status).toBe(400);
      expect(db.service.create).not.toHaveBeenCalled();
      expect(db.service.update).not.toHaveBeenCalled();
    },
  );
  it.each([
    {},
    [],
    null,
    { name: ' ' },
    { ...input, businessId: 'other-business' },
    { ...input, isActive: 'false' },
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
  it('requires business onboarding before listing or creating', async () => {
    db.business.findUnique.mockResolvedValue(null);
    expect((await GET()).status).toBe(404);
    expect((await POST(request(input))).status).toBe(404);
    expect(db.service.create).not.toHaveBeenCalled();
  });
  it('edits a service with an owner-scoped atomic query', async () => {
    db.service.update.mockResolvedValue({
      id: 'service-a',
      ...input,
      durationMinutes: 60,
    });
    const response = await patch({ durationMinutes: 60 });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ durationMinutes: 60 });
    expect(db.service.update).toHaveBeenCalledWith({
      where: { id: 'service-a', business: { ownerClerkUserId: 'owner-a' } },
      data: { durationMinutes: 60 },
    });
  });
  it('rejects editing another owner service', async () => {
    auth.mockResolvedValue({ userId: 'owner-b' });
    db.service.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Missing', {
        code: 'P2025',
        clientVersion: '7',
      }),
    );
    expect((await patch({ name: 'Stolen' })).status).toBe(404);
    expect(db.service.update).toHaveBeenCalledWith({
      where: { id: 'service-a', business: { ownerClerkUserId: 'owner-b' } },
      data: { name: 'Stolen' },
    });
  });
  it('deactivates in place without deleting the service row', async () => {
    db.service.update.mockResolvedValue({
      id: 'service-a',
      ...input,
      isActive: false,
    });
    expect((await patch({ isActive: false })).status).toBe(200);
    expect(db.service.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
    expect(db.service.delete).not.toHaveBeenCalled();
  });
  it('public query selects only active services and excludes owner information', async () => {
    await getPublicBusiness('studio');
    expect(db.business.findUnique).toHaveBeenCalledWith({
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
  it.todo(
    'deactivation preserves historical bookings (booking model not implemented yet)',
  );
});
