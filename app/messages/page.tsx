"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { User, Send, MessageSquare } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

function MessagesContent() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [chats, setChats] = useState<any[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  
  const initUserId = searchParams.get("userId");
  const initUserName = searchParams.get("name");

  // Load chats
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    
    // Using snapshot for chats so sorting by updatedAt keeps list fresh
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let loadedChats = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      loadedChats.sort((a, b) => (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0));
      
      // If we have an initialized user from URL, inject a dummy chat if they aren't in the list
      if (initUserId && initUserId !== user.uid) {
        const existing = loadedChats.find(c => c.participants.includes(initUserId));
        if (existing) {
          if (!activeChatId) setActiveChatId(existing.id);
        } else {
          // Add a pseudo-chat that doesn't exist yet
          if (!loadedChats.find(c => c.id === "new_chat")) {
             loadedChats.unshift({
               id: "new_chat",
               participants: [user.uid, initUserId],
               pseudoName: initUserName,
               lastMessage: "Start a conversation",
               updatedAt: null
             });
             if (!activeChatId) setActiveChatId("new_chat");
          }
        }
      } else if (!activeChatId && loadedChats.length > 0) {
        setActiveChatId(loadedChats[0].id);
      }
      
      setChats(loadedChats);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "chats");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, initUserId, initUserName]);

  // Load messages for active chat
  useEffect(() => {
    if (!user || !activeChatId || activeChatId === "new_chat") {
      setMessages([]);
      return;
    }

    const q = query(collection(db, "chats", activeChatId, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `chats/${activeChatId}/messages`);
    });

    return () => unsubscribe();
  }, [activeChatId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChatId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      let targetChatId = activeChatId;

      // Create new chat room if this is the first message to a pseudo-chat
      if (activeChatId === "new_chat" && initUserId) {
        const docRef = await addDoc(collection(db, "chats"), {
          participants: [user.uid, initUserId],
          lastMessage: messageText,
          updatedAt: serverTimestamp()
        });
        targetChatId = docRef.id;
        setActiveChatId(targetChatId);
        // remove URL params to prevent recreation of pseudo chat on refresh
        router.replace("/messages");
      }

      await addDoc(collection(db, "chats", targetChatId, "messages"), {
        text: messageText,
        senderId: user.uid,
        createdAt: serverTimestamp()
      });

      if (targetChatId !== "new_chat") {
        await updateDoc(doc(db, "chats", targetChatId), {
          lastMessage: messageText,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "chats/messages");
    }
  };


  if (authLoading || loading) return <div className="p-10 text-center text-gray-500">Loading messages...</div>;

  if (!user) return <div className="p-10 text-center">Please sign in to view messages.</div>;

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 flex flex-col h-[calc(100vh-64px)]">
      <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm flex-1">
        
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50/50">
           <div className="p-4 border-b border-gray-200 bg-white">
             <h2 className="text-xl font-bold font-display flex items-center gap-2 text-gray-900">
               <MessageSquare className="w-5 h-5 text-blue-600" /> Messages
             </h2>
           </div>
           <div className="overflow-y-auto flex-1">
             {chats.length === 0 ? (
               <div className="p-6 text-center text-gray-500 text-sm">No conversations yet.</div>
             ) : (
               chats.map(chat => (
                 <button 
                   key={chat.id}
                   onClick={() => setActiveChatId(chat.id)}
                   className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-100 transition-colors flex items-start gap-3 ${activeChatId === chat.id ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'border-l-4 border-l-transparent'}`}
                 >
                   <div className="bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-5 h-5 text-gray-600" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {chat.pseudoName || "Chat Member"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                   </div>
                 </button>
               ))
             )}
           </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-white">
           {activeChat ? (
             <>
               <div className="p-4 border-b border-gray-200 bg-white">
                 <h3 className="font-semibold text-gray-900">
                    {activeChat.pseudoName || "Chat Member"}
                 </h3>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                  {messages.map(msg => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                            {msg.text}
                         </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
               </div>

               <div className="p-4 border-t border-gray-200 bg-white">
                 <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition">
                       <Send className="w-4 h-4 ml-0.5" />
                    </button>
                 </form>
               </div>
             </>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
               <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
               <p>Select a conversation to start messaging</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-gray-500">Loading messages...</div>}>
      <MessagesContent />
    </Suspense>
  )
}
