import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const { useAuth, signOut } = vi.hoisted(() => ({
  useAuth: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock('@clerk/nextjs', () => ({ useAuth }));
import Home from './page';

beforeEach(() => {
  vi.resetAllMocks();
  useAuth.mockReturnValue({ isLoaded: true, isSignedIn: false, signOut });
});
afterEach(cleanup);

describe('Homepage', () => {
  it('renders the application heading', () => {
    render(<Home />);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Your business.*Ready to be discovered/i,
      }),
    ).toBeInTheDocument();
  });

  it('shows sign-in and registration links for signed-out visitors', () => {
    render(<Home />);
    const nav = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    );
    expect(nav.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      '/sign-in',
    );
    expect(nav.getByRole('link', { name: /Get started/ })).toHaveAttribute(
      'href',
      '/sign-up',
    );
    expect(
      nav.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });

  it('shows logout instead of sign-in when signed in, and uses Clerk to sign out', async () => {
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, signOut });
    signOut.mockResolvedValue(undefined);
    render(<Home />);
    const nav = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    );
    expect(nav.getByRole('link', { name: 'My workspace' })).toHaveAttribute(
      'href',
      '/owner',
    );
    expect(
      nav.queryByRole('link', { name: 'Sign in' }),
    ).not.toBeInTheDocument();
    expect(
      nav.queryByRole('link', { name: /Get started/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(nav.getByRole('button', { name: 'Log out' }));
    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' }),
    );
    await waitFor(() =>
      expect(nav.getByRole('button', { name: 'Log out' })).toBeEnabled(),
    );
  });

  it('does not flash sign-in or logout while auth is loading', () => {
    useAuth.mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      signOut,
    });
    render(<Home />);
    const nav = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    );
    expect(nav.getByRole('status')).toHaveTextContent('Checking sign-in…');
    expect(nav.queryByRole('link')).not.toBeInTheDocument();
    expect(nav.queryByRole('button')).not.toBeInTheDocument();
  });

  it('updates navigation when the login state changes', () => {
    const { rerender } = render(<Home />);
    const nav = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    );
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: true, signOut });
    rerender(<Home />);
    expect(nav.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
    useAuth.mockReturnValue({ isLoaded: true, isSignedIn: false, signOut });
    rerender(<Home />);
    expect(nav.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(
      nav.queryByRole('button', { name: 'Log out' }),
    ).not.toBeInTheDocument();
  });
});
