'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  showSuggestions?: boolean;
}

const QA = [
  {
    id: 'order',
    question: 'How do I place an order?',
    keywords: ['order', 'buy', 'purchase', 'checkout', 'cart', 'add to cart', 'how to order', 'buying'],
    answer: 'Browse business videos in the Discover feed. Tap any product in the left side panel to add it to your cart. When ready, open your cart (bag icon, top right) and tap Checkout. After paying, you\'ll receive a QR code — show it to the business when you arrive to complete your pickup or delivery.',
  },
  {
    id: 'points',
    question: 'How do points and rewards work?',
    keywords: ['point', 'reward', 'coin', 'credit', 'earn', 'localys credit', 'balance', 'challenge', 'convert'],
    answer: 'Earn Localys Points by completing daily and monthly challenges — things like placing your first order, visiting 3 businesses, or leaving a review. Every 500 points converts to $2.50 in Localys Credit, which is real money off any future order. Check your balance and convert on the Points page (coin icon in the header).',
  },
  {
    id: 'discover',
    question: 'How do I find businesses near me?',
    keywords: ['find', 'restaurant', 'near', 'local', 'discover', 'search', 'food', 'business', 'location', 'nearby', 'where'],
    answer: 'Open the Discover feed to scroll through short videos from local businesses. You can also browse by category on the Home page using Shop by Department. Make sure your location is enabled in Settings so the feed shows businesses closest to you.',
  },
  {
    id: 'review',
    question: 'How do I leave a review?',
    keywords: ['review', 'rate', 'rating', 'feedback', 'comment', 'star', 'leave review'],
    answer: 'After receiving your order, go to Profile → Order History. Find the completed order and tap "Leave a Review" to rate the business with stars and share your experience. Your reviews help other locals discover great businesses!',
  },
  {
    id: 'community',
    question: 'How do I join a community?',
    keywords: ['community', 'join', 'communities', 'group', 'forum', 'post', 'thread', 'upvote', 'downvote', 'reddit'],
    answer: 'Go to the Communities tab in the nav bar. Browse communities like Richmond Hill Eats, Support Local, or Markham. Tap the orange Join button to follow a community. You can then read posts, upvote or downvote, add comments, and start your own threads — organized just like Reddit with r/community names.',
  },
  {
    id: 'ranks',
    question: 'How do ranks work?',
    keywords: ['rank', 'level', 'tier', 'bronze', 'silver', 'gold', 'platinum', 'philanthropist', 'status', 'badge', 'progress'],
    answer: 'Ranks are earned based on how much you spend supporting local businesses:\n\n• Bronze — getting started\n• Silver — growing supporter\n• Gold — committed local champion\n• Platinum — elite community member\n• Localys Philanthropist — top of the community\n\nYour current rank and progress show on your Profile page.',
  },
  {
    id: 'messages',
    question: 'How do I message a business?',
    keywords: ['message', 'chat', 'contact', 'dm', 'inbox', 'talk', 'reach out', 'send message'],
    answer: 'Open the Messages tab in the nav bar. Tap the orange + button (top right) to start a new chat, search for the business or person by name, and begin your conversation. Businesses can answer questions about orders, hours, and specials.',
  },
  {
    id: 'group-order',
    question: 'What is a group order?',
    keywords: ['group', 'group order', 'share order', 'split', 'together', 'friends', 'office', 'join order'],
    answer: 'A group order lets multiple people add items to a shared cart using a join code. One person starts the group order and shares the code with friends or colleagues. Everyone picks what they want, then the group checks out together — perfect for office lunches or family outings.',
  },
  {
    id: 'promo',
    question: 'How do I use a promo code?',
    keywords: ['promo', 'code', 'coupon', 'discount', 'deal', 'voucher', 'save', 'apply code'],
    answer: 'At checkout, look for the Promo Code field. Type in your code and tap Apply — the discount shows in your order total before you pay. Promo codes are shared by businesses, found in Community posts, or earned through special events.',
  },
  {
    id: 'qr',
    question: 'How does QR code pickup work?',
    keywords: ['qr', 'qr code', 'pickup', 'scan', 'complete order', 'collect', 'show code'],
    answer: 'After paying, you receive a unique QR code for your order. When you arrive at the business, show the QR code on your phone. The business scans it through their Business Manager to confirm and complete your order instantly.',
  },
  {
    id: 'express',
    question: 'What is Express Delivery?',
    keywords: ['express', 'delivery', 'fast', 'quick', '2 hour', 'deliver', 'express delivery'],
    answer: 'Express Delivery is offered by select local businesses and gets your order to you in under 2 hours. Look for the orange Express Delivery badge on business videos in the Discover feed. Fees and delivery terms apply — check the checkout screen for full details.',
  },
  {
    id: 'profile',
    question: 'How do I edit my profile?',
    keywords: ['profile', 'edit', 'name', 'bio', 'picture', 'photo', 'username', 'change info'],
    answer: 'Tap your avatar (top right) → Profile → Edit Profile button. Update your name, username, bio, and profile photo from there. Your profile also shows your rank, local impact stats, order history, and earned achievement badges.',
  },
  {
    id: 'premium',
    question: 'What is Localys Premium?',
    keywords: ['premium', 'membership', 'subscribe', 'subscription', 'upgrade', 'pro', 'localys premium'],
    answer: 'Localys Premium gives you extra perks for supporting local businesses: enhanced discovery in the feed, exclusive community badges, early access to local deals, and more. Look for Premium options in your account settings.',
  },
];

const SUGGESTIONS = QA.map((q) => ({ id: q.id, question: q.question }));

function findAnswer(query: string): string | null {
  const lower = query.toLowerCase();
  let best: { answer: string; score: number } | null = null;
  for (const pair of QA) {
    const score = pair.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { answer: pair.answer, score };
    }
  }
  return best?.answer ?? null;
}

const GREETING: Message = {
  role: 'assistant',
  text: 'Hi! I\'m the Localys Assistant. Ask me anything about how the app works, or pick a question below.',
  showSuggestions: true,
};

export function LocalysAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = findAnswer(trimmed);
    const botMsg: Message = answer
      ? { role: 'assistant', text: answer }
      : {
          role: 'assistant',
          text: "I'm not sure about that one. Try one of these common questions:",
          showSuggestions: true,
        };
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }, botMsg]);
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Localys Assistant' : 'Open Localys Assistant'}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#f97316] shadow-xl transition hover:opacity-90 active:scale-95"
      >
        {open ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 flex w-[340px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 bg-[#f97316] px-4 py-3">
            <MessageCircle className="h-5 w-5 shrink-0 text-white" />
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Localys Assistant</p>
              <p className="text-[11px] text-white/80">Here to help</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-white/80 transition hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div key={i}>
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[#f97316] text-white'
                        : 'rounded-bl-sm bg-gray-100 text-black'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {msg.showSuggestions && (
                  <div className="mt-2 space-y-1">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => send(s.question)}
                        className="block w-full rounded-xl border border-gray-200 px-3 py-2 text-left text-xs font-medium text-black transition-colors hover:border-[#f97316] hover:bg-orange-50"
                      >
                        {s.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex shrink-0 items-center gap-2 border-t border-gray-100 p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-black placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f97316] transition hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
