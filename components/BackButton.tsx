import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  return (
    <Link
      href="/"
      className="group absolute top-6 left-6 z-50 flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft
        size={20}
        className="transition-transform group-hover:-translate-x-1"
      />
      <span className="font-medium">Back</span>
    </Link>
  );
}
