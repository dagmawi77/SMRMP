import { useState } from 'react';

export default function ImageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[#EFE5D8] border border-[#E2D6C5] text-6xl shadow-2xs">
        🏺
      </div>
    );
  }

  const active = images[activeIndex] || images[0];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-[#EFE5D8] border border-[#E2D6C5] shadow-2xs">
        <img
          src={active.file_url}
          alt="Artifact"
          className="aspect-[4/3] w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={img.id || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                index === activeIndex ? 'border-smrmp-gold scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.file_url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
