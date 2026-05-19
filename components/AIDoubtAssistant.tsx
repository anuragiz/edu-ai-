"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, X, Minimize2, Maximize2 } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIDoubtAssistantProps {
  context: {
    courseTitle: string;
    moduleTitle: string;
    moduleType: string;
    contentSummary: string;
  };
}

export function AIDoubtAssistant({ context }: AIDoubtAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi there! I'm your AI tutor for ${context.courseTitle}. Do you have any questions about ${context.moduleTitle}?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
          context: context
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // If not expanded, show a floating bubble or small banner instead of the full sidebar when on mobile
  // But on desktop, we might want it in-line. Let's make it a sidebar toggle.
  
  return (
    <div className={`flex flex-col h-full bg-white border-l border-gray-200 shadow-xl transition-all duration-300 ${isExpanded ? 'fixed inset-y-0 right-0 w-full md:w-96 z-50' : 'w-full md:w-80 relative'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 text-blue-800">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Tutor</h3>
        </div>
        <div className="flex items-center gap-2 md:hidden">
            <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
                {isExpanded ? <Minimize2 className="h-4 w-4"/> : <Maximize2 className="h-4 w-4"/>}
            </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600' : 'bg-indigo-600'}`}>
                {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
              </div>
              <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white shadow-sm border border-gray-100 text-gray-800 rounded-tl-none'}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[80%]">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                <span className="text-sm text-gray-500 font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-400 mt-2">
          AI may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
