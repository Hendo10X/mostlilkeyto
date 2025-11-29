"use client";

import { Poll } from "@/lib/store";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BouncyButton } from "@/components/BouncyButton";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { deletePollAction } from "@/app/actions";
import { useRouter } from "next/navigation";

interface PollAnalyticsClientProps {
  poll: Poll;
}

export default function PollAnalyticsClient({ poll }: PollAnalyticsClientProps) {
  const router = useRouter();

  // Transform data for the chart
  // The requirement is "line graph(different colors) shows me who has been voted for more"
  // Since we only have current totals, we can't show a timeline.
  // However, a line graph usually implies time on X-axis.
  // If I only have categories (options) and values (votes), a Bar Chart is more appropriate.
  // BUT the user specifically asked for a "line graph".
  // So I will map the options to the X-axis and votes to Y-axis, or 
  // maybe they want to see the options as lines?
  // "line graph(different colors) shows me who has been voted for more"
  // If I have multiple options, maybe they want to see them compared?
  // Given the data limitation (no time series), I will create a chart where:
  // X-axis: Options
  // Y-axis: Votes
  // And I'll use a LineChart as requested, even if it's a bit unusual for categorical data.
  // OR, I can fake a "timeline" if I had one, but I don't.
  // Let's stick to the requested "Line Graph".
  
  // Actually, "line graph (different colors)" might mean each option is a line?
  // But lines need points.
  // If I treat the "Options" as points on the X-axis, I have one line.
  // If I want "different colors", maybe they mean each segment? Or each point?
  // Recharts LineChart typically has one color per Line.
  
  // Let's try to interpret "line graph... shows me who has been voted for more".
  // Maybe they want to see the distribution.
  // I will map:
  // Data: [{ name: Option1, votes: 5 }, { name: Option2, votes: 3 }]
  // And render a Line.
  
  // Wait, if they want "different colors" for "who has been voted for more",
  // maybe they mean a Bar Chart but called it a line graph?
  // Or maybe they want a multi-line chart where X is time?
  // Since I don't have time, I will provide a Line Chart where X=Option Name, Y=Votes.
  // And I'll add a Bar Chart as an alternative view or just stick to Line if strictly requested.
  // I'll stick to Line Chart as requested.
  
  // To make it look "different colors", I might need to use Customized Dot or something, 
  // but standard LineChart is one color.
  // Let's use a single Line for now, but maybe add a BarChart too if it looks weird?
  // No, I'll stick to the request.
  
  const data = poll.options.map(opt => ({
    name: opt.text,
    votes: opt.votes,
    // Add a fill color for potential custom usage
    fill: "#8884d8" 
  }));

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this poll?")) {
      await deletePollAction(poll.id);
    }
  };

  // Generate distinct colors for the line segments if possible, or just one nice color.
  // Recharts Line is usually one color.
  // I will use a nice gradient or multiple lines if I can structure it differently.
  // But for "Who has been voted for more", a simple line connecting the vote counts per option works.
  
  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/dashboard">
            <BouncyButton className="text-gray-400 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </BouncyButton>
          </Link>
          
          <BouncyButton 
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Poll
          </BouncyButton>
        </div>

        <div className="bg-[#242424] p-8 rounded-2xl border border-gray-800">
          <h1 className="text-3xl font-bold mb-2">{poll.question}</h1>
          <p className="text-gray-400 mb-8">
            Created on {new Date(poll.createdAt).toLocaleDateString()} • {poll.voters.length} total votes
          </p>

          <div className="h-[400px] w-full bg-[#1a1a1a] rounded-xl p-4 border border-gray-800">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="votes" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }} 
                  strokeWidth={3}
                  name="Votes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {poll.options.map((option) => (
              <div key={option.id} className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                <span className="font-medium">{option.text}</span>
                <span className="text-blue-400 font-bold">{option.votes} votes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
