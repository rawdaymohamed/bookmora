import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ServiceManager } from './service-manager';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const service = {
  id: 'service-a',
  name: 'Consultation',
  durationMinutes: 30,
  isActive: true,
};
it('creates a service and displays it in the list', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => service });
  vi.stubGlobal('fetch', fetchMock);
  render(<ServiceManager initialServices={[]} />);
  fireEvent.change(screen.getByLabelText('Service name'), {
    target: { value: 'Consultation' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Create service' }));
  await screen.findByRole('heading', { name: 'Consultation' });
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/owner/services',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ name: 'Consultation', durationMinutes: 30 }),
    }),
  );
});
it('edits an existing service', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ...service, name: 'Follow-up' }),
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<ServiceManager initialServices={[service]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Edit Consultation' }));
  expect(screen.getByLabelText('Service name')).toHaveValue('Consultation');
  expect(screen.getByLabelText('Service name')).toHaveFocus();
  fireEvent.change(screen.getByLabelText('Service name'), {
    target: { value: 'Follow-up' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await screen.findByRole('heading', { name: 'Follow-up' });
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/owner/services/service-a',
    expect.objectContaining({ method: 'PATCH' }),
  );
});
it('deactivates without removing the service from the owner list', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ...service, isActive: false }),
  });
  vi.stubGlobal('fetch', fetchMock);
  render(<ServiceManager initialServices={[service]} />);
  fireEvent.click(
    screen.getByRole('button', { name: 'Deactivate Consultation' }),
  );
  await screen.findByRole('button', { name: 'Reactivate Consultation' });
  expect(
    screen.getByRole('heading', { name: 'Consultation' }),
  ).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/owner/services/service-a',
    expect.objectContaining({ body: JSON.stringify({ isActive: false }) }),
  );
});
it('shows server errors without adding a service', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid duration' }),
    }),
  );
  render(<ServiceManager initialServices={[]} />);
  fireEvent.submit(
    screen.getByRole('button', { name: 'Create service' }).closest('form')!,
  );
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent('Invalid duration'),
  );
  expect(
    screen.getByText('No services yet. Create your first service above.'),
  ).toBeInTheDocument();
});
