import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6">
      <h1 className="text-4xl font-bold">bookmora</h1>

      <p className="mt-4 text-gray-600">
        Simple appointment scheduling for small businesses.
      </p>
      <nav className="mt-6 flex gap-4">
        <Link href="/sign-up">Create account</Link>
        <Link href="/sign-in">Sign in</Link>
        <Link href="/owner">Manage business</Link>
      </nav>
    </main>
  );
}
