import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { artifactApi } from '../../api/artifactApi';
import getApiErrorMessage from '../../utils/apiError';
import {
  DocumentDuplicateIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function scoreSimilarity(a, b) {
  if (!a || !b) return 0;
  const left = String(a).toLowerCase().trim();
  const right = String(b).toLowerCase().trim();
  if (!left || !right) return 0;
  if (left === right) return 100;

  const leftTokens = new Set(left.split(/\s+/).filter(Boolean));
  const rightTokens = right.split(/\s+/).filter(Boolean);
  if (!rightTokens.length) return 0;

  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return Math.round((overlap / rightTokens.length) * 100);
}

export default function DuplicateDetectorModal({ isOpen, onClose, artifact }) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  const [duplicatesFound, setDuplicatesFound] = useState([]);

  const handleRunScan = async () => {
    if (!artifact?.name) {
      toast.error('Artifact name is required to scan for duplicates');
      return;
    }

    setIsScanning(true);
    setScanCompleted(false);

    try {
      const res = await artifactApi.getAll({
        search: artifact.name,
        limit: 50,
      });
      const list = res?.data?.data?.artifacts || [];
      const matches = list
        .filter((item) => item.id !== artifact.id)
        .map((item) => {
          const nameScore = scoreSimilarity(artifact.name, item.name);
          const originScore = scoreSimilarity(artifact.origin, item.origin);
          const periodScore = scoreSimilarity(artifact.historical_period, item.historical_period);
          const categoryBonus = artifact.category && item.category === artifact.category ? 15 : 0;
          const similarity = Math.min(99, Math.round(nameScore * 0.6 + originScore * 0.15 + periodScore * 0.1 + categoryBonus));
          const matching_fields = [];
          if (nameScore >= 40) matching_fields.push(`Name (${nameScore}%)`);
          if (artifact.category && item.category === artifact.category) matching_fields.push('Category');
          if (originScore >= 40) matching_fields.push('Origin');
          if (periodScore >= 40) matching_fields.push('Period');
          return { ...item, similarity, matching_fields };
        })
        .filter((item) => item.similarity >= 45)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 5);

      setDuplicatesFound(matches);
      setScanCompleted(true);
      toast.success(
        matches.length
          ? `Found ${matches.length} possible duplicate${matches.length === 1 ? '' : 's'}`
          : 'No close duplicates found in the catalog'
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Duplicate scan failed'));
    } finally {
      setIsScanning(false);
    }
  };

  const handleConfirmUnique = () => {
    toast.success('Record verified as unique catalog entry');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Duplicate Artifact Detection">
      <div className="space-y-4 text-xs text-[#2B1B12]">
        <div className="rounded-2xl bg-[#FAF0D8] p-4 border border-smrmp-gold/40 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-smrmp-gold/20 text-smrmp-gold shrink-0">
            <DocumentDuplicateIcon className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-[#2B1B12] text-sm">Catalog Cross-Check</h4>
            <p className="mt-0.5 text-[#6E5445] leading-relaxed">
              Compares name, category, origin, and period against registered museum assets to surface likely duplicate records.
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
              <span>Run Catalog Duplicate Scan</span>
            </Button>
          </div>
        )}

        {isScanning && (
          <div className="py-10 flex flex-col items-center gap-3 text-[#7C4A2D]">
            <ArrowPathIcon className="h-8 w-8 animate-spin" />
            <p className="font-bold">Scanning catalog for similar artifacts...</p>
          </div>
        )}

        {scanCompleted && !isScanning && (
          <div className="space-y-3">
            {duplicatesFound.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800">No close duplicates found</p>
                  <p className="text-[#2B6A4A] mt-0.5">
                    This record looks unique against the current catalog search results.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="font-bold text-amber-900">
                    {duplicatesFound.length} possible duplicate
                    {duplicatesFound.length === 1 ? '' : 's'} found
                  </p>
                </div>
                {duplicatesFound.map((dup) => (
                  <div
                    key={dup.id}
                    className="rounded-xl border border-[#E2D6C5] bg-[#FFFDF9] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm">{dup.name}</p>
                      <Badge variant="fair">{dup.similarity}% match</Badge>
                    </div>
                    <p className="text-[11px] text-[#6E5445]">
                      {dup.matching_fields?.join(' · ') || 'Partial metadata overlap'}
                    </p>
                    <p className="text-[11px] text-[#6E5445]">
                      {dup.category} · {dup.location || 'Location unset'} · QR {dup.qr_code || '—'}
                    </p>
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={handleRunScan}>
                Rescan
              </Button>
              <Button variant="primary" onClick={handleConfirmUnique}>
                Mark as Unique
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
