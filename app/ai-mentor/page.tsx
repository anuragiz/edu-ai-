"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, BookOpen, BrainCircuit, GraduationCap, Settings, Key, X } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your personal AI Learning Companion. We can discuss your career goals, I can create a customized study plan for you, test you on concepts, or explain difficult topics. \n\nWhat would you like to learn today?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages,
          context: {
            courseTitle: "General AI Mentorship",
            moduleTitle: "Study Planning and Peer Discussion",
            moduleType: "Chat",
            contentSummary: "The user is talking to their overall AI mentor outside of a specific course setting. You are their guide, helping them decide what to learn next or revising a complex topic."
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I'm having a little trouble connecting right now. Let's try again in a moment. Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Create a study plan for System Design",
    "Quiz me on React concepts",
    "Explain Neural Networks simply",
    "What should I learn to become a Full-Stack Dev?"
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            AI Learning Mentor
          </h1>
          <p className="text-gray-500 mt-1">Your 24/7 personal tutor, study buddy, and career guide.</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 bg-gray-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex-shrink-0 h-10 w-10 mt-1 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-indigo-600 to-purple-600'}`}>
                  {msg.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[80%]">
                <div className="flex-shrink-0 mt-1 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 rounded-tl-none flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                  <span className="text-gray-500 font-medium">Tutor is analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for an explanation, request a quiz, or discuss your study plan..."
              className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-300 bg-gray-50 focus:bg-white text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-3 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition shadow-sm"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          <div className="mt-3 text-center flex items-center justify-center gap-6 text-xs text-gray-500 font-medium">
            <span className="flex items-center gap-1"><BrainCircuit className="h-3.5 w-3.5" /> Context-aware answers</span>
            <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> Step-by-step guidance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
