"use server";

import { createPoll, getPoll, votePoll, deletePoll, getUserPolls } from "@/lib/store";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import { currentUser } from "@clerk/nextjs/server";

export async function createPollAction(question: string, options: string[]) {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User must be signed in to create a poll");
  }

  const creatorName = user.fullName || user.username || "Anonymous";
  const id = await createPoll(question, options.filter(o => o.trim() !== ""), user.id, creatorName);
  return id;
}

export async function voteAction(pollId: string, optionId: string) {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  const success = await votePoll(pollId, optionId, userId);
  if (!success) {
    // User already voted or poll not found
    return getPoll(pollId); // Return current state without changes
  }
  return getPoll(pollId);
}

export async function deletePollAction(id: string) {
  await deletePoll(id);
  redirect("/");
}

export async function getUserPollsAction() {
  const user = await currentUser();
  
  if (!user) {
    throw new Error("User must be signed in to view their polls");
  }

  return getUserPolls(user.id);
}

export async function getPollAction(id: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("User must be signed in");
  }
  // Verify ownership? The requirement didn't explicitly say only the author can see analytics, 
  // but "author of a poll can to see all my polls and a line graph" implies ownership.
  // For now I will just return the poll, and the UI will handle showing it. 
  // Ideally we should check if poll.creatorId === user.id
  
  const poll = await getPoll(id);
  if (!poll) return null;
  
  if (poll.creatorId !== user.id) {
    throw new Error("Unauthorized");
  }
  
  return poll;
}
