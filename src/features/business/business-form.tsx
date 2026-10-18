'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
type Business = { name: string; slug: string; timezone: string };
export function BusinessForm({ business }: { business: Business | null }) {
  const [exists, setExists] = useState(!!business);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const [slug, setSlug] = useState(business?.slug ?? '');
  const [savedSlug, setSavedSlug] = useState(business?.slug ?? '');
  const [timezones] = useState(() => {
    const zones = Intl.supportedValuesOf('timeZone');
    return Array.from(
      new Set([
        'UTC',
        'Africa/Cairo',
        ...(business ? [business.timezone] : []),
        ...zones,
      ]),
    ).sort();
  });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setPending(true);
    setMessage('');
    setFailed(false);
    try {
      const response = await fetch('/api/owner/business', {
        method: exists ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? 'Unable to save business');
        return;
      }
      setExists(true);
      setSavedSlug(String(data.slug));
      setMessage('Business saved successfully.');
    } catch {
      setFailed(true);
      setMessage('Unable to connect. Please try again.');
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-6" aria-busy={pending}>
      <div>
        <h2 className="text-xl font-semibold">Business details</h2>
        <p className="field-help">These details appear on your public page.</p>
      </div>
      <fieldset disabled={pending} className="min-w-0 space-y-6">
        <div>
          <label htmlFor="business-name" className="field-label">
            Business name
          </label>
          <input
            id="business-name"
            className="field-input"
            name="name"
            required
            maxLength={120}
            defaultValue={business?.name}
            placeholder="e.g. Studio Sunday"
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="business-slug" className="field-label">
            Business slug
          </label>
          <input
            id="business-slug"
            className="field-input"
            name="slug"
            required
            maxLength={63}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            aria-describedby="slug-help slug-preview"
            placeholder="e.g. studio-sunday"
            autoCapitalize="none"
            spellCheck={false}
          />
          <p id="slug-help" className="field-help">
            Use lowercase letters, numbers and single hyphens.
          </p>
          <p
            id="slug-preview"
            className="mt-2 rounded-lg bg-stone-50 p-3 text-sm break-all text-teal-800"
          >
            Your page: /book/{slug || 'your-business'}
          </p>
        </div>
        <div>
          <label htmlFor="business-timezone" className="field-label">
            Timezone
          </label>
          <select
            id="business-timezone"
            name="timezone"
            className="field-input"
            required
            defaultValue={business?.timezone ?? 'Africa/Cairo'}
            aria-describedby="timezone-help"
          >
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <p id="timezone-help" className="field-help">
            Choose the timezone where your business operates.
          </p>
        </div>
      </fieldset>
      <p
        role="status"
        aria-live="polite"
        className={
          message ? (failed ? 'status-error' : 'status-success') : 'sr-only'
        }
      >
        {message}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : exists ? 'Save changes' : 'Create business'}
        </button>
        {exists && (
          <Link href="/owner/services" className="btn-secondary">
            Continue to services →
          </Link>
        )}
      </div>
      {savedSlug && (
        <Link
          href={`/book/${savedSlug}`}
          className="inline-block text-sm font-medium text-teal-700 underline underline-offset-4"
        >
          View your public page ↗
        </Link>
      )}
    </form>
  );
}
