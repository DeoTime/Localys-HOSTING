'use client';

import { Message } from '@/lib/supabase/messages';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
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
      if (err) {
        setError('Failed to edit message');
        return;
      }
      handleEditCancel();
    } catch (err: any) {
      setError(err.message || 'Failed to edit message');
    }
  };

  const handleDelete = async (messageId: string | undefined) => {
    if (!messageId) return;

    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const { error: err } = await deleteMessage(messageId);
      if (err) {
        setError('Failed to delete message');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/40">
          <p>No messages yet</p>
          <p className="text-sm mt-2">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {error && (
        <div className="bg-red-500/20 text-red-400 px-4 py-2 text-sm rounded border border-red-500/30">
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
            className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
            onMouseEnter={() => setHoveredMessageId(message.id || null)}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            {/* Avatar */}
            {!isOwn && (
              <Link
                href={`/profile/${sender?.username || message.sender_id}`}
                className="flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                  {senderAvatar ? (
                    <img
                      src={senderAvatar}
                      alt={senderName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/60 text-sm font-semibold">
                      {senderName[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
              </Link>
            )}

            {/* Message Bubble with Menu */}
            <div className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                {!isOwn && (
                  <Link 
                    href={`/profile/${sender?.username || message.sender_id}`}
                    className="text-xs text-white/60 mb-1 px-2 hover:text-white/80 transition-colors"
                  >
                    {senderName}
                  </Link>
                )}
                {isEditing ? (
                  <div className="w-full">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/40 focus:outline-none focus:bg-white/30"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditSave(message.id)}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-white text-black'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap break-words ${message.deleted ? 'italic text-gray-400' : ''}`}>
                      {message.content}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <p className={`text-xs ${isOwn ? 'text-black/60' : 'text-white/60'}`}>
                        {new Date(message.created_at!).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {message.edited_at && (
                        <span className={`text-xs ${isOwn ? 'text-black/60' : 'text-white/60'}`}>
                          (edited)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3-Dot Menu */}
              {isOwn && hoveredMessageId === message.id && !isEditing && !message.deleted && (
                <div className="relative flex items-center">
                  <button
                    onClick={() => setMenuOpenId(menuOpenId === message.id ? null : message.id || null)}
                    className="text-xs px-2 py-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Message options"
                  >
                    ⋯
                  </button>
                  {menuOpenId === message.id && (
                    <div className="absolute top-full mt-1 right-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg z-50 whitespace-nowrap">
                      <button
                        onClick={() => {
                          handleEditStart(message);
                          setMenuOpenId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 flex items-center gap-2 hover:text-blue-400 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDelete(message.id);
                          setMenuOpenId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/20 flex items-center gap-2 hover:text-red-400 transition-colors border-t border-white/10"
                      >
                        🗑️ Delete
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
