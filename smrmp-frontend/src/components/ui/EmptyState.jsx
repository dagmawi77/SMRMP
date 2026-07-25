export default function EmptyState({ icon = '🏛️', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="mb-4 text-5xl">{icon}</span>
      <h3 className="font-display text-lg font-bold text-[#2B1B12]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[#6E5445] leading-relaxed">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
