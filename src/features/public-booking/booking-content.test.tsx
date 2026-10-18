import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { getPublicBusiness, notFound } = vi.hoisted(() => ({
  getPublicBusiness: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));
vi.mock('@/server/services/service', () => ({ getPublicBusiness }));
vi.mock('next/server', () => ({ connection: vi.fn() }));
vi.mock('next/navigation', () => ({ notFound }));
import { BookingContent } from './booking-content';
import NotFound from '@/app/book/[slug]/not-found';
beforeEach(() => vi.clearAllMocks());
afterEach(cleanup);
it('server-renders the business name, timezone, active services and durations without login controls', async () => {
  getPublicBusiness.mockResolvedValue({
    name: 'Studio Sunday',
    timezone: 'Africa/Cairo',
    services: [{ id: 's1', name: 'Consultation', durationMinutes: 30 }],
  });
  render(
    await BookingContent({
      params: Promise.resolve({ slug: 'studio-sunday' }),
    }),
  );
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'Studio Sunday',
  );
  expect(screen.getByText('Africa/Cairo')).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: 'Consultation' }),
  ).toBeInTheDocument();
  expect(screen.getByText('30 minutes')).toBeInTheDocument();
  expect(
    screen.queryByRole('link', { name: /sign in/i }),
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
it('uses Next.js notFound for unknown slugs', async () => {
  getPublicBusiness.mockResolvedValue(null);
  await expect(
    BookingContent({ params: Promise.resolve({ slug: 'missing' }) }),
  ).rejects.toThrow('NOT_FOUND');
  expect(notFound).toHaveBeenCalled();
});
it('provides a helpful not-found message and way home', () => {
  render(<NotFound />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    'We couldn’t find that business.',
  );
  expect(
    screen.getByRole('link', { name: 'Back to Bookmora' }),
  ).toHaveAttribute('href', '/');
});
it('explains when there are no active services', async () => {
  getPublicBusiness.mockResolvedValue({
    name: 'Studio',
    timezone: 'UTC',
    services: [],
  });
  render(await BookingContent({ params: Promise.resolve({ slug: 'studio' }) }));
  expect(
    screen.getByText(
      'There are no services available right now. Please check back soon.',
    ),
  ).toBeInTheDocument();
});
