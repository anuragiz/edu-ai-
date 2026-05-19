"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { BookMarked, MessageSquare, Trash2, Edit } from "lucide-react";
import Link from "next/link";

export default function MyPublishedPage() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const booksQ = query(collection(db, "books"), where("authorId", "==", user.uid), orderBy("createdAt", "desc"));
      const booksSnapshot = await getDocs(booksQ);
      setBooks(booksSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

      const discQ = query(collection(db, "discussions"), where("authorId", "==", user.uid), orderBy("createdAt", "desc"));
      const discSnapshot = await getDocs(discQ);
      setDiscussions(discSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "books/discussions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const handleDeleteBook = async (id: string) => {
    if(!confirm("Delete this book?")) return;
    try {
      await deleteDoc(doc(db, "books", id));
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${id}`);
    }
  }

  const handleDeleteDiscussion = async (id: string) => {
    if(!confirm("Delete this discussion?")) return;
    try {
      await deleteDoc(doc(db, "discussions", id));
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `discussions/${id}`);
    }
  }

  if (authLoading || loading) return <div className="p-10 text-center text-gray-500">Loading your published items...</div>;

  if (!user) return <div className="p-10 text-center">Please sign in to view your published content.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 flex flex-col">
      <h1 className="text-3xl font-bold text-gray-900 font-display mb-8">My Published Content</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <BookMarked className="w-6 h-6 text-blue-600" /> My Library Books
        </h2>
        {books.length === 0 ? (
          <p className="text-gray-500 bg-gray-50 border border-dashed border-gray-200 p-6 rounded-lg text-center">You haven't added any books yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {books.map(book => (
              <div key={book.id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">{book.description}</p>
                <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">{book.createdAt?.toDate ? new Date(book.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
                  <div className="flex gap-3">
                    <Link href="/library" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Edit className="w-4 h-4" /> Edit in Library
                    </Link>
                    <button onClick={() => handleDeleteBook(book.id)} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-4">
          <MessageSquare className="w-6 h-6 text-indigo-600" /> My Discussions
        </h2>
        {discussions.length === 0 ? (
           <p className="text-gray-500 bg-gray-50 border border-dashed border-gray-200 p-6 rounded-lg text-center">You haven't started any discussions yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
             {discussions.map(post => (
              <div key={post.id} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                <div className="flex gap-2 mb-4 flex-wrap">
                    {post.tags?.map((tag: string) => (
                      <span key={tag} className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                        {tag}
                      </span>
                    ))}
                </div>
                <div className="flex justify-between items-center mt-auto border-t border-gray-100 pt-3">
                  <span className="text-xs text-gray-500">{post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
                  <div className="flex gap-3">
                    <Link href="/community" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Edit className="w-4 h-4" /> View / Edit 
                    </Link>
                    <button onClick={() => handleDeleteDiscussion(post.id)} className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
