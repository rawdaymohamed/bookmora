import Link from 'next/link';
import { Brand } from '@/components/brand';
import { HomeAccountNav } from '@/components/home-account-nav';
export default function Home() {
  return (
    <>
      <header className="page-width flex min-h-24 flex-wrap items-center justify-between gap-4 py-4">
        <Brand />
        <HomeAccountNav />
      </header>
      <main id="main-content">
        <section className="page-width grid items-center gap-12 py-12 md:grid-cols-2 md:py-24">
          <div>
            <p className="eyebrow mb-6">
              A little less admin. More of what you love.
            </p>
            <h1 className="max-w-xl text-5xl leading-[1.08] font-semibold tracking-tight sm:text-6xl">
              Your business.
              <br />
              Ready to be <span className="text-teal-700">discovered.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-600">
              Give your services a home. Set up your business, share what you
              offer, and help customers find the right service for them.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/sign-up" className="btn-primary">
                Create your business <span aria-hidden="true">→</span>
              </Link>
              <Link href="/owner" className="btn-secondary">
                Open workspace
              </Link>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              Made for independent professionals and small businesses.
            </p>
          </div>
          <div className="relative rounded-[2rem] bg-[#e3ede6] p-5 sm:p-10">
            <p className="eyebrow mb-5">Your services, beautifully simple</p>
            <div className="rounded-2xl border border-white bg-white p-6 shadow-xl shadow-teal-950/5 sm:p-8">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl text-orange-900"
                >
                  S
                </span>
                <div>
                  <p className="text-lg font-semibold">Studio Sunday</p>
                  <p className="text-sm text-stone-500">
                    Example business page
                  </p>
                </div>
              </div>
              <div className="mt-8 border-t border-stone-100 pt-6">
                <p className="text-sm font-medium text-stone-500">
                  Explore our services
                </p>
                {[
                  ['First consultation', '30 minutes'],
                  ['Personal session', '60 minutes'],
                ].map(([name, duration]) => (
                  <div
                    key={name}
                    className="mt-4 rounded-xl border border-stone-200 p-4"
                  >
                    <p className="font-semibold">{name}</p>
                    <p className="mt-1 text-sm text-stone-500">◷ {duration}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-stone-500">
                A preview of what your customers could see.
              </p>
            </div>
          </div>
        </section>
        <section className="border-y border-stone-200 bg-white py-12">
          <div className="page-width">
            <p className="eyebrow">Start simple</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              A home for your business in three steps.
            </h2>
            <ol className="mt-8 grid gap-8 md:grid-cols-3">
              {[
                [
                  'Make it yours',
                  'Add your business name, unique page address, and timezone.',
                ],
                [
                  'Share your services',
                  'Tell customers what you offer and how long each service takes.',
                ],
                [
                  'Put it out there',
                  'Share your public page. Customers can explore without an account.',
                ],
              ].map(([title, description], index) => (
                <li key={title}>
                  <span className="text-sm font-semibold text-teal-600">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-stone-600">
                    {description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <footer className="page-width flex flex-wrap items-center justify-between gap-4 py-8 text-sm text-stone-500">
        <span>© Bookmora</span>
        <span>Make room for what you do best.</span>
      </footer>
    </>
  );
}
