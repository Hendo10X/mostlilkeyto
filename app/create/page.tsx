"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createPollAction } from "../actions";
import { BackButton } from "@/components/BackButton";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";

const SUGGESTIONS = [
  "buy a lambo",
  "get a girlfriend",
  "purchase Bitcoin",
  "start a business",
  "leave town",
  "become famous",
];

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const formRef = useRef<HTMLDivElement>(null);

  const filtered = SUGGESTIONS.filter(
    (s) => s.toLowerCase() !== question.trim().toLowerCase(),
  );

  const handleOptionChange = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const addOption = () => setOptions((prev) => [...prev, ""]);

  const deleteOption = (index: number) => {
    setOptions((prev) =>
      prev.length > 2 ? prev.filter((_, i) => i !== index) : prev,
    );
  };

  // transitions-dev #12 — shake the form when the input is invalid.
  const shake = () => {
    const el = formRef.current;
    if (!el) return;
    el.classList.remove("is-shaking");
    void el.offsetWidth;
    el.classList.add("is-shaking");
    setTimeout(() => el.classList.remove("is-shaking"), 300);
  };

  const handleCreatePoll = async () => {
    const validOptions = options.filter((o) => o.trim() !== "");
    if (!question.trim() || validOptions.length < 2) {
      shake();
      toast.error("Add a question and at least two options.");
      return;
    }

    setIsCreating(true);
    try {
      const id = await createPollAction(question, options);
      router.push(`/poll/${id}`);
    } catch (error) {
      console.error("Failed to create poll:", error);
      setIsCreating(false);
      toast.error("Failed to create poll. Please try again.");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center bg-background p-8 font-sans text-foreground">
      <BackButton />
      <header className="absolute top-6 right-6 z-50">
        <UserMenu showDashboard={false} />
      </header>

      <div ref={formRef} className="t-input mt-20 w-full max-w-2xl">
        <FieldGroup className="gap-12">
          <h1 className="text-3xl font-bold">Create poll</h1>

          {/* Question */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <span className="text-center text-2xl font-bold text-foreground md:text-left md:text-xl md:font-normal md:text-muted-foreground">
              Who is more likely to
            </span>
            <Popover open={showSuggestions && filtered.length > 0}>
              <PopoverAnchor asChild>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSuggestions(false), 150)
                  }
                  className="flex-1 rounded-full text-primary md:text-base"
                  placeholder="type here..."
                  aria-label="Poll question"
                />
              </PopoverAnchor>
              <PopoverContent
                align="start"
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-[var(--radix-popover-trigger-width)] p-1"
              >
                <div className="flex flex-col">
                  {filtered.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuestion(suggestion);
                        setShowSuggestions(false);
                      }}
                      className="rounded-md px-3 py-2 text-left text-sm text-primary transition-colors hover:bg-accent"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Options */}
          <FieldSet>
            <FieldLegend>Options</FieldLegend>
            <FieldGroup className="gap-4">
              {options.map((option, index) => (
                <Field
                  key={index}
                  orientation="horizontal"
                  className="items-center gap-3"
                >
                  <FieldLabel htmlFor={`option-${index}`} className="sr-only">
                    Option {index + 1}
                  </FieldLabel>
                  <Input
                    id={`option-${index}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteOption(index)}
                      className="text-destructive transition-transform hover:bg-destructive/10 active:scale-[0.96]"
                      aria-label={`Delete option ${index + 1}`}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </Field>
              ))}
            </FieldGroup>
          </FieldSet>

          {/* Footer */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={addOption}
              className="rounded-full transition-transform active:scale-[0.96]"
            >
              <Plus data-icon="inline-start" />
              Add more
            </Button>
            <Button
              type="button"
              onClick={handleCreatePoll}
              disabled={isCreating}
              className="rounded-full font-bold transition-transform active:scale-[0.96]"
            >
              {isCreating && <Spinner data-icon="inline-start" />}
              {isCreating ? "Creating..." : "Create poll"}
            </Button>
          </div>
        </FieldGroup>
      </div>
    </div>
  );
}
