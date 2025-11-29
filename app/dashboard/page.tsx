"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUserPollsAction } from "@/app/actions";
import { Poll } from "@/lib/store";
import { BouncyButton } from "@/components/BouncyButton";
import { motion } from "motion/react";
import { Loader2, Plus, BarChart2, Calendar } from "lucide-react";

export default function DashboardPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolls() {
      try {
        const userPolls = await getUserPollsAction();
        setPolls(userPolls);
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPolls();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Polls</h1>
          <Link href="/create">
            <BouncyButton className="bg-white text-black px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </BouncyButton>
          </Link>
        </header>

        {polls.length === 0 ? (
          <div className="text-center py-20 bg-[#242424] rounded-2xl border border-gray-800">
            <BarChart2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
            <p className="text-gray-400 mb-6">Create your first poll to start collecting predictions.</p>
            <Link href="/create">
              <BouncyButton className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Create Poll
              </BouncyButton>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/dashboard/poll/${poll.id}`}>
                  <div className="bg-[#242424] p-6 rounded-2xl border border-gray-800 hover:border-gray-600 transition-colors h-full flex flex-col group cursor-pointer">
                    <h3 className="text-xl font-semibold mb-4 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {poll.question}
                    </h3>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <BarChart2 className="w-4 h-4" />
                        <span>{poll.voters.length} votes</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(poll.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
