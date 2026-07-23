import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="text-7xl font-bold tracking-tight text-foreground">404</h1>
      <h2 className="mt-4 text-xl font-medium text-foreground">Page Not Found</h2>
      <p className="mt-2 text-sm text-muted max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center justify-center h-10 px-5 bg-foreground text-background font-medium text-sm rounded transition-colors hover:bg-hover"
      >
        Return Home
      </Link>
    </main>
  );
}
