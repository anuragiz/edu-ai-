"use client";

import Link from "next/link";
import { BookOpen, Search, UserCircle, LogIn, LogOut, LayoutDashboard, Bot, Users, BookMarked, MessageSquare, Briefcase } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-6 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">EduAI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/ai-mentor" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5">
              <Bot className="h-4 w-4" />
              AI Mentor
            </Link>
            <Link href="/community" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Community
            </Link>
            <Link href="/library" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
              <BookMarked className="h-4 w-4" />
              Library
            </Link>
            {user && (
              <>
                <Link href="/my-published" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" />
                  My Published
                </Link>
                <Link href="/messages" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          {user ? (
            <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
              <span className="hidden sm:inline-block max-w-[150px] truncate">{user.displayName}</span>
              <button onClick={logout} className="flex items-center gap-1.5 text-red-600 hover:text-red-700">
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
