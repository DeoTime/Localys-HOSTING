import { Coins } from 'lucide-react';
import { dailyChallenges, monthlyChallenges, type Challenge } from '@/lib/home-data';

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const pct = Math.min(100, Math.round((challenge.current / challenge.goal) * 100));
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-xs font-semibold text-black dark:text-white">{challenge.title}</p>
        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-black dark:bg-gray-700">
          <Coins className="h-2.5 w-2.5 text-[#f97316]" />+{challenge.reward}
        </span>
      </div>
      <div className="mt-1">
        <div className="mb-0.5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
          <span>{challenge.current}/{challenge.goal}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full rounded-full bg-[#f97316] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/** (A) Daily + monthly challenges, each with a progress bar (coins/rewards theme). */
export function Challenges() {
  return (
    <section className="grid gap-2 lg:grid-cols-2">
      <div>
        <h3 className="mb-1 text-xs font-bold text-black dark:text-white">Daily challenges</h3>
        <div className="grid gap-1">
          {dailyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>
      <div>
        <h3 className="mb-1 text-xs font-bold text-black dark:text-white">Monthly challenges</h3>
        <div className="grid gap-1">
          {monthlyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>
    </section>
  );
}
