import { useParams } from 'react';
import { useArtifactByQR } from '../../hooks/useArtifacts';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { MUSEUM_NAME } from '../../utils/constants';

export default function PublicArtifactPage() {
  const { code } = useParams();
  const { data, isLoading, isError } = useArtifactByQR(code);

  const artifact = data?.artifact || data;

  if (isLoading) {
    return (
      <div className="visitor-shell flex min-h-screen items-center justify-center bg-smrmp-parchment text-[#2B1B12]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-sm font-semibold text-smrmp-green">Loading artifact...</p>
        </div>
      </div>
    );
  }

  if (isError || !artifact) {
    return (
      <div className="visitor-shell flex min-h-screen items-center justify-center bg-smrmp-parchment px-4 text-[#2B1B12]">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-6xl">🏛️</div>
          <h1 className="font-display text-2xl font-bold text-[#2B1B12]">
            Artifact Not Found
          </h1>
          <p className="mt-2 text-sm text-[#6E5445]">
            This QR code does not match any artifact in our collection.
          </p>
        </div>
      </div>
    );
  }

  const primaryImage = artifact.images?.find((i) => i.is_primary) || artifact.images?.[0];

  return (
    <div className="visitor-shell min-h-screen bg-smrmp-parchment text-[#2B1B12]">
      <header className="bg-gradient-to-r from-[#1C120B] via-[#241710] to-[#120D08] px-4 py-4 text-smrmp-parchment border-b border-smrmp-gold/30">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <span className="text-2xl">🏛️</span>
          <div>
            <p className="text-sm font-bold text-smrmp-gold">{MUSEUM_NAME}</p>
            <p className="text-xs text-smrmp-parchment/70">Digital Artifact Explorer</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        {primaryImage ? (
          <div className="overflow-hidden rounded-2xl bg-[#EFE5D8] border border-[#E2D6C5] shadow-md">
            <img src={primaryImage.file_url} alt={artifact.name} className="h-72 w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-2xl bg-[#EFE5D8] border border-[#E2D6C5] text-6xl">
            🏺
          </div>
        )}

        <div>
          <h1 className="font-display text-3xl font-bold text-[#2B1B12]">
            {artifact.name}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{artifact.category}</Badge>
            {artifact.historical_period && (
              <span className="rounded-full bg-[#FAF0D8] px-3 py-1 text-sm font-semibold text-[#7C4A2D] border border-smrmp-gold/40">
                {artifact.historical_period}
              </span>
            )}
            <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-[#FAF6F0] p-5 border border-[#E2D6C5] shadow-2xs">
          <h2 className="font-display text-lg font-semibold text-[#374B07]">Artifact Details</h2>
          {[
            ['Origin', artifact.origin],
            ['Materials', artifact.materials],
            ['Location', artifact.location],
          ].map(([label, value]) => value && (
            <div key={label} className="flex gap-3 text-sm">
              <span className="w-24 shrink-0 text-[#6E5445] font-medium">{label}</span>
              <span className="text-[#2B1B12] font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {artifact.description && (
          <div className="rounded-2xl bg-[#FAF6F0] p-5 border border-[#E2D6C5] shadow-2xs">
            <h2 className="font-display mb-3 text-lg font-semibold text-[#374B07]">
              About This Artifact
            </h2>
            <p className="text-sm leading-relaxed text-[#2B1B12]">{artifact.description}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => alert('Audio narration coming soon!')}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-smrmp-gold/40 bg-[#FAF0D8]/50 py-3 text-sm font-bold text-[#7C4A2D] hover:bg-[#FAF0D8] transition-colors"
        >
          🔊 Listen to Story (Coming Soon)
        </button>

        <footer className="pb-8 text-center text-xs text-[#6E5445]">
          <p className="font-semibold">{MUSEUM_NAME}</p>
          <p>SMRMP Digital Collection Platform</p>
        </footer>
      </main>
    </div>
  );
}
