'use client';

import { useState, type FormEvent } from 'react';

type Business = { name: string; slug: string; timezone: string };
export function BusinessForm({ business }: { business: Business | null }) {
  const [exists, setExists] = useState(!!business);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setMessage('');
    try {
      const response = await fetch('/api/owner/business', {
        method: exists ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setMessage(result.error ?? 'Unable to save business');
        return;
      }
      setExists(true);
      setMessage('Business saved successfully.');
    } catch {
      setMessage('Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block">
        Business name
        <input
          className="mt-1 block w-full rounded border p-2"
          name="name"
          required
          maxLength={120}
          defaultValue={business?.name}
        />
      </label>
      <label className="block">
        Business slug
        <input
          className="mt-1 block w-full rounded border p-2"
          name="slug"
          required
          maxLength={63}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={business?.slug}
          aria-describedby="slug-help"
        />
      </label>
      <p id="slug-help" className="text-sm">
        Use lowercase letters, numbers and single hyphens.
      </p>
      <label className="block">
        Timezone
        <input
          className="mt-1 block w-full rounded border p-2"
          name="timezone"
          required
          defaultValue={business?.timezone ?? 'Africa/Cairo'}
          placeholder="Africa/Cairo"
        />
      </label>
      <button
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
        disabled={pending}
      >
        {pending ? 'Saving…' : exists ? 'Save changes' : 'Create business'}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
