import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  return (
    <Link 
      href="/" 
      className="absolute top-4 left-4 z-50 flex items-center gap-1 text-gray-400 hover:text-white transition-colors group"
    >
      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
      <span className="font-medium">Back</span>
    </Link>
  );
}
