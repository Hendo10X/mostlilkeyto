import { nanoid } from 'nanoid';
import { Redis } from '@upstash/redis';

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: number;
  voters: string[];
  creatorId: string;
  creatorName: string;
}

// In-memory fallback for local development or if KV fails
const globalStore = global as unknown as { polls: Record<string, Poll>; redis?: Redis };
if (!globalStore.polls) {
  globalStore.polls = {};
}
const polls = globalStore.polls;

// Lazy Redis initialization - only create when first needed
function getRedis(): Redis | null {
  if (globalStore.redis) {
    return globalStore.redis;
  }
  
  // Check for Upstash Redis variables
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      console.log('[Redis] Initializing Redis client with UPSTASH_REDIS vars...');
      globalStore.redis = Redis.fromEnv();
      console.log('[Redis] Successfully initialized');
      return globalStore.redis;
    } catch (e) {
      console.error("[Redis] Failed to initialize with UPSTASH vars:", e);
    }
  }

  // Check for Vercel KV variables (fallback)
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      console.log('[Redis] Initializing Redis client with KV vars...');
      globalStore.redis = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      });
      console.log('[Redis] Successfully initialized with KV vars');
      return globalStore.redis;
    } catch (e) {
      console.error("[Redis] Failed to initialize with KV vars:", e);
    }
  }

  // Check for DATABASE_KV variables (User provided specific names)
  if (process.env.DATABASE_KV_REST_API_URL && process.env.DATABASE_KV_REST_API_TOKEN) {
    try {
      console.log('[Redis] Initializing Redis client with DATABASE_KV vars...');
      globalStore.redis = new Redis({
        url: process.env.DATABASE_KV_REST_API_URL,
        token: process.env.DATABASE_KV_REST_API_TOKEN,
      });
      console.log('[Redis] Successfully initialized with DATABASE_KV vars');
      return globalStore.redis;
    } catch (e) {
      console.error("[Redis] Failed to initialize with DATABASE_KV vars:", e);
    }
  }
  
  console.log('[Redis] Env vars not found. UPSTASH:', !!process.env.UPSTASH_REDIS_REST_URL, 'KV:', !!process.env.KV_REST_API_URL, 'DATABASE_KV:', !!process.env.DATABASE_KV_REST_API_URL);
  console.log('[Redis] Using in-memory storage (data will not persist)');
  return null;
}

export const createPoll = async (question: string, options: string[], creatorId: string, creatorName: string): Promise<string> => {
  const id = nanoid(10);
  const poll: Poll = {
    id,
    question,
    options: options.map(opt => ({ id: nanoid(), text: opt, votes: 0 })),
    createdAt: Date.now(),
    voters: [],
    creatorId,
    creatorName,
  };
  
  const redis = getRedis();
  
  try {
    if (redis) {
      console.log(`[createPoll] Saving to Redis: ${id}`);
      await redis.set(`poll:${id}`, poll);
    } else {
      console.log(`[createPoll] Saving to in-memory: ${id}`);
      polls[id] = poll;
    }
  } catch (error) {
    console.error("Failed to save poll to Redis, falling back to in-memory:", error);
    polls[id] = poll;
  }
  
  return id;
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  console.log(`[getPoll] Fetching: ${id}`);
  const redis = getRedis();
  
  try {
    if (redis) {
      const poll = await redis.get<Poll>(`poll:${id}`);
      if (poll) {
        console.log(`[getPoll] Found in Redis: ${id}`);
        return poll;
      }
    }
  } catch (error) {
    console.error("Failed to fetch poll from Redis:", error);
  }
  
  const memoryPoll = polls[id] || null;
  console.log(`[getPoll] Found in memory: ${!!memoryPoll}`);
  return memoryPoll;
};

export const votePoll = async (pollId: string, optionId: string, userId: string): Promise<boolean> => {
  try {
    const poll = await getPoll(pollId);
    
    if (poll) {
      if (poll.voters.includes(userId)) {
        return false;
      }
      const option = poll.options.find(o => o.id === optionId);
      if (option) {
        option.votes += 1;
        poll.voters.push(userId);
        
        const redis = getRedis();
        try {
          if (redis) {
            await redis.set(`poll:${pollId}`, poll);
          } else {
            polls[pollId] = poll;
          }
        } catch (error) {
          console.error("Failed to update poll in Redis:", error);
          polls[pollId] = poll;
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to vote:", error);
    return false;
  }
};

export const deletePoll = async (id: string): Promise<void> => {
  const redis = getRedis();
  try {
    if (redis) {
      await redis.del(`poll:${id}`);
    }
    delete polls[id];
  } catch (error) {
    console.error("Failed to delete poll from Redis:", error);
    delete polls[id];
  }
};
