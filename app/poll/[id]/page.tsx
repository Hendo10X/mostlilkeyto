import { getPoll, votePoll } from "@/lib/store";
import { notFound } from "next/navigation";
import PollClient from "./poll-client";

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await getPoll(id);

  if (!poll) {
    notFound();
  }

  return <PollClient poll={poll} />;
}
