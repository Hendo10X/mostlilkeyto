"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";

export default function Home() {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background font-sans text-foreground">
      <header className="absolute top-6 right-6 z-50">
        <UserMenu />
      </header>

      <main className="grid w-full max-w-5xl grid-cols-1 items-center gap-12 px-6 py-20 md:px-12 lg:grid-cols-2 lg:px-16">
        <motion.div
          className="flex flex-col items-start gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <motion.div
            className="relative h-10 w-28 md:h-12 md:w-36"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/likesy.svg"
              alt="mostlikelyto logo"
              fill
              className="object-contain object-left"
              priority
            />
          </motion.div>

          {/* Text content */}
          <motion.p
            className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Likesy is a social polling and prediction platform designed around
            answering the question: &quot;Who is most likely to...?&quot; Unlike
            traditional surveys that ask for opinions, this app is built for
            users to cast predictions on future actions, outcomes, or behaviors,
            thereby creating a community score on the perceived likelihood of an
            event.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              asChild
              size="lg"
              className="rounded-full transition-transform active:scale-[0.96]"
            >
              <Link href="/create">Create new poll</Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero image */}
        <motion.div
          className="relative hidden h-[400px] w-full lg:block lg:h-[500px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src="/mlt.svg"
            alt="Social polling visualization"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </main>
    </div>
  );
}
