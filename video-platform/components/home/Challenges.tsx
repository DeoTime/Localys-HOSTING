import { Coins } from 'lucide-react';
import { dailyChallenges, monthlyChallenges, type Challenge } from '@/lib/home-data';

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const pct = Math.min(100, Math.round((challenge.current / challenge.goal) * 100));
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight text-black dark:text-white">{challenge.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{challenge.description}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
          <Coins className="h-3 w-3" />+{challenge.reward}
        </span>
      </div>
      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-gray-500 dark:text-gray-400">
          <span>{challenge.current}/{challenge.goal}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div className="h-full rounded-full bg-[#f97316] transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}

/** (A) Daily + monthly challenges, each with a progress bar (coins/rewards theme). */
export function Challenges() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-bold text-black dark:text-white">Daily challenges</h3>
        <div className="grid gap-2">
          {dailyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold text-black dark:text-white">Monthly challenges</h3>
        <div className="grid gap-2">
          {monthlyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>
    </section>
  );
}
