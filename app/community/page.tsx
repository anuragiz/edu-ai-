"use client";

"use client";

import { useState, useEffect } from "react";
import { Users, Plus, X } from "lucide-react";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import { DiscussionCard } from "@/components/DiscussionCard";

export default function CommunityPage() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTags, setNewTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const fetchDiscussions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "discussions"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDiscussions(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "discussions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;

    const postTags = newTags.split(",").map(t => t.trim()).filter(Boolean).slice(0, 5); 
    
    try {
      if (editingPostId) {
        await updateDoc(doc(db, "discussions", editingPostId), {
           title: newTitle,
           tags: postTags.length > 0 ? postTags : ["General"],
           updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "discussions"), {
          title: newTitle,
          tags: postTags.length > 0 ? postTags : ["General"],
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          likes: 0,
          dislikes: 0,
          createdAt: serverTimestamp(),
        });
      }
      setNewTitle("");
      setNewTags("");
      setShowForm(false);
      setEditingPostId(null);
      fetchDiscussions();
    } catch (error) {
       handleFirestoreError(error, editingPostId ? OperationType.UPDATE : OperationType.CREATE, "discussions");
    }
  };

  const handleEdit = (post: any) => {
    setEditingPostId(post.id);
    setNewTitle(post.title);
    setNewTags(post.tags?.join(", ") || "");
    setShowForm(true);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Learning Community
          </h1>
          <p className="text-gray-500 mt-1">Connect with peers, ask questions, and share your wins.</p>
        </div>
        {user ? (
          <button 
            onClick={() => {
               setEditingPostId(null);
               setNewTitle("");
               setNewTags("");
               setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Discussion
          </button>
        ) : (
          <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg border border-orange-200">
            Sign in to start a discussion
          </div>
        )}
      </div>

      {showForm && user && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative">
          <button 
            onClick={() => {
              setShowForm(false);
              setEditingPostId(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">{editingPostId ? 'Edit Discussion' : 'Create New Discussion'}</h2>
          <form onSubmit={handleAddPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title or Question</label>
              <input
                type="text"
                required
                maxLength={300}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="e.g. Next.js, Question"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editingPostId ? 'Update Discussion' : 'Post Discussion'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex gap-4">
              <button className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-4 -mb-[17px]">Latest Updates</button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-gray-500 z-10 flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                 Loading discussions...
              </div>
            ) : discussions.length === 0 ? (
              <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                No discussions found. Be the first to start one!
              </div>
            ) : discussions.map((post) => (
               <DiscussionCard key={post.id} post={post} setEditingPost={handleEdit} fetchDiscussions={fetchDiscussions} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">About Community</h3>
            <p className="text-sm text-gray-600">
              This space is for you to connect with others, ask questions, and share knowledge across any topic. Click "Show Comments" on any post to join the conversation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
