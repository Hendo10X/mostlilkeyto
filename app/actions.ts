"use server";

import { createPoll, getPoll, votePoll, deletePoll, getUserPolls } from "@/lib/store";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function createPollAction(question: string, options: string[]) {
  const user = await requireSession();

  if (!user) {
    throw new Error("User must be signed in to create a poll");
  }

  const creatorName = user.name || "Anonymous";
  const id = await createPoll(
    question,
    options.filter((o) => o.trim() !== ""),
    user.id,
    creatorName,
  );
  return id;
}

export async function voteAction(pollId: string, optionId: string) {
  const user = await requireSession();

  if (!user) {
    return null;
  }

  const success = await votePoll(pollId, optionId, user.id);
  if (!success) {
    // User already voted or poll not found — return current state unchanged.
    return getPoll(pollId);
  }
  return getPoll(pollId);
}

export async function deletePollAction(id: string) {
  const user = await requireSession();
  if (!user) {
    throw new Error("User must be signed in");
  }

  const poll = await getPoll(id);
  if (poll && poll.creatorId !== user.id) {
    throw new Error("Unauthorized");
  }

  await deletePoll(id);
  redirect("/");
}

export async function getUserPollsAction() {
  const user = await requireSession();

  if (!user) {
    throw new Error("User must be signed in to view their polls");
  }

  return getUserPolls(user.id);
}

export async function getPollAction(id: string) {
  const user = await requireSession();
  if (!user) {
    throw new Error("User must be signed in");
  }

  const poll = await getPoll(id);
  if (!poll) return null;

  if (poll.creatorId !== user.id) {
    throw new Error("Unauthorized");
  }

  return poll;
}
