import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const { useAuth, signOut } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('@clerk/nextjs', () => ({ useAuth }));
import { LogoutButton } from './logout-button';

beforeEach(() => {
  vi.resetAllMocks();
  useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, signOut });
});
afterEach(cleanup);

it('signs out through Clerk and requests a redirect to the homepage', async () => {
  signOut.mockResolvedValue(undefined);
  render(<LogoutButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  await waitFor(() =>
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' }),
  );
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Log out' })).toBeEnabled(),
  );
});

it('disables the button and displays progress while signing out', async () => {
  let finish!: () => void;
  signOut.mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  render(<LogoutButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  const button = screen.getByRole('button', { name: 'Logging out…' });
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-busy', 'true');
  fireEvent.click(button);
  expect(signOut).toHaveBeenCalledTimes(1);
  await act(async () => finish());
});

it('shows an error and allows retry when sign-out fails', async () => {
  signOut
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce(undefined);
  render(<LogoutButton />);
  fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to log out. Please try again.',
  );
  const button = screen.getByRole('button', { name: 'Log out' });
  expect(button).toBeEnabled();
  expect(button).toHaveAccessibleDescription(
    'Unable to log out. Please try again.',
  );
  fireEvent.click(button);
  await waitFor(() => expect(signOut).toHaveBeenCalledTimes(2));
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
});

it.each([
  { isLoaded: false, isSignedIn: undefined },
  { isLoaded: true, isSignedIn: false },
])('hides logout when auth is unavailable or signed out: %j', (state) => {
  useAuth.mockReturnValue({ ...state, signOut });
  render(<LogoutButton />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
