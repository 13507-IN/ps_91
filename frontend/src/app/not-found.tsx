import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-5xl font-bold text-brand-600">404</h1>
      <h2 className="mt-3 text-xl font-semibold text-slate-900">Page not found</h2>
      <p className="mt-2 text-sm text-slate-500">
        The page you are looking for does not exist or has moved.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Back to Home
      </Link>
    </div>
  );
}