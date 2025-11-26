"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { motion } from "motion/react";
import { BouncyButton } from "@/components/BouncyButton";

export default function Home() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#1a1a1a] text-white font-sans relative overflow-hidden">
      <div className="absolute top-4 right-4 z-[100] flex gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <BouncyButton className="text-white hover:text-gray-300 transition-colors text-sm md:text-base font-medium">
              Sign In
            </BouncyButton>
          </SignInButton>
          <SignUpButton mode="modal">
            <BouncyButton className="bg-white text-black px-4 py-2 md:px-5 md:py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base shadow-lg">
              Sign Up
            </BouncyButton>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/"/>
        </SignedIn>
      </div>
      <main className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center px-6 py-20 md:px-12 lg:px-16">
        <motion.div 
          className="space-y-8 flex flex-col items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div 
            className="relative w-36 h-12 md:w-48 md:h-16"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
             <Image
              src="/MLTlogo.svg"
              alt="mostlikelyto logo"
              fill
              className="object-contain object-left"
              priority
            />
          </motion.div>

          {/* Text Content */}
          <motion.div 
            className="space-y-4 max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-base md:text-lg text-gray-400 leading-relaxed">
              is a social polling and prediction platform designed around answering the question: &quot;Who is most likely to...?&quot; Unlike traditional surveys that ask for opinions, this app is built for users to cast predictions on future actions, outcomes, or behaviors, thereby creating a community score on the perceived likelihood of an event.
            </p>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link href="/create">
              <BouncyButton className="bg-white text-black px-6 py-3 rounded-full font-medium text-sm md:text-base hover:bg-gray-100 transition-colors">
                Create new poll
              </BouncyButton>
            </Link>
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          className="hidden lg:block relative w-full h-[400px] lg:h-[500px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
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
