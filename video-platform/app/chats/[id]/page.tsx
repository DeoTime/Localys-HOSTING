'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import { ChatWindow } from '@/components/chats/ChatWindow';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatContent />
    </ProtectedRoute>
  );
}

function ChatContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const chatId = params.id as string;
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { messages, loading, sending, send } = useMessages(chatId, user?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;
    const result = await send(newMessage);
    if (result.success) setNewMessage('');
  };

  return (
    <div
      className="flex flex-col bg-white dark:bg-[#1A1A18] text-gray-900 dark:text-white"
      style={{ height: 'calc(100dvh - 108px)' }}
    >
      {/* Chat header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">Chat</h1>
      </div>

      {/* Messages — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <ChatWindow
          messages={messages}
          currentUserId={user?.id || ''}
          loading={loading}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 flex gap-2 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="shrink-0 rounded-xl bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition active:scale-95"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
