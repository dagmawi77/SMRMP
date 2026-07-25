import ArtifactCard from './ArtifactCard';

export default function ArtifactGrid({ artifacts, loading, onCardClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse rounded-2xl border border-[#E2D6C5] bg-[#FAF6F0] p-4 shadow-2xs space-y-4"
          >
            <div className="h-48 w-full rounded-xl bg-[#EFE5D8]" />
            <div className="space-y-2">
              <div className="h-5 w-3/4 rounded-md bg-[#EFE5D8]" />
              <div className="h-4 w-1/2 rounded-md bg-[#EFE5D8]" />
            </div>
            <div className="pt-4 border-t border-[#EFE5D8] flex items-center justify-between">
              <div className="h-4 w-1/3 rounded-md bg-[#EFE5D8]" />
              <div className="h-5 w-1/4 rounded-full bg-[#EFE5D8]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!artifacts || artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D8C8B8] bg-[#FAF6F0] p-12 text-center shadow-2xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EFE5D8] text-3xl mb-4 border border-[#D8C8B8]">
          🔍
        </div>
        <h3 className="font-display text-lg font-bold text-[#2B1B12]">
          No Artifact Records Found
        </h3>
        <p className="mt-1 text-xs text-[#6E5445] max-w-md">
          There are no museum catalog records matching your current filter criteria or search query. Try resetting filters or searching with different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {artifacts.map((artifact) => (
        <ArtifactCard
          key={artifact.id}
          artifact={artifact}
          onClick={onCardClick ? () => onCardClick(artifact) : undefined}
        />
      ))}
    </div>
  );
}
