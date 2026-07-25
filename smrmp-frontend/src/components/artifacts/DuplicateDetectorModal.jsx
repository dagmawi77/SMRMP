import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function DuplicateDetectorModal({ isOpen, onClose, artifact }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState([
    {
      id: 'art-dup-1',
      name: artifact?.name ? `${artifact.name} (Archival Copy B)` : 'Ceremonial Adwa Shield',
      similarity: 92,
      category: artifact?.category || 'ceremonial',
      created_at: '2026-03-12',
      matching_fields: ['Image Features (94%)', 'Origin & Period', 'Materials'],
    },
  ]);

  const handleRunScan = () => {
    setIsScanning(true);
    setScanCompleted(false);

    setTimeout(() => {
      setIsScanning(false);
      setScanCompleted(true);
      toast.success('AI Duplicate Scan complete');
    }, 1800);
  };

  const handleMerge = (dupName) => {
    toast.success(`Merged record with "${dupName}"`);
    setDuplicatesFound((prev) => prev.filter((d) => d.name !== dupName));
  };

  const handleConfirmUnique = () => {
    toast.success('Record verified as unique catalog entry!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Duplicate Artifact Detection">
      <div className="space-y-4 text-xs text-[#2B1B12]">
        <div className="rounded-2xl bg-[#FAF0D8] p-4 border border-smrmp-gold/40 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-smrmp-gold/20 text-smrmp-gold shrink-0">
            <DocumentDuplicateIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-[#2B1B12] text-sm">Visual & Metadata Cross-Check</h4>
            <p className="mt-0.5 text-[#6E5445] leading-relaxed">
              Scans image embeddings, materials, historical origin, and catalog names against all registered museum assets to prevent duplicate records.
            </p>
          </div>
        </div>

        {artifact && (
          <div className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E5445]">Target Artifact:</span>
              <p className="font-bold text-[#2B1B12] text-sm">{artifact.name}</p>
            </div>
            <Badge variant="purple">{artifact.category}</Badge>
          </div>
        )}

        {!scanCompleted && !isScanning && (
          <div className="py-6 text-center">
            <Button variant="gold" size="lg" className="mx-auto" onClick={handleRunScan}>
              <SparklesIcon className="h-4 w-4" />
              <span>Run AI Cross-Catalog Scan</span>
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="py-8 text-center space-y-3">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-smrmp-gold border-t-transparent" />
            <p className="font-bold text-[#2B1B12]">Comparing catalog image embeddings & metadata...</p>
            <p className="text-[11px] text-[#6E5445]">Checking 2,400+ Ethiopian heritage registry entries</p>
          </div>
        )}

        {scanCompleted && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {duplicatesFound.length > 0 ? (
              <>
                <div className="flex items-center gap-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-bold">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>{duplicatesFound.length} Potential Duplicate Entry Detected</span>
                </div>

                {duplicatesFound.map((dup) => (
                  <div key={dup.id} className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-[#2B1B12] text-sm">{dup.name}</p>
                      <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 font-mono text-xs font-bold border border-rose-200">
                        {dup.similarity}% Similarity
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dup.matching_fields.map((f) => (
                        <span key={f} className="rounded-md bg-[#EFE5D8] px-2 py-0.5 text-[10px] font-semibold text-[#5C4233]">
                          ✓ {f}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#F0E6D8]">
                      <Button variant="secondary" size="sm" onClick={() => handleMerge(dup.name)}>
                        Merge Records
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 text-center space-y-1">
                <CheckCircleIcon className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-emerald-900 text-sm">No Duplicates Found</p>
                <p className="text-[#6E5445]">This artifact record is confirmed unique across all collections.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-[#E2D6C5]">
          {scanCompleted && (
            <button
              type="button"
              onClick={handleRunScan}
              className="flex items-center gap-1 text-xs text-[#6E5445] hover:text-[#2B1B12] font-semibold"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" />
              <span>Rescan</span>
            </button>
          )}

          <div className="ml-auto flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleConfirmUnique}>
              Confirm Unique
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
