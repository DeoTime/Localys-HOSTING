'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useChats } from '@/hooks/useChats';
import { ChatList } from '@/components/chats/ChatList';
import { searchUsers, getOrCreateOneToOneChat, sendMessage } from '@/lib/supabase/messages';
import dynamic from 'next/dynamic';
const NewChatModal = dynamic(() => import('@/components/chats/NewChatModal').then((mod) => mod.NewChatModal), { ssr: false });

interface PersonResult {
  id: string;
  username?: string;
  full_name?: string;
  profile_picture_url?: string;
}

export default function ChatsPage() {
  return (
    <ProtectedRoute>
      <ChatsContent />
    </ProtectedRoute>
  );
}

function ChatsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { chats, loading, error } = useChats(user?.id);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<PersonResult[]>([]);
  const [starting, setStarting] = useState(false);

  // Live substring filter of existing conversations by username / full name.
  const filteredChats = useMemo(() => {
    const s = query.trim().toLowerCase();
    if (!s) return chats;
    return chats.filter((c) => {
      const u = c.other_user;
      return (
        (u?.username?.toLowerCase().includes(s) ?? false) ||
        (u?.full_name?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [query, chats]);

  // Surface non-contact businesses/users (substring username search) while typing.
  useEffect(() => {
    const s = query.trim();
    if (!s || !user?.id) {
      setPeople([]);
      return;
    }
    const t = setTimeout(async () => {
      const { data } = await searchUsers(s, user.id);
      const existingIds = new Set(chats.map((c) => c.other_user?.id).filter(Boolean));
      setPeople((data ?? []).filter((p: PersonResult) => !existingIds.has(p.id)).slice(0, 6));
    }, 250);
    return () => clearTimeout(t);
  }, [query, user?.id, chats]);

  const startChat = async (userId: string) => {
    if (!user?.id) return;
    setStarting(true);
    const { data } = await getOrCreateOneToOneChat(user.id, userId);
    if (data) {
      if (!data.last_message) {
        await sendMessage({ chat_id: data.id, sender_id: user.id, content: 'Hi! Is this available?' });
      }
      router.push(`/chats/${data.id}`);
    }
    setStarting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-black dark:bg-[#1A1A18] dark:text-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
        {/* Header + search */}
        <div className="mb-5 flex items-center gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">Messages</h1>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black dark:text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username…"
              aria-label="Search messages by username"
              className="w-full rounded-full border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-black placeholder-gray-500 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowNewChatModal(true)}
            aria-label="New chat"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f97316] text-white transition hover:opacity-90"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40">
            Could not load chats: {error.message}
          </div>
        )}

        {/* Non-contact people matching the search */}
        {query.trim() && people.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black dark:text-white">Start new chat</p>
            <div className="space-y-2">
              {people.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={starting}
                  onClick={() => startChat(p.id)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-left transition hover:border-[#f97316] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-black dark:bg-gray-800 dark:text-white">
                    {p.profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.profile_picture_url} alt={p.full_name || p.username || ''} className="h-full w-full object-cover" />
                    ) : (
                      (p.full_name || p.username || '?').charAt(0).toUpperCase()
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-black dark:text-white">{p.full_name || p.username}</span>
                    {p.username && <span className="block truncate text-sm text-black dark:text-white">@{p.username}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {query.trim() && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-black dark:text-white">Your chats</p>
        )}
        {!loading && filteredChats.length === 0 && query.trim() ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
            <MessageCircle className="mx-auto mb-2 h-8 w-8 text-black dark:text-white" />
            <p className="font-semibold">No conversations match “{query.trim()}”.</p>
          </div>
        ) : (
          <ChatList chats={filteredChats} currentUserId={user?.id || ''} loading={loading} />
        )}
      </div>

      {user && (
        <NewChatModal isOpen={showNewChatModal} onClose={() => setShowNewChatModal(false)} currentUserId={user.id} />
      )}
    </div>
  );
}
