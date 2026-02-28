import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF8F3]">
      <div className="text-center px-6">
        <h1 className="font-['Playfair_Display'] text-6xl font-semibold text-[#3D2B1F] mb-4">
          404
        </h1>
        <p className="text-lg text-[#3D2B1F]/60 font-light mb-8">
          This page wandered off — just like a curious puppy.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#3D2B1F] text-[#FBF8F3] text-sm font-semibold tracking-wide uppercase rounded-sm hover:bg-[#2C1F15] transition-colors"
        >
          Back to the Pups
        </Link>
      </div>
    </div>
  );
}
