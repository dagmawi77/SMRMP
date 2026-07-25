export default function PageHeader({ title, description, action, badge }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2D6C5] pb-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#2B1B12] sm:text-3xl">
            {title}
          </h1>
          {badge && (
            <span className="rounded-full bg-[#FAF0E4] px-2.5 py-0.5 text-xs font-semibold text-[#7C4A2D] border border-[#D4A017]/30">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1.5 text-sm text-[#6E5445] font-normal leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
