import { ChatWithDetails } from '@/lib/supabase/messaging';
import { ChatListItem } from './ChatListItem';
import { useRouter } from 'next/navigation';

interface ChatListProps {
  chats: ChatWithDetails[];
  currentUserId: string;
  loading?: boolean;
}

export function ChatList({ chats, loading }: ChatListProps) {
  const router = useRouter();

  const handleChatClick = (chatId: string) => {
    router.push(`/chats/${chatId}`);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="font-semibold text-black dark:text-white">No chats yet</p>
        <p className="mt-1 text-sm text-black dark:text-white">Start a new conversation with the + button above.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} onClick={() => chat.id && handleChatClick(chat.id)} />
      ))}
    </div>
  );
}
