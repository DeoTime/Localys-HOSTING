import { ChatWithDetails } from '@/lib/supabase/messages';
import { BadgeCheck } from 'lucide-react';

interface ChatListItemProps {
  chat: ChatWithDetails;
  onClick?: () => void;
}

export function ChatListItem({ chat, onClick }: ChatListItemProps) {
  const otherUser = chat.other_user;
  const displayName = otherUser?.full_name || otherUser?.username || 'Unknown User';
  const avatarUrl = otherUser?.profile_picture_url;
  const lastMessageText = chat.last_message?.content || 'No messages yet';
  const unreadCount = chat.unread_count || 0;
  const isVerifiedSeller = otherUser?.type === 'business' || otherUser?.type === 'seller';

  const formatTimestamp = (timestamp: string | null | undefined) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316] dark:bg-gray-900 ${
        unreadCount > 0 ? 'border-[#f97316]' : 'border-gray-200 dark:border-gray-700'
      }`}
    >
      {/* Avatar */}
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl font-bold text-black dark:text-white">
            {displayName[0]?.toUpperCase() || '?'}
          </div>
        )}
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-[#f97316] dark:border-gray-900" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-1.5">
          <h3 className={`truncate text-black dark:text-white ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
            {displayName}
          </h3>
          {isVerifiedSeller && <BadgeCheck className="h-4 w-4 shrink-0 text-[#f97316]" />}
        </div>
        <p className="truncate text-sm text-black dark:text-white">{lastMessageText}</p>
      </div>

      {/* Timestamp + unread */}
      <div className="flex-shrink-0 text-right">
        {chat.last_message?.created_at && (
          <p className={`mb-1 text-xs ${unreadCount > 0 ? 'font-semibold text-[#f97316]' : 'text-black dark:text-white'}`}>
            {formatTimestamp(chat.last_message.created_at)}
          </p>
        )}
        {unreadCount > 0 && (
          <span className="inline-block rounded-full bg-[#f97316] px-2.5 py-0.5 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>
    </button>
  );
}
