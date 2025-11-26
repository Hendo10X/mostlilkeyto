import { nanoid } from 'nanoid';

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

// In-memory store
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
  polls[id] = poll;
  return id;
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  return polls[id] || null;
};

export const votePoll = async (pollId: string, optionId: string, userId: string): Promise<boolean> => {
  const poll = polls[pollId];
  if (poll) {
    if (poll.voters.includes(userId)) {
      return false;
    }
    const option = poll.options.find(o => o.id === optionId);
    if (option) {
      option.votes += 1;
      poll.voters.push(userId);
      return true;
    }
  }
  return false;
};

export const deletePoll = async (id: string): Promise<void> => {
  delete polls[id];
};
