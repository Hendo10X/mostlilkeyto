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
}

// In-memory fallback for local development or if KV fails
const globalStore = global as unknown as { polls: Record<string, Poll> };
if (!globalStore.polls) {
  globalStore.polls = {};
}
const polls = globalStore.polls;

// Initialize Redis if env vars are present
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = Redis.fromEnv();
  } catch (e) {
    console.error("Failed to initialize Redis client:", e);
  }
}

export const createPoll = async (question: string, options: string[]): Promise<string> => {
  const id = nanoid(10);
  const poll: Poll = {
    id,
    question,
    options: options.map(opt => ({ id: nanoid(), text: opt, votes: 0 })),
    createdAt: Date.now(),
    voters: [],
  };
  
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
