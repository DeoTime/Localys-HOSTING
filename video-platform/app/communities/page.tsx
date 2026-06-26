'use client';

import Link from 'next/link';
import { ArrowUp, MessageSquare } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Seeded placeholder threads — Communities (Reddit-style) is built out later.
const threads = [
  { id: 1, community: 'r/RichmondHillEats', title: 'Best hidden-gem bakery near Yonge & 16th?', author: 'localfoodie', votes: 128, comments: 34, emoji: '🥐' },
  { id: 2, community: 'r/LocalServices', title: 'Reliable HVAC for a furnace tune-up before winter?', author: 'homeowner_22', votes: 86, comments: 19, emoji: '🛠️' },
  { id: 3, community: 'r/SupportLocal', title: 'Drop your favourite independent coffee shop 👇', author: 'beanlover', votes: 254, comments: 91, emoji: '☕' },
  { id: 4, community: 'r/Markham', title: 'New taco spot is unreal — birria is a must', author: 'tacotuesday', votes: 173, comments: 47, emoji: '🌮' },
];

export default function CommunitiesPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#1A1A18] dark:text-white">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold sm:text-3xl">Communities</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Reddit-style threads for your area. Full experience coming soon — here&apos;s a preview.
            </p>
          </div>

          <div className="space-y-3">
            {threads.map((t) => (
              <div key={t.id} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <div className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
                  <ArrowUp className="h-5 w-5" />
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{t.votes}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#f97316]">{t.community}</p>
                  <p className="truncate font-semibold">{t.emoji} {t.title}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>u/{t.author}</span>
                    <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {t.comments} comments</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/home" className="text-sm font-semibold text-[#f97316] hover:underline">← Back to Home</Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
