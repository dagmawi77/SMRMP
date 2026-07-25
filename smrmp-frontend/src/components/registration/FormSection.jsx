export default function FormSection({ number, title, children, id }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-md sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-smrmp-gold text-xs font-bold text-black"
          aria-hidden="true"
        >
          {number}
        </span>
        <h2 id={`${id}-title`} className="font-display text-lg font-bold text-smrmp-parchment sm:text-xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
