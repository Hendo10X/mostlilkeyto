import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#1a1a1a] text-white px-6">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <h1 className="text-7xl font-bold tracking-tighter sm:text-9xl">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Page not found
        </h2>
        <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 text-balance break-words">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been
          removed, renamed, or doesn&apos;t exist.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg" className="text-black rounded-full bg-white hover:bg-grey-100">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
