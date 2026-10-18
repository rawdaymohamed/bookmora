'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

type Service = {
  id: string;
  name: string;
  durationMinutes: number;
  isActive: boolean;
};
export function ServiceManager({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const [services, setServices] = useState(initialServices);
  const [editing, setEditing] = useState<Service | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!editing) return;
    formRef.current?.scrollIntoView?.({ block: 'start' });
    nameRef.current?.focus({ preventScroll: true });
  }, [editing]);
  async function save(data: Partial<Omit<Service, 'id'>>, id?: string) {
    setPending(true);
    setMessage('');
    setFailed(false);
    try {
      const response = await fetch(
        id ? `/api/owner/services/${id}` : '/api/owner/services',
        {
          method: id ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setFailed(true);
        setMessage(result.error ?? 'Unable to save service');
        return false;
      }
      setServices((current) =>
        id
          ? current.map((service) => (service.id === id ? result : service))
          : [...current, result],
      );
      setMessage('Service saved successfully.');
      return true;
    } catch {
      setFailed(true);
      setMessage('Unable to connect. Please try again.');
      return false;
    } finally {
      setPending(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (
      await save(
        {
          name: String(data.get('name')),
          durationMinutes: Number(data.get('durationMinutes')),
        },
        editing?.id,
      )
    ) {
      setEditing(null);
      form.reset();
    }
  }
  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        id="service-form"
        key={editing?.id ?? 'new'}
        onSubmit={submit}
        className="panel space-y-5"
        aria-busy={pending}
      >
        <h2 className="text-xl font-semibold">
          {editing ? 'Edit service' : 'Create service'}
        </h2>
        <label className="field-label">
          Service name
          <input
            ref={nameRef}
            id="service-name"
            name="name"
            required
            maxLength={120}
            defaultValue={editing?.name}
            className="field-input"
            disabled={pending}
          />
        </label>
        <label className="field-label">
          Duration (minutes)
          <input
            name="durationMinutes"
            type="number"
            min={1}
            max={2147483647}
            step={1}
            required
            defaultValue={editing?.durationMinutes ?? 30}
            className="field-input"
            disabled={pending}
          />
        </label>
        <button disabled={pending} className="btn-primary">
          {pending ? 'Saving…' : editing ? 'Save changes' : 'Create service'}
        </button>
        {editing && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setEditing(null)}
            className="btn-secondary ml-3"
          >
            Cancel
          </button>
        )}
      </form>
      <p
        role="status"
        aria-live="polite"
        className={
          message ? (failed ? 'status-error' : 'status-success') : 'sr-only'
        }
      >
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Service catalog</h2>
        <p className="text-sm text-stone-500">
          {services.filter((service) => service.isActive).length} active ·{' '}
          {services.length} total
        </p>
      </div>
      {!services.length && (
        <p className="panel text-center text-stone-600">
          No services yet. Create your first service above.
        </p>
      )}
      <ul className="space-y-4">
        {services.map((service) => (
          <li key={service.id} className="panel min-w-0 space-y-4">
            <h3 className="text-lg font-semibold [overflow-wrap:anywhere]">
              {service.name}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-stone-600">
                ◷ {service.durationMinutes} minutes
              </p>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${service.isActive ? 'bg-teal-100 text-teal-900' : 'bg-stone-100 text-stone-600'}`}
              >
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-stone-500">
              {service.isActive
                ? 'Visible on your public page.'
                : 'Hidden from your public page. You can reactivate it anytime.'}
            </p>
            <button
              disabled={pending}
              onClick={() => setEditing(service)}
              className="btn-secondary mr-3"
              aria-label={`Edit ${service.name}`}
            >
              Edit
            </button>
            <button
              disabled={pending}
              onClick={() => save({ isActive: !service.isActive }, service.id)}
              className="btn-secondary"
              aria-label={`${service.isActive ? 'Deactivate' : 'Reactivate'} ${service.name}`}
            >
              {service.isActive ? 'Deactivate' : 'Reactivate'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
