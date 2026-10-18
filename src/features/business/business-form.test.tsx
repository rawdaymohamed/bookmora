import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { BusinessForm } from './business-form';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('onboards an owner and switches to editing after success', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal('fetch', fetchMock);
  render(<BusinessForm business={null} />);
  fireEvent.change(screen.getByLabelText('Business name'), {
    target: { value: 'Studio' },
  });
  fireEvent.change(screen.getByLabelText('Business slug'), {
    target: { value: 'studio' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create business' }));
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(
      'Business saved successfully.',
    ),
  );
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/owner/business',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        name: 'Studio',
        slug: 'studio',
        timezone: 'Africa/Cairo',
      }),
    }),
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() =>
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/owner/business',
      expect.objectContaining({ method: 'PATCH' }),
    ),
  );
});

it('shows a conflict without completing onboarding', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Slug is taken' }),
    }),
  );
  render(<BusinessForm business={null} />);
  fireEvent.submit(
    screen.getByRole('button', { name: 'Create business' }).closest('form')!,
  );
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('Slug is taken'),
  );
  expect(screen.getByRole('button', { name: 'Create business' })).toBeEnabled();
});
