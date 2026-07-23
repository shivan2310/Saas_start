export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide uppercase text-muted">Loading...</span>
      </div>
    </div>
  );
}
