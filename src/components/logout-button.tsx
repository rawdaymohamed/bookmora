'use client';

import { useAuth } from '@clerk/nextjs';
import { useId, useState } from 'react';

export function LogoutButton() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const errorId = useId();

  if (!isLoaded || !isSignedIn) return null;

  async function logout() {
    setPending(true);
    setError('');
    try {
      await signOut({ redirectUrl: '/' });
    } catch {
      setError('Unable to log out. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex max-w-64 flex-col items-end gap-2">
      <button
        type="button"
        className="btn-secondary"
        onClick={logout}
        disabled={pending}
        aria-busy={pending}
        aria-describedby={error ? errorId : undefined}
      >
        {pending ? 'Logging out…' : 'Log out'}
      </button>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}
