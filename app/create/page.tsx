"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPollAction } from "../actions";
import { UserButton, useUser } from "@clerk/nextjs";
import { BackButton } from "@/components/BackButton";
import { BouncyButton } from "@/components/BouncyButton";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [options, setOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useUser();

  const suggestions = [
    "buy a lambo",
    "Get a girlfriend",
    "Purchase Bitcoin",
    "Start a business",
    "Leave town",
    "become famous",
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const deleteOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    setShowDropdown(false);
  };

  const handleCreatePoll = async () => {
    if (!question || options.every(o => !o.trim())) return;
    setIsCreating(true);
    const id = await createPollAction(question, options);
    router.push(`/poll/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex flex-col items-center p-8 relative">
      <BackButton />
      {/* User Profile - Top Right */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user.fullName}</p>
            <p className="text-xs text-gray-400">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        )}
        <UserButton afterSignOutUrl="/"/>
      </div>

      <div className="w-full max-w-2xl space-y-12 mt-20">
        
        {/* Header */}
        <h1 className="text-3xl font-bold">Create poll</h1>

        {/* Question Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 relative">
          <span className="text-xl text-gray-200 whitespace-nowrap">Who is more likely to</span>
          <div className="relative w-full md:w-auto flex-1" ref={dropdownRef}>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-[#27272a] text-green-400 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-green-500/50 transition-all placeholder-gray-500"
              placeholder="type here..."
            />
            
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-[#27272a] rounded-2xl overflow-hidden shadow-xl z-10 py-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`px-4 py-3 cursor-pointer hover:bg-[#3f3f46] transition-colors ${
                      index === 0 ? "text-green-400" :
                      index === 1 ? "text-green-400" :
                      index === 2 ? "text-red-400" :
                      index === 3 ? "text-yellow-400" :
                      index === 4 ? "text-blue-400" :
                      "text-purple-400"
                    }`}
                  >
                    {suggestion}
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>

        {/* Options Section */}
        <div className="space-y-6">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-4">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1 bg-transparent border-b border-gray-700 py-2 text-lg outline-none focus:border-gray-500 transition-colors placeholder-gray-600"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  onClick={() => deleteOption(index)}
                  className="text-red-400/60 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-4 pt-4">
          <BouncyButton
            onClick={addOption}
            className="bg-[#27272a] text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-[#3f3f46] transition-colors"
          >
            Add more
          </BouncyButton>
          <BouncyButton 
            onClick={handleCreatePoll}
            disabled={isCreating}
            className="bg-white text-black px-8 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create poll"}
          </BouncyButton>
        </div>

      </div>
    </div>
  );
}
