'use client';

import { useEffect, useState } from 'react';
import { X, Lock } from 'lucide-react';
import {
  RANKS,
  computeImpactScore,
  getRankProgress,
  resolveImpactInputs,
  type ImpactInputs,
} from '@/lib/ranks';

/** Badge image; falls back to a neutral disc if a file is missing (never broken). */
function RankBadge({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`rounded-full bg-white/10 ${className}`} aria-label={alt} />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={`object-contain ${className}`} onError={() => setFailed(true)} />;
}

/**
 * Profile rank/tier display: current rank badge + name, a progress bar to the next
 * rank (or a "max rank" state at the top), and a "Ranks" button that opens a pop-up
 * of all six rank images. Palette: black / white / #f97316 only.
 */
export function RankSection({ moneySpent, points, bizCount }: ImpactInputs) {
  const [open, setOpen] = useState(false);

  const inputs = resolveImpactInputs({ moneySpent, points, bizCount });
  const score = computeImpactScore(inputs);
  const { current, next, pctToNext, isMax } = getRankProgress(score);

  return (
    <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900">Your Rank</h3>
        <button
          onClick={() => setOpen(true)}
          className="rounded-full border border-[#f97316] px-3 py-1 text-xs font-semibold text-[#f97316] transition-colors hover:bg-[#f97316] hover:text-white"
        >
          Ranks
        </button>
      </div>

      <div className="flex items-center gap-5">
        <RankBadge src={current.image} alt={current.name} className="h-28 w-28 shrink-0 sm:h-32 sm:w-32" />
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">{current.name}</p>
          <p className="mt-0.5 text-sm text-gray-500">Impact Score {score.toLocaleString()}</p>

          {isMax ? (
            <div className="mt-3 inline-flex items-center rounded-full bg-[#f97316] px-4 py-1.5 text-sm font-semibold text-white">
              Max rank reached
            </div>
          ) : (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#f97316]">{pctToNext}% to {next!.name}</span>
                <span className="text-gray-400">{score.toLocaleString()} / {next!.threshold.toLocaleString()}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-[#f97316] transition-[width] duration-500"
                  style={{ width: `${pctToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {open && <RanksModal currentId={current.id} score={score} onClose={() => setOpen(false)} />}
    </div>
  );
}

function RanksModal({ currentId, score, onClose }: { currentId: string; score: number; onClose: () => void }) {
  // Close on Escape; lock body scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-black text-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-lg font-extrabold uppercase tracking-widest">Ranks</h2>
            <p className="mt-0.5 text-xs text-white/60">
              Support local businesses to raise your Impact Score and climb the tiers.
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-white/60 transition-colors hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tiers — lowest to highest (like the reference) */}
        <div className="overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {RANKS.map((rank) => {
              const isCurrent = rank.id === currentId;
              const unlocked = score >= rank.threshold;
              return (
                <div
                  key={rank.id}
                  className={`relative flex flex-col items-center rounded-xl border p-3 text-center transition-colors ${
                    isCurrent
                      ? 'border-[#f97316] bg-[#f97316]/10'
                      : unlocked
                        ? 'border-white/15 bg-white/5'
                        : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <p
                    className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${
                      unlocked ? 'text-[#f97316]' : 'text-white/40'
                    }`}
                  >
                    {rank.name}
                  </p>

                  <div className="relative">
                    <RankBadge
                      src={rank.image}
                      alt={rank.name}
                      className={`h-20 w-20 ${unlocked ? '' : 'opacity-30 grayscale'}`}
                    />
                    {!unlocked && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-white/70" />
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-[11px] leading-snug text-white/70">{rank.requirement}</p>

                  {isCurrent ? (
                    <span className="mt-2 rounded-full bg-[#f97316] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Current
                    </span>
                  ) : unlocked ? (
                    <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/50">Unlocked</span>
                  ) : (
                    <span className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">Locked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
