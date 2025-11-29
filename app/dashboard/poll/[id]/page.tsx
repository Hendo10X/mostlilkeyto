import { getPollAction } from "@/app/actions";
import PollAnalyticsClient from "./poll-client";
import { redirect } from "next/navigation";

export default async function PollAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = await getPollAction(id);

  if (!poll) {
    redirect("/dashboard");
  }

  return <PollAnalyticsClient poll={poll} />;
}
