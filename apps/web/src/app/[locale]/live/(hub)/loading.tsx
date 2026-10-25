/** Skeleton while live status and videos load */
export default function LiveLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="bg-wydad-charcoal px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
          <div className="h-12 w-64 rounded bg-white/10" />
          <div className="mt-8 aspect-video w-full rounded-xl bg-white/[0.07]" />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl animate-pulse gap-6 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 motion-reduce:animate-none">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i}>
            <div className="aspect-video rounded-lg bg-surface-secondary" />
            <div className="mt-3 h-4 w-4/5 rounded bg-surface-secondary" />
          </div>
        ))}
      </div>
    </div>
  );
}
