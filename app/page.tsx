import Link from "next/link";
import { ArrowRight, Sparkles, BookMarked, Users, Bot } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white -z-10"></div>
        <div className="container mx-auto px-4 md:px-6 max-w-6xl text-center">
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8 mt-8">
            <Sparkles className="mr-2 h-4 w-4" />
            Introducing AI Learning Mentor
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 mb-6 font-display max-w-4xl mx-auto leading-tight">
            Master Any Subject with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">AI-Powered</span> Learning
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the future of education. A personalized AI mentor, an active community forum, and a public library of resources tailored to your goals.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/ai-mentor"
              className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-200"
            >
              Chat with AI Mentor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full outline outline-1 outline-gray-200 bg-white px-8 text-base font-medium text-gray-900 hover:bg-gray-50 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">24/7 AI Mentor</h3>
              <p className="text-gray-600 leading-relaxed">
                Stuck on a concept? Our deeply integrated Gemini AI assistant provides real-time explanations, creates study plans, and quizzes you.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">Active Community</h3>
              <p className="text-gray-600 leading-relaxed">
                Learn with peers. Our community forums allow you to ask questions, share your progress, and get help from other learners.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                <BookMarked className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 font-display">Public Library</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover a curated collection of resources. Add insightful books, guides, and learning materials and share them globally.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
