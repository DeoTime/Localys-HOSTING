'use client';

import { Message } from '@/lib/supabase/messages';
import Link from 'next/link';
import { useState } from 'react';
import { editMessage, deleteMessage } from '@/lib/supabase/messages';

interface Sender {
  id: string;
  username?: string;
  full_name?: string;
  profile_picture_url?: string;
}

interface MessageWithSender extends Message {
  sender?: Sender;
}

interface ChatWindowProps {
  messages: MessageWithSender[];
  currentUserId: string;
  loading?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement | null>;
}

export function ChatWindow({ messages, currentUserId, loading, messagesEndRef }: ChatWindowProps) {
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEditStart = (message: MessageWithSender) => {
    setEditingId(message.id || null);
    setEditingContent(message.content);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingContent('');
  };

  const handleEditSave = async (messageId: string | undefined) => {
    if (!messageId || !editingContent.trim()) return;
    try {
      const { error: err } = await editMessage(messageId, editingContent.trim());
      if (err) { setError('Failed to edit message'); return; }
      handleEditCancel();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
    }
  };

  const handleDelete = async (messageId: string | undefined) => {
    if (!messageId) return;
    if (!confirm('Delete this message?')) return;
    try {
      const { error: err } = await deleteMessage(messageId);
      if (err) setError('Failed to delete message');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#f97316]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">No messages yet. Say hello!</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const sender = message.sender;
        const senderName = sender?.full_name || sender?.username || 'Unknown';
        const senderAvatar = sender?.profile_picture_url;
        const isEditing = editingId === message.id;

        return (
          <div
            key={message.id}
            className={`flex gap-2.5 py-0.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            onMouseEnter={() => setHoveredMessageId(message.id || null)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {/* Other user avatar */}
            {!isOwn && (
              <Link href={`/profile/${sender?.username || message.sender_id}`} className="shrink-0 self-end">
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 hover:opacity-80 transition-opacity">
                  {senderAvatar ? (
                    <img src={senderAvatar} alt={senderName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {senderName[0]?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {/* Bubble + actions */}
            <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                {!isOwn && (
                  <Link
                    href={`/profile/${sender?.username || message.sender_id}`}
                    className="mb-0.5 px-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    {senderName}
                  </Link>
                )}

                {isEditing ? (
                  <div className="w-full min-w-[200px]">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      aria-label="Edit message"
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
                    />
                    <div className="mt-1.5 flex gap-2">
                      <button
                        onClick={() => handleEditSave(message.id)}
                        className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'rounded-br-sm bg-[#f97316] text-white shadow-sm'
                        : 'rounded-bl-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${message.deleted ? 'italic opacity-60' : ''}`}>
                      {message.content}
                    </p>
                    <div className={`mt-0.5 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                        {new Date(message.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.edited_at && (
                        <span className={`text-[10px] ${isOwn ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                          (edited)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3-dot menu — own messages only */}
              {isOwn && hoveredMessageId === message.id && !isEditing && !message.deleted && (
                <div className="relative mb-1 flex items-center">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === message.id ? null : message.id || null)}
                    aria-label="Message options"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-base leading-none"
                  >
                    ···
                  </button>
                  {menuOpenId === message.id && (
                    <div className="absolute bottom-full mb-1 right-0 z-50 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg whitespace-nowrap">
                      <button
                        onClick={() => { handleEditStart(message); setMenuOpenId(null); }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { handleDelete(message.id); setMenuOpenId(null); }}
                        className="block w-full border-t border-gray-100 dark:border-gray-700 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
