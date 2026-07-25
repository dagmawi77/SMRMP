import { Link } from 'react-router-dom';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function ArtifactCard({ artifact }) {
  const primaryImage = artifact.images?.find((i) => i.is_primary) || artifact.images?.[0];

  return (
    <Link to={`/artifacts/${artifact.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-md hover:border-smrmp-gold/50" padding={false}>
        <div className="aspect-[4/3] bg-[#EFE5D8]">
          {primaryImage ? (
            <img
              src={primaryImage.file_url}
              alt={artifact.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl">🏺</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-[#2B1B12] line-clamp-1">{artifact.name}</h3>
          <p className="mt-1 text-sm capitalize text-[#6E5445]">{artifact.category}</p>
          <div className="mt-3">
            <Badge variant={artifact.condition_status}>{artifact.condition_status}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
