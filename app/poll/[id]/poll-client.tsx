"use client";

import { Poll } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Share2, Trash2, Copy } from "lucide-react";
import { voteAction, deletePollAction } from "../../actions";
import { useSession } from "@/lib/auth-client";
import { PopNumber } from "@/components/PopNumber";
import { VoteSuccess } from "@/components/VoteSuccess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const CHART_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function PollClient({ poll }: { poll: Poll }) {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [prevPoll, setPrevPoll] = useState(poll);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.href : "",
  );
  const [successTick, setSuccessTick] = useState(0);

  const router = useRouter();
  const { data: session } = useSession();
  const totalVotes = currentPoll.options.reduce((acc, o) => acc + o.votes, 0);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync to fresh server data when router.refresh() returns a new poll —
  // adjusting state during render (React's recommended pattern) instead of
  // an effect, so optimistic vote updates are reconciled with the server.
  if (poll !== prevPoll) {
    setPrevPoll(poll);
    setCurrentPoll(poll);
  }

  // Poll for live updates.
  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 2000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const celebrate = () => {
    setSuccessTick((t) => t + 1);
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccessTick(0), 1300);
  };

  const handleVote = async (optionId: string) => {
    if (!session) {
      toast.error("You must be signed in to vote!");
      return;
    }
    const updated = await voteAction(currentPoll.id, optionId);
    if (!updated) return;

    const newTotal = updated.options.reduce((acc, o) => acc + o.votes, 0);
    if (newTotal === totalVotes) {
      toast.info("You have already voted on this poll.");
    } else {
      toast.success("Vote recorded!");
      celebrate();
    }
    setCurrentPoll(updated);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deletePollAction(currentPoll.id);
  };

  const isOwner = session?.user.id === currentPoll.creatorId;

  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-8 font-sans text-foreground">
      <VoteSuccess show={successTick > 0} />

      <div className="mt-20 w-full max-w-2xl">
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-bold">Votes</h1>
            {currentPoll.creatorName && (
              <span className="pb-1 text-sm text-muted-foreground">
                Created by{" "}
                <span className="font-medium text-foreground">
                  {currentPoll.creatorName}
                </span>
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xl">
            <span className="text-muted-foreground">Who is more likely to</span>
            <Badge
              variant="secondary"
              className="rounded-full px-4 py-1 text-base font-medium text-primary"
            >
              {currentPoll.question}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {currentPoll.options.map((option, index) => {
            const percentage =
              totalVotes === 0
                ? 0
                : Math.round((option.votes / totalVotes) * 100);
            const accent = CHART_VARS[index % CHART_VARS.length];

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="relative overflow-hidden rounded-2xl bg-card p-4 text-left transition-[background-color,transform] hover:bg-accent active:scale-[0.99]"
              >
                <div
                  className="absolute top-0 left-0 h-full transition-[width] duration-500"
                  style={{ width: `${percentage}%`, backgroundColor: accent, opacity: 0.16 }}
                />
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-medium text-card-foreground">
                    {option.text}
                  </span>
                  <span className="font-bold" style={{ color: accent }}>
                    <PopNumber value={percentage} suffix="%" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            variant="secondary"
            onClick={() => setShowShareModal(true)}
            className="rounded-full transition-transform active:scale-[0.96]"
          >
            <Share2 data-icon="inline-start" />
            Share
          </Button>

          {isOwner && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  className="ml-auto rounded-full transition-transform active:scale-[0.96]"
                >
                  <Trash2 data-icon="inline-start" />
                  Delete Poll
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Poll</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this poll? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Poll</DialogTitle>
            <DialogDescription>
              Share this link with your friends to get their votes!
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input readOnly value={shareUrl} className="flex-1" />
            <Button
              onClick={handleCopyLink}
              className="transition-transform active:scale-[0.96]"
            >
              <Copy data-icon="inline-start" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
