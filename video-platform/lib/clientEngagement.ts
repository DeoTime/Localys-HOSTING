'use client';

/**
 * Client-side engagement store for demo/seeded content.
 *
 * Demo videos, slug-based stores, and demo comments are not real Supabase rows,
 * so likes / bookmarks / comment-likes / comments / replies / ratings on them
 * cannot be persisted in the database. This module keeps that state in
 * localStorage so it works with zero Supabase calls and survives reloads.
 *
 * Mirrors the localStorage pattern used by `contexts/CartContext.tsx`. A tiny
 * pub-sub lets components (profile "Saved" section, headers, comment lists)
 * re-render when demo state changes.
 */

import type { Comment } from '../models/Comment';

const STORAGE_KEY = 'localys:engagement';

export interface SavedItem {
  id: string;
  type: 'video' | 'business';
  name: string;
  image?: string;
  /** Optional link target (e.g. store slug page) for the profile Saved grid. */
  href?: string;
}

interface EngagementState {
  likedItems: Record<string, true>;
  bookmarkedItems: Record<string, SavedItem>;
  commentLikes: Record<string, true>;
  demoComments: Record<string, Comment[]>;
  ratings: Record<string, number>;
}

const EMPTY: EngagementState = {
  likedItems: {},
  bookmarkedItems: {},
  commentLikes: {},
  demoComments: {},
  ratings: {},
};

let state: EngagementState = { ...EMPTY };
let hydrated = false;
const listeners = new Set<() => void>();

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<EngagementState>;
      state = {
        likedItems: parsed.likedItems ?? {},
        bookmarkedItems: parsed.bookmarkedItems ?? {},
        commentLikes: parsed.commentLikes ?? {},
        demoComments: parsed.demoComments ?? {},
        ratings: parsed.ratings ?? {},
      };
    }
  } catch {
    // ignore corrupt storage
  }
}

function persistAndEmit() {
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }
  listeners.forEach((cb) => cb());
}

/** Subscribe to demo-engagement changes. Returns an unsubscribe function. */
export function subscribeEngagement(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// ----- Likes (videos AND businesses) -------------------------------------------------

export function isItemLiked(id: string): boolean {
  hydrate();
  return !!state.likedItems[id];
}

/** Toggle a like for a demo video/business. Returns the new liked state. */
export function toggleItemLike(id: string): boolean {
  hydrate();
  const next = !state.likedItems[id];
  const likedItems = { ...state.likedItems };
  if (next) likedItems[id] = true;
  else delete likedItems[id];
  state = { ...state, likedItems };
  persistAndEmit();
  return next;
}

export function getLikedItemIds(): string[] {
  hydrate();
  return Object.keys(state.likedItems);
}

// ----- Bookmarks / saved -------------------------------------------------------------

export function isItemBookmarked(id: string): boolean {
  hydrate();
  return !!state.bookmarkedItems[id];
}

/** Toggle a bookmark for a demo item. Returns the new bookmarked state. */
export function toggleItemBookmark(item: SavedItem): boolean {
  hydrate();
  const exists = !!state.bookmarkedItems[item.id];
  const bookmarkedItems = { ...state.bookmarkedItems };
  if (exists) delete bookmarkedItems[item.id];
  else bookmarkedItems[item.id] = item;
  state = { ...state, bookmarkedItems };
  persistAndEmit();
  return !exists;
}

export function getSavedItems(): SavedItem[] {
  hydrate();
  return Object.values(state.bookmarkedItems);
}

// ----- Comment likes -----------------------------------------------------------------

export function isCommentLiked(commentId: string): boolean {
  hydrate();
  return !!state.commentLikes[commentId];
}

/** Toggle a like for a demo comment. Returns the new liked state. */
export function toggleCommentLikeLocal(commentId: string): boolean {
  hydrate();
  const next = !state.commentLikes[commentId];
  const commentLikes = { ...state.commentLikes };
  if (next) commentLikes[commentId] = true;
  else delete commentLikes[commentId];
  state = { ...state, commentLikes };
  persistAndEmit();
  return next;
}

// ----- Demo comments + replies -------------------------------------------------------

/** Comments the user posted on a demo video (newest first). */
export function getDemoComments(videoId: string): Comment[] {
  hydrate();
  return state.demoComments[videoId] ?? [];
}

export function addDemoComment(videoId: string, comment: Comment): void {
  hydrate();
  const existing = state.demoComments[videoId] ?? [];
  state = {
    ...state,
    demoComments: { ...state.demoComments, [videoId]: [comment, ...existing] },
  };
  persistAndEmit();
}

// ----- Ratings -----------------------------------------------------------------------

export function getDemoRating(videoId: string): number | undefined {
  hydrate();
  return state.ratings[videoId];
}

export function setDemoRating(videoId: string, rating: number): void {
  hydrate();
  state = { ...state, ratings: { ...state.ratings, [videoId]: rating } };
  persistAndEmit();
}
