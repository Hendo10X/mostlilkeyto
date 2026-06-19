"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Plus, BarChart2, Calendar } from "lucide-react";
import { getUserPollsAction } from "@/app/actions";
import { Poll } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserMenu } from "@/components/UserMenu";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DashboardPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolls() {
      try {
        setPolls(await getUserPollsAction());
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPolls();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 font-sans text-foreground md:p-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="rounded-full transition-transform active:scale-[0.96]"
            >
              <Link href="/create">
                <Plus data-icon="inline-start" />
                Create New
              </Link>
            </Button>
            <UserMenu showDashboard={false} />
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="h-44">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardFooter className="mt-auto gap-2">
                  <Skeleton className="h-5 w-20" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <Empty className="rounded-3xl border border-border bg-card py-20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BarChart2 />
              </EmptyMedia>
              <EmptyTitle>No polls yet</EmptyTitle>
              <EmptyDescription>
                Create your first poll to start collecting predictions.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                asChild
                className="rounded-full transition-transform active:scale-[0.96]"
              >
                <Link href="/create">Create Poll</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link href={`/dashboard/poll/${poll.id}`} className="group block h-full">
                  <Card className="h-full transition-colors hover:border-primary/50">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                        {poll.question}
                      </CardTitle>
                    </CardHeader>
                    <CardFooter className="mt-auto flex-col items-start gap-3">
                      <Badge variant="secondary" className="gap-1.5">
                        <BarChart2 />
                        <span className="tabular-nums">
                          {poll.voters.length} votes
                        </span>
                      </Badge>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span className="tabular-nums">
                          {new Date(poll.createdAt).toLocaleDateString()}
                        </span>
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
