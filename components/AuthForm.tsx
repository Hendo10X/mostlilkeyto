"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type Mode = "sign-in" | "sign-up";

const COPY = {
  "sign-in": {
    title: "Welcome back",
    description: "Sign in to create polls and track predictions.",
    cta: "Sign in",
    alt: "Don't have an account?",
    altHref: "/sign-up",
    altCta: "Sign up",
  },
  "sign-up": {
    title: "Create your account",
    description: "Join to start polling who is most likely to.",
    cta: "Sign up",
    alt: "Already have an account?",
    altHref: "/sign-in",
    altCta: "Sign in",
  },
} as const;

function makeSchema(mode: Mode) {
  return z
    .object({
      name: z.string().optional(),
      email: z.email("Enter a valid email address."),
      password: z.string().min(8, "Password must be at least 8 characters."),
    })
    .refine(
      (v) => mode !== "sign-up" || (!!v.name && v.name.trim().length > 0),
      { message: "Please enter your name.", path: ["name"] },
    );
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/dashboard";
  const copy = COPY[mode];

  const [serverError, setServerError] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const revertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(makeSchema(mode)),
    defaultValues: { name: "", email: "", password: "" },
  });

  // transitions-dev #12 — replay the shake from a clean baseline and
  // auto-revert the error treatment after a hold. Used for server-side
  // auth failures (zod handles per-field validation inline).
  const showServerError = (message: string) => {
    setServerError(message);
    toast.error(message);

    const wrap = wrapRef.current;
    const input = inputRef.current;
    if (!wrap || !input) return;

    wrap.classList.add("is-error");
    input.classList.add("is-error");
    input.classList.remove("is-shaking");
    void input.offsetWidth; // force reflow so the keyframes restart
    input.classList.add("is-shaking");

    const shakeMs = 80 * 2 + 60 * 2;
    setTimeout(() => input.classList.remove("is-shaking"), shakeMs + 20);

    if (revertTimer.current) clearTimeout(revertTimer.current);
    revertTimer.current = setTimeout(() => {
      revertTimer.current = null;
      wrap.classList.remove("is-error");
      input.classList.remove("is-error");
      setServerError(null);
    }, shakeMs + 3000);
  };

  const clearServerError = () => {
    if (!serverError) return;
    if (revertTimer.current) {
      clearTimeout(revertTimer.current);
      revertTimer.current = null;
    }
    wrapRef.current?.classList.remove("is-error");
    inputRef.current?.classList.remove("is-error");
    setServerError(null);
  };

  const onSubmit = async (values: FormValues) => {
    clearServerError();

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({
            name: values.name!.trim(),
            email: values.email,
            password: values.password,
          })
        : await authClient.signIn.email({
            email: values.email,
            password: values.password,
          });

    if (result.error) {
      showServerError(result.error.message || "Something went wrong. Try again.");
      return;
    }

    toast.success(mode === "sign-up" ? "Account created!" : "Signed in!");
    router.push(redirectTo);
    router.refresh();
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-6 py-12">
      <div ref={wrapRef} className="t-input-wrap w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="relative block h-9 w-32">
            <Image
              src="/likesy.svg"
              alt="mostlikelyto"
              fill
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <Card ref={inputRef} className="t-input rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>

          <Form {...form}>
            <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}>
              <CardContent className="flex flex-col gap-6">
                {mode === "sign-up" && (
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Jane Doe"
                            autoComplete="name"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              clearServerError();
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            clearServerError();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          autoComplete={
                            mode === "sign-up"
                              ? "new-password"
                              : "current-password"
                          }
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            clearServerError();
                          }}
                        />
                      </FormControl>
                      {mode === "sign-up" && (
                        <FormDescription>At least 8 characters.</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <p
                  className="t-error-msg text-sm text-destructive"
                  role="alert"
                >
                  {serverError ?? "Please check your details and try again."}
                </p>
              </CardContent>

              <CardFooter className="mt-6 flex-col gap-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full transition-transform active:scale-[0.96]"
                >
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {copy.cta}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {copy.alt}{" "}
                  <Link
                    href={copy.altHref}
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    {copy.altCta}
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
