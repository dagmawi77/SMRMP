import { Link } from 'react-router-dom';
import { ArrowRightIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { formatDate } from '../../utils/formatters';

const categoryEmoji = {
  weapon: '⚔️',
  textile: '🧵',
  document: '📜',
  ceramic: '🏺',
  jewelry: '👑',
  ceremonial: '🚩',
  photograph: '📷',
  coin: '🪙',
  other: '🏛️',
};

export default function RecentArtifacts({ artifacts, loading }) {
  return (
    <Card hover className="p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-[#E2D6C5] pb-3 mb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-[#2B1B12]">Recent Additions</h3>
            <p className="text-[11px] text-[#6E5445]">Latest registered artifacts</p>
          </div>
          <Link
            to="/artifacts"
            className="flex items-center gap-0.5 text-xs font-bold text-[#374B07] hover:text-[#243205] transition-colors"
          >
            <span>All</span>
            <ArrowRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <Spinner className="py-8" />
        ) : !artifacts?.length ? (
          <div className="py-8 text-center text-xs font-medium text-[#6E5445]">
            No recent artifacts
          </div>
        ) : (
          <div className="space-y-2">
            {artifacts.slice(0, 4).map((artifact) => {
              const icon = categoryEmoji[artifact.category?.toLowerCase()] || '🏛️';

              return (
                <Link
                  key={artifact.id}
                  to={`/artifacts/${artifact.id}`}
                  className="group flex items-center justify-between p-2 rounded-lg border border-[#E2D6C5] bg-[#FFFDF9] hover:bg-[#FAF0E4] hover:border-smrmp-gold/50 hover:shadow-2xs transition-all duration-200"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFE5D8] shadow-2xs border border-[#D8C8B8] text-sm">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2B1B12] truncate group-hover:text-[#374B07] transition-colors">
                        {artifact.name}
                      </p>
                      <p className="text-[10px] text-[#6E5445] truncate">
                        {artifact.category} • {formatDate(artifact.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-[#E2D6C5]">
        <Link
          to="/artifacts/new"
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#EFE5D8] py-1.5 text-xs font-semibold text-[#4A2C1B] hover:bg-[#FAF0E4] transition-colors border border-[#D8C8B8]"
        >
          <SparklesIcon className="h-3.5 w-3.5 text-smrmp-gold" />
          <span>Register New Artifact</span>
        </Link>
      </div>
    </Card>
  );
}
