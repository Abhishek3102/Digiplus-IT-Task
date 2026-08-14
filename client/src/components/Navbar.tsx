"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-black/50 border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              DigiPlus Desk
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all">
                  Log in
                </button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <>
                <Link href="/dashboard" className="text-sm font-medium text-gray-300 hover:text-white transition-colors mr-4">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
