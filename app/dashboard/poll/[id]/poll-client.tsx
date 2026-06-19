"use client";

import { Poll } from "@/lib/store";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { deletePollAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const chartConfig = {
  votes: {
    label: "Votes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function PollAnalyticsClient({ poll }: { poll: Poll }) {
  // One point per option — the line connects vote counts so you can read
  // which option has been voted for more at a glance.
  const data = poll.options.map((opt) => ({
    name: opt.text,
    votes: opt.votes,
  }));

  const handleDelete = async () => {
    await deletePollAction(poll.id);
  };

  return (
    <div className="min-h-screen bg-background p-6 font-sans text-foreground md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <Button asChild variant="ghost" className="active:scale-[0.96]">
            <Link href="/dashboard">
              <ArrowLeft data-icon="inline-start" />
              Back to Dashboard
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="text-destructive hover:text-destructive active:scale-[0.96]">
                <Trash2 data-icon="inline-start" />
                Delete Poll
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this poll? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle className="text-3xl">{poll.question}</CardTitle>
            <CardDescription className="tabular-nums">
              Created on {new Date(poll.createdAt).toLocaleDateString()} •{" "}
              {poll.voters.length} total votes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <ChartContainer config={chartConfig} className="h-[360px] w-full">
              <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="votes"
                  stroke="var(--color-votes)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "var(--color-votes)" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ChartContainer>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {poll.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-4"
                >
                  <span className="font-medium">{option.text}</span>
                  <Badge variant="secondary" className="tabular-nums">
                    {option.votes} votes
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
