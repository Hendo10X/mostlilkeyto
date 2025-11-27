"use client";

import { Poll } from "@/lib/store";
import { useState, useEffect } from "react";
import { voteAction, deletePollAction } from "../../actions"; 
import { useToast } from "@/hooks/useToast";
import { Modal } from "@/components/Modal";
import { useUser } from "@clerk/nextjs";
import { BouncyButton } from "@/components/BouncyButton";

export default function PollClient({ poll }: { poll: Poll }) {
  const [currentPoll, setCurrentPoll] = useState(poll);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const totalVotes = currentPoll.options.reduce((acc, opt) => acc + opt.votes, 0);
  const toast = useToast();
  const { user } = useUser();

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const handleVote = async (optionId: string) => {
    if (!user) {
      toast.error("You must be signed in to vote!");
      return;
    }
    const updatedPoll = await voteAction(currentPoll.id, optionId);
    if (updatedPoll) {
      const newTotalVotes = updatedPoll.options.reduce((acc, opt) => acc + opt.votes, 0);
      if (newTotalVotes === totalVotes) {
         toast.info("You have already voted on this poll.");
      } else {
         toast.success("Vote recorded!");
      }
      setCurrentPoll(updatedPoll);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
    setShowShareModal(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await deletePollAction(currentPoll.id);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex flex-col items-center p-8">
      <div className="w-full max-w-2xl space-y-8 mt-20">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Votes</h1>
          <div className="flex items-center gap-3 text-xl">
            <span className="text-gray-200">Who is more likely to</span>
            <span className="bg-[#27272a] text-green-400 px-4 py-1 rounded-full font-medium">
              {currentPoll.question}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {currentPoll.options.map((option, index) => {
            const percentage = totalVotes === 0 ? 0 : Math.round((option.votes / totalVotes) * 100);
            const colorClass = index === 0 ? "text-red-500" : index === 1 ? "text-blue-400" : "text-purple-400";
            
            return (
              <div 
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="relative bg-[#27272a] rounded-2xl p-4 cursor-pointer hover:bg-[#3f3f46] transition-colors overflow-hidden"
              >
                {/* Progress Bar Background */}
                <div 
                  className="absolute top-0 left-0 h-full bg-white/5 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
                
                <div className="relative flex justify-between items-center z-10">
                  <span className="text-gray-300 font-medium">{option.text}</span>
                  <span className={`font-bold ${colorClass}`}>{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-4 pt-4">
          <BouncyButton 
            onClick={handleShareClick}
            className="bg-[#27272a] text-gray-400 px-8 py-2.5 rounded-full font-medium text-sm hover:bg-[#3f3f46] transition-colors"
          >
            Share
          </BouncyButton>
          <BouncyButton 
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="bg-[#ff4b4b] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#ff3333] transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Poll
          </BouncyButton>
        </div>

      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Poll"
      >
        <div className="space-y-6">
          <p>Are you sure you want to delete this poll? This action cannot be undone.</p>
          <div className="flex justify-end gap-4">
            <BouncyButton
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </BouncyButton>
            <BouncyButton
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-[#ff4b4b] text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-[#ff3333] transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </BouncyButton>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share Poll"
      >
        <div className="space-y-6">
          <p className="text-gray-300">Share this link with your friends to get their votes!</p>
          <div className="flex items-center gap-2 bg-[#27272a] p-2 rounded-lg border border-gray-700">
            <input 
              readOnly 
              value={shareUrl} 
              className="bg-transparent text-gray-400 text-sm flex-1 outline-none px-2"
            />
            <BouncyButton
              onClick={handleCopyLink}
              className="bg-white text-black px-4 py-1.5 rounded-md text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              Copy
            </BouncyButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
