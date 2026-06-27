'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  color: string;
  votes: number;
  userVote: 0 | 1 | -1;
}

export interface Thread {
  id: string;
  communityId: string;
  communityName: string;
  title: string;
  content: string;
  author: string;
  votes: number;
  userVote: 0 | 1 | -1;
  commentCount: number;
  createdAt: string;
}

export interface ThreadComment {
  id: string;
  threadId: string;
  author: string;
  content: string;
  votes: number;
  userVote: 0 | 1 | -1;
  createdAt: string;
}

const SEED_COMMUNITIES: Community[] = [
  // Local (Canada)
  { id: 'richmondhill-eats', name: 'RichmondHillEats', description: 'Food discoveries in Richmond Hill', memberCount: 1842, color: '#f97316', votes: 312, userVote: 0 },
  { id: 'support-local', name: 'SupportLocal', description: 'Champion local businesses', memberCount: 3210, color: '#10b981', votes: 528, userVote: 0 },
  // United States — varied regions & themes
  { id: 'texas-steak-lovers', name: 'TexasSteakLovers', description: 'Brisket, ribeyes and BBQ pits across Texas', memberCount: 5840, color: '#f97316', votes: 921, userVote: 0 },
  { id: 'nyc-eats', name: 'NYCEats', description: 'Pizza, bagels and hidden gems in New York City', memberCount: 8421, color: '#3b82f6', votes: 1340, userVote: 0 },
  { id: 'california-foodies', name: 'CaliforniaFoodies', description: 'Farm-to-table and taco trucks across California', memberCount: 6210, color: '#10b981', votes: 845, userVote: 0 },
  { id: 'chicago-deep-dish', name: 'ChicagoDeepDish', description: 'Deep dish, Italian beef and the best of Chicago', memberCount: 4730, color: '#8b5cf6', votes: 712, userVote: 0 },
  { id: 'southern-comfort-food', name: 'SouthernComfortFood', description: 'Soul food, biscuits and BBQ across the South', memberCount: 3980, color: '#ec4899', votes: 564, userVote: 0 },
  { id: 'pnw-coffee', name: 'PNWCoffee', description: 'Third-wave coffee and roasters in the Pacific Northwest', memberCount: 3120, color: '#f97316', votes: 489, userVote: 0 },
  { id: 'local-services', name: 'LocalServices', description: 'Trusted local service providers', memberCount: 956, color: '#3b82f6', votes: 184, userVote: 0 },
];

const SEED_THREADS: Thread[] = [
  { id: 't1', communityId: 'richmondhill-eats', communityName: 'RichmondHillEats', title: 'Best hidden-gem bakery near Yonge & 16th?', content: 'Looking for a great bakery for weekend brunch. Hidden gems welcome — the more off the beaten path the better.', author: 'localfoodie', votes: 128, userVote: 0, commentCount: 34, createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 't2', communityId: 'texas-steak-lovers', communityName: 'TexasSteakLovers', title: 'Franklin BBQ vs the new Austin pop-ups — worth the 3-hour line?', content: 'Visiting Austin next month. Is Franklin still the gold standard, or are the newer pop-up pits actually better brisket these days?', author: 'briskethunter', votes: 412, userVote: 0, commentCount: 88, createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 't3', communityId: 'nyc-eats', communityName: 'NYCEats', title: 'Best $1.50 slice that is somehow still good in 2026?', content: 'Inflation is brutal but I refuse to give up the dollar-ish slice. Which spots still hold it down across the five boroughs?', author: 'slicelife', votes: 356, userVote: 0, commentCount: 121, createdAt: new Date(Date.now() - 3600000 * 14).toISOString() },
  { id: 't4', communityId: 'california-foodies', communityName: 'CaliforniaFoodies', title: 'Best taco truck in the Mission right now?', content: 'In SF for the week and chasing the best al pastor. Truck recommendations only — no sit-down places. Bonus points for late-night.', author: 'tacotuesday', votes: 198, userVote: 0, commentCount: 53, createdAt: new Date(Date.now() - 3600000 * 22).toISOString() },
  { id: 't5', communityId: 'chicago-deep-dish', communityName: 'ChicagoDeepDish', title: 'Lou Malnati’s vs Giordano’s — settle it', content: 'Hosting out-of-towners and can only do one deep dish night. Which one represents Chicago best? Convince me.', author: 'windycityeats', votes: 287, userVote: 0, commentCount: 96, createdAt: new Date(Date.now() - 3600000 * 30).toISOString() },
  { id: 't6', communityId: 'southern-comfort-food', communityName: 'SouthernComfortFood', title: 'Best fried chicken biscuit in Nashville?', content: 'Hot chicken gets all the attention but I want the perfect fried chicken biscuit. Where do the locals actually go?', author: 'biscuitqueen', votes: 164, userVote: 0, commentCount: 44, createdAt: new Date(Date.now() - 3600000 * 38).toISOString() },
  { id: 't7', communityId: 'pnw-coffee', communityName: 'PNWCoffee', title: 'Underrated Seattle roaster that beats the big names?', content: 'Tired of the usual suspects. Which small-batch roaster in the PNW is quietly doing the best work right now?', author: 'pourover_pdx', votes: 142, userVote: 0, commentCount: 37, createdAt: new Date(Date.now() - 3600000 * 44).toISOString() },
  { id: 't8', communityId: 'support-local', communityName: 'SupportLocal', title: 'Drop your favourite independent coffee shop', content: 'Compiling a community list of the best local cafes. Chain-free only. Share your go-to spots.', author: 'beanlover', votes: 254, userVote: 0, commentCount: 91, createdAt: new Date(Date.now() - 3600000 * 50).toISOString() },
  { id: 't9', communityId: 'local-services', communityName: 'LocalServices', title: 'Reliable HVAC for a furnace tune-up before winter?', content: 'Need a trustworthy technician for annual furnace maintenance. Budget around $150. Any recommendations in the area?', author: 'homeowner_22', votes: 86, userVote: 0, commentCount: 19, createdAt: new Date(Date.now() - 3600000 * 56).toISOString() },
];

const SEED_COMMENTS: ThreadComment[] = [
  { id: 'c1', threadId: 't1', author: 'bakery_lover', content: 'Le Croissant on Yonge is excellent — small place, authentic French-style pastries. Go on Saturday morning for the best selection.', votes: 45, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: 'c2', threadId: 't2', author: 'smokering', content: 'Franklin is still elite but the line is a part-time job. For the same quality with no wait, hit the weekend pop-ups in East Austin.', votes: 121, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 7).toISOString() },
  { id: 'c3', threadId: 't2', author: 'pitmaster_tx', content: 'Drive to Lockhart. Smitty’s and Black’s will change your life and you skip the Austin crowds entirely.', votes: 98, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: 'c4', threadId: 't3', author: 'boroughbites', content: 'Joe’s on Carmine is technically over a buck-fifty now but the slice quality is unmatched for the price. Worth it.', votes: 76, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 13).toISOString() },
  { id: 'c5', threadId: 't4', author: 'food_explorer', content: 'El Farolito at 1 AM is the answer. The al pastor off the trompo is bright and acidic — do not skip the salsa verde.', votes: 64, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 20).toISOString() },
  { id: 'c6', threadId: 't5', author: 'deepdishdan', content: 'Lou Malnati’s butter crust wins it for me every time. Giordano’s is good but Lou’s is the one I bring people to.', votes: 88, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 28).toISOString() },
  { id: 'c7', threadId: 't6', author: 'nashville_native', content: 'Skip the tourist spots — the biscuit place in East Nashville does a buttermilk fried chicken biscuit that locals swear by.', votes: 52, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 36).toISOString() },
  { id: 'c8', threadId: 't7', author: 'coffee_nerd', content: 'A small roaster in Ballard is quietly out-roasting the big names. Their single-origin Ethiopian is consistently excellent.', votes: 41, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 42).toISOString() },
  { id: 'c9', threadId: 't9', author: 'hvac_tech', content: 'Avoid the big-box service companies. Local independent techs are usually faster and more honest about what actually needs replacing.', votes: 67, userVote: 0, createdAt: new Date(Date.now() - 3600000 * 54).toISOString() },
];

interface CommunitiesContextType {
  communities: Community[];
  threads: Thread[];
  comments: ThreadComment[];
  vote: (threadId: string, direction: 1 | -1) => void;
  voteComment: (commentId: string, direction: 1 | -1) => void;
  voteCommunity: (communityId: string, direction: 1 | -1) => void;
  createCommunity: (name: string, description: string) => Community;
  createThread: (communityId: string, title: string, content: string, author: string) => Thread;
  addComment: (threadId: string, content: string, author: string) => ThreadComment;
}

const CommunitiesContext = createContext<CommunitiesContextType | null>(null);

export function CommunitiesProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>(SEED_COMMUNITIES);
  const [threads, setThreads] = useState<Thread[]>(SEED_THREADS);
  const [comments, setComments] = useState<ThreadComment[]>(SEED_COMMENTS);

  const vote = (threadId: string, direction: 1 | -1) => {
    setThreads(prev => prev.map(t => {
      if (t.id !== threadId) return t;
      const newVote: 0 | 1 | -1 = t.userVote === direction ? 0 : direction;
      const delta = newVote - t.userVote;
      return { ...t, votes: t.votes + delta, userVote: newVote };
    }));
  };

  const voteComment = (commentId: string, direction: 1 | -1) => {
    setComments(prev => prev.map(c => {
      if (c.id !== commentId) return c;
      const newVote: 0 | 1 | -1 = c.userVote === direction ? 0 : direction;
      const delta = newVote - c.userVote;
      return { ...c, votes: c.votes + delta, userVote: newVote };
    }));
  };

  const voteCommunity = (communityId: string, direction: 1 | -1) => {
    setCommunities(prev => prev.map(c => {
      if (c.id !== communityId) return c;
      const newVote: 0 | 1 | -1 = c.userVote === direction ? 0 : direction;
      const delta = newVote - c.userVote;
      return { ...c, votes: c.votes + delta, userVote: newVote };
    }));
  };

  const createCommunity = (name: string, description: string): Community => {
    const community: Community = {
      id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: name.replace(/\s+/g, ''),
      description,
      memberCount: 1,
      color: '#f97316',
      votes: 1,
      userVote: 1,
    };
    setCommunities(prev => [community, ...prev]);
    return community;
  };

  const createThread = (communityId: string, title: string, content: string, author: string): Thread => {
    const community = communities.find(c => c.id === communityId);
    const thread: Thread = {
      id: `t-${Date.now()}`,
      communityId,
      communityName: community?.name || communityId,
      title,
      content,
      author,
      votes: 1,
      userVote: 1,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };
    setThreads(prev => [thread, ...prev]);
    return thread;
  };

  const addComment = (threadId: string, content: string, author: string): ThreadComment => {
    const comment: ThreadComment = {
      id: `c-${Date.now()}`,
      threadId,
      author,
      content,
      votes: 1,
      userVote: 1,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, comment]);
    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, commentCount: t.commentCount + 1 } : t
    ));
    return comment;
  };

  return (
    <CommunitiesContext.Provider value={{ communities, threads, comments, vote, voteComment, voteCommunity, createCommunity, createThread, addComment }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunities() {
  const ctx = useContext(CommunitiesContext);
  if (!ctx) throw new Error('useCommunities must be used inside CommunitiesProvider');
  return ctx;
}
