"use server";

import { createPoll, getPoll, votePoll, deletePoll } from "@/lib/store";
import { redirect } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

export async function createPollAction(question: string, options: string[]) {
  const id = await createPoll(question, options.filter(o => o.trim() !== ""));
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
