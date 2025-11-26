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

export const createPoll = async (question: string, options: string[]): Promise<string> => {
  const id = nanoid(10);
  const poll: Poll = {
    id,
    question,
    options: options.map(opt => ({ id: nanoid(), text: opt, votes: 0 })),
    createdAt: Date.now(),
    voters: [],
  };
  
  await kv.set(`poll:${id}`, poll);
  return id;
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  try {
    const poll = await kv.get<Poll>(`poll:${id}`);
    return poll;
  } catch (error) {
    console.error("Failed to fetch poll:", error);
    return null;
  }
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
        
        await kv.set(`poll:${pollId}`, poll);
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
  await kv.del(`poll:${id}`);
};
