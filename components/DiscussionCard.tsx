"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, increment } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { User, MessageSquare, ThumbsUp, ThumbsDown, Trash2, Edit, Send } from "lucide-react";
import Link from "next/link";

export function DiscussionCard({ post, setEditingPost, fetchDiscussions }: { post: any, setEditingPost: (post: any) => void, fetchDiscussions: () => void }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const q = query(collection(db, "discussions", post.id, "comments"), orderBy("createdAt", "asc"));
      const snapshot = await getDocs(q);
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `discussions/${post.id}/comments`);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addDoc(collection(db, "discussions", post.id, "comments"), {
        text: newComment,
        authorId: user.uid,
        authorName: user.displayName || "Anonymous",
        createdAt: serverTimestamp(),
      });
      setNewComment("");
      fetchComments(); // Refresh comments
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `discussions/${post.id}/comments`);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "discussions", post.id), {
        likes: increment(1)
      });
      fetchDiscussions();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `discussions/${post.id}`);
    }
  };

  const handleDislike = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "discussions", post.id), {
        dislikes: increment(1)
      });
      fetchDiscussions();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `discussions/${post.id}`);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    try {
      await deleteDoc(doc(db, "discussions", post.id));
      fetchDiscussions();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `discussions/${post.id}`);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Delete comment?")) return;
    try {
       await deleteDoc(doc(db, "discussions", post.id, "comments", commentId));
       fetchComments();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `discussions/${post.id}/comments/${commentId}`);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {post.tags?.map((tag: string) => (
              <span key={tag} className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                {tag}
              </span>
            ))}
          </div>
          <div className="font-semibold text-lg text-gray-900 mb-2">
            {post.title}
          </div>
          <div className="text-sm text-gray-500 flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
               <User className="w-4 h-4" />
               <span className="font-medium text-gray-700">{post.authorName}</span>
               {user && user.uid !== post.authorId && (
                  <Link href={`/messages?userId=${post.authorId}&name=${encodeURIComponent(post.authorName)}`} className="text-blue-600 hover:text-blue-700 ml-2" title="Send Message">
                    <Send className="w-4 h-4" />
                  </Link>
               )}
               <span>•</span>
               <span>{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 min-w-[80px]">
           {user?.uid === post.authorId && (
              <div className="flex gap-2">
                  <button onClick={() => setEditingPost(post)} className="text-gray-400 hover:text-blue-600 p-1">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={handleDelete} className="text-gray-400 hover:text-red-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
              </div>
           )}
           <div className="flex items-center gap-3">
              <button disabled={!user} onClick={handleLike} className="flex flex-col items-center text-gray-500 hover:text-blue-600 disabled:opacity-50">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-xs font-medium">{post.likes || 0}</span>
              </button>
              <button disabled={!user} onClick={handleDislike} className="flex flex-col items-center text-gray-500 hover:text-red-600 disabled:opacity-50">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-xs font-medium">{post.dislikes || 0}</span>
              </button>
           </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
         <button 
           onClick={() => setShowComments(!showComments)}
           className="text-sm font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1.5"
         >
           <MessageSquare className="w-4 h-4" />
           {showComments ? 'Hide Comments' : 'Show Comments'}
         </button>
      </div>

      {showComments && (
        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col gap-4">
           {loadingComments ? (
             <div className="text-sm text-gray-500">Loading comments...</div>
           ) : comments.length === 0 ? (
             <div className="text-sm text-gray-500">No comments yet.</div>
           ) : (
             <div className="space-y-4">
               {comments.map(c => (
                 <div key={c.id} className="flex gap-3">
                    <div className="bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200">
                       <div className="flex justify-between items-start mb-1">
                         <span className="text-sm font-semibold text-gray-900">{c.authorName}</span>
                         {user?.uid === c.authorId && (
                           <button onClick={() => handleDeleteComment(c.id)} className="text-gray-400 hover:text-red-600">
                             <Trash2 className="w-3 h-3" />
                           </button>
                         )}
                       </div>
                       <p className="text-sm text-gray-700">{c.text}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}

           {user && (
             <form onSubmit={handleAddComment} className="flex gap-2 mt-2">
                <input 
                  type="text" 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={2000}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button type="submit" disabled={!newComment.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
                  Post
                </button>
             </form>
           )}
        </div>
      )}
    </div>
  );
}
