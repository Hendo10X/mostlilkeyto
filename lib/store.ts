import { nanoid } from 'nanoid';
import { kv } from '@vercel/kv';

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
    if (process.env.KV_URL) {
      await kv.set(`poll:${id}`, poll);
    } else {
      polls[id] = poll;
    }
  } catch (error) {
    console.error("Failed to save poll to KV, falling back to in-memory:", error);
    polls[id] = poll;
  }
  
  return id;
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  try {
    if (process.env.KV_URL) {
      const poll = await kv.get<Poll>(`poll:${id}`);
      if (poll) return poll;
    }
  } catch (error) {
    console.error("Failed to fetch poll from KV:", error);
  }
  return polls[id] || null;
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
          if (process.env.KV_URL) {
            await kv.set(`poll:${pollId}`, poll);
          } else {
            polls[pollId] = poll;
          }
        } catch (error) {
          console.error("Failed to update poll in KV:", error);
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
    if (process.env.KV_URL) {
      await kv.del(`poll:${id}`);
    }
    delete polls[id];
  } catch (error) {
    console.error("Failed to delete poll from KV:", error);
    delete polls[id];
  }
};
