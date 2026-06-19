import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { polls, pollOptions, pollVotes } from "@/lib/db/schema";

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

export const createPoll = async (
  question: string,
  options: string[],
  creatorId: string,
  creatorName: string,
): Promise<string> => {
  const id = nanoid(10);

  await db.transaction(async (tx) => {
    await tx.insert(polls).values({
      id,
      question,
      creatorId,
      creatorName,
      createdAt: new Date(),
    });

    if (options.length > 0) {
      await tx.insert(pollOptions).values(
        options.map((text, position) => ({
          id: nanoid(),
          pollId: id,
          text,
          position,
        })),
      );
    }
  });

  return id;
};

export const getPoll = async (id: string): Promise<Poll | null> => {
  const [poll] = await db.select().from(polls).where(eq(polls.id, id)).limit(1);
  if (!poll) return null;

  const options = await db
    .select()
    .from(pollOptions)
    .where(eq(pollOptions.pollId, id))
    .orderBy(pollOptions.position);

  const votes = await db
    .select({ optionId: pollVotes.optionId, userId: pollVotes.userId })
    .from(pollVotes)
    .where(eq(pollVotes.pollId, id));

  const countByOption = new Map<string, number>();
  for (const v of votes) {
    countByOption.set(v.optionId, (countByOption.get(v.optionId) ?? 0) + 1);
  }

  return {
    id: poll.id,
    question: poll.question,
    createdAt: poll.createdAt.getTime(),
    creatorId: poll.creatorId,
    creatorName: poll.creatorName,
    voters: votes.map((v) => v.userId),
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: countByOption.get(o.id) ?? 0,
    })),
  };
};

export const votePoll = async (
  pollId: string,
  optionId: string,
  userId: string,
): Promise<boolean> => {
  try {
    await db.insert(pollVotes).values({
      id: nanoid(),
      pollId,
      optionId,
      userId,
    });
    return true;
  } catch {
    // Unique constraint (pollId, userId) → user already voted, or invalid refs.
    return false;
  }
};

export const deletePoll = async (id: string): Promise<void> => {
  // Cascades remove poll_options and poll_votes.
  await db.delete(polls).where(eq(polls.id, id));
};

export const getUserPolls = async (userId: string): Promise<Poll[]> => {
  const rows = await db
    .select()
    .from(polls)
    .where(eq(polls.creatorId, userId))
    .orderBy(desc(polls.createdAt));

  const result = await Promise.all(rows.map((row) => getPoll(row.id)));
  return result.filter((p): p is Poll => p !== null);
};
