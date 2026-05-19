"use client";

import Link from "next/link";
import { BookOpen, PlayCircle, Plus, BookMarked, Users, Flame, Award, Medal, Bot } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [recentDiscussions, setRecentDiscussions] = useState<any[]>([]);
  const [recentBooks, setRecentBooks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        const discussionsQ = query(collection(db, "discussions"), orderBy("createdAt", "desc"), limit(3));
        const discussionsSnapshot = await getDocs(discussionsQ);
        const fetchedDiscussions = discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentDiscussions(fetchedDiscussions);

        const booksQ = query(collection(db, "books"), orderBy("createdAt", "desc"), limit(3));
        const booksSnapshot = await getDocs(booksQ);
        const fetchedBooks = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentBooks(fetchedBooks);

      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, "discussions / books");
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to EduAI</h1>
        <p className="text-xl text-gray-600 mb-8">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display">Welcome back, {user.displayName || 'Student'}</h1>
          <p className="text-gray-500 mt-1">Pick up where you left off or start something new.</p>
        </div>
        <Link href="/ai-mentor" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm">
          <Bot className="w-5 h-5" />
          Chat with AI Mentor
        </Link>
      </header>

      {/* Quick Links / Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-10">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-sm text-white p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6 font-semibold">
            <Bot className="h-6 w-6" />
            <h3>Your Personal Tutor</h3>
          </div>
          <p className="text-blue-100 text-sm mb-4">Learn any topic at your own pace with our AI mentor.</p>
          <Link href="/ai-mentor" className="inline-flex max-w-max items-center text-sm font-medium bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Start Session
          </Link>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-fuchsia-700 rounded-xl shadow-sm text-white p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6 font-semibold">
             <BookMarked className="h-6 w-6" />
             <h3>Public Library</h3>
          </div>
          <p className="text-purple-100 text-sm mb-4">Explore books and resources added by the community.</p>
           <Link href="/library" className="inline-flex max-w-max items-center text-sm font-medium bg-white text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors">
            Browse Library
          </Link>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm text-white p-6 flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-6 font-semibold">
             <Users className="h-6 w-6" />
             <h3>Community Forums</h3>
          </div>
          <p className="text-orange-100 text-sm mb-4">Join discussions, ask questions, and share knowledge.</p>
           <Link href="/community" className="inline-flex max-w-max items-center text-sm font-medium bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
            View Discussions
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Recent Books */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-display">Recent in Library</h2>
            <Link href="/library" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          {recentBooks.length > 0 ? (
            <div className="space-y-4">
              {recentBooks.map((book) => (
                <div key={book.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <h3 className="font-semibold text-gray-900">{book.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-1">{book.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Added by {book.authorName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
               No books added yet.
            </div>
          )}
        </div>

        {/* Recent Discussions */}
        <div>
           <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 font-display">Community Buzz</h2>
            <Link href="/community" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
           {recentDiscussions.length > 0 ? (
            <div className="space-y-4">
              {recentDiscussions.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <h3 className="font-semibold text-gray-900">{post.title}</h3>
                  <div className="flex gap-2 mt-2">
                     {post.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                          {tag}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
               No discussions started yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
