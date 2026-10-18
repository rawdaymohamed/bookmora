import { Brand } from '@/components/brand';
export type PublicBusiness = {
  name: string;
  timezone: string;
  services: { id: string; name: string; durationMinutes: number }[];
};
export function PublicBusinessPage({ business }: { business: PublicBusiness }) {
  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="page-width flex min-h-20 items-center justify-between gap-4">
          <Brand />
          <span className="text-xs text-stone-500 sm:text-sm">
            Discover a little more.
          </span>
        </div>
      </header>
      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16"
      >
        <section className="mb-10">
          <div
            aria-hidden="true"
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100 text-2xl font-semibold text-teal-800"
          >
            {business.name.slice(0, 1).toUpperCase()}
          </div>
          <p className="eyebrow">Welcome to</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight [overflow-wrap:anywhere] sm:text-5xl">
            {business.name}
          </h1>
          <p className="mt-4 text-sm [overflow-wrap:anywhere] text-stone-600">
            Business timezone:{' '}
            <span className="font-medium text-teal-950">
              {business.timezone}
            </span>
          </p>
        </section>
        <section aria-labelledby="services-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 id="services-heading" className="text-2xl font-semibold">
              Our services
            </h2>
            <span className="shrink-0 rounded-full bg-teal-100 px-3 py-1 text-xs font-medium text-teal-900">
              {business.services.length} available
            </span>
          </div>
          {business.services.length ? (
            <ul className="space-y-4">
              {business.services.map((service) => (
                <li
                  key={service.id}
                  className="panel flex min-w-0 flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
                >
                  <h3 className="w-full min-w-0 text-lg font-semibold [overflow-wrap:anywhere]">
                    {service.name}
                  </h3>
                  <p className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">
                    <span aria-hidden="true">◷</span>
                    {service.durationMinutes} minutes
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="panel text-center">
              <h3 className="text-lg font-semibold">
                Something good is on the way.
              </h3>
              <p className="mt-2 text-stone-600">
                There are no services available right now. Please check back
                soon.
              </p>
            </div>
          )}
        </section>
      </main>
      <footer className="mt-auto px-5 py-8 text-center text-sm text-stone-500">
        Powered by <span className="font-semibold text-teal-800">Bookmora</span>
      </footer>
    </>
  );
}
