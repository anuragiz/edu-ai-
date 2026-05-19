"use client";

import { useState, useEffect } from "react";
import { BookMarked, Plus, X, User, Upload, Trash2, Edit, Send } from "lucide-react";
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { db, handleFirestoreError, OperationType } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";

export default function LibraryPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBooks(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, "books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !user) return;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, "books", editingId), {
          title: newTitle,
          description: newDesc,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "books"), {
          title: newTitle,
          description: newDesc,
          fileName: file ? file.name : "No file attached",
          fileSize: file ? file.size : 0,
          authorId: user.uid,
          authorName: user.displayName || "Anonymous",
          createdAt: serverTimestamp(),
        });
      }
      setNewTitle("");
      setNewDesc("");
      setFile(null);
      setEditingId(null);
      setShowForm(false);
      fetchBooks();
    } catch (error) {
       handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, "books");
    }
  };

  const handleDelete = async (bookId: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteDoc(doc(db, "books", bookId));
      fetchBooks();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${bookId}`);
    }
  }

  const handleEdit = (book: any) => {
    setEditingId(book.id);
    setNewTitle(book.title);
    setNewDesc(book.description);
    setFile(null);
    setShowForm(true);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-display flex items-center gap-3">
            <BookMarked className="h-8 w-8 text-blue-600" />
            Public Library
          </h1>
          <p className="text-gray-500 mt-1">Explore resources added by the community.</p>
        </div>
        {user ? (
          <button 
            onClick={() => {
              setEditingId(null);
              setNewTitle("");
              setNewDesc("");
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </button>
        ) : (
          <div className="bg-orange-50 text-orange-800 px-4 py-2 rounded-lg border border-orange-200">
            Sign in to add a book
          </div>
        )}
      </div>

      {showForm && user && (
        <div className="mb-8 bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative">
          <button 
            onClick={() => {
              setShowForm(false);
              setEditingId(null);
            }}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Book' : 'Add a New Book'}</h2>
          <form onSubmit={handleAddBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
              <input
                type="text"
                required
                maxLength={200}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="The name of the book"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Summary</label>
              <textarea
                required
                maxLength={5000}
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What is this book about?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File (PDF, DOCX)</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Choose File</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      accept=".pdf,.doc,.docx"
                    />
                  </label>
                  {file && <span className="text-sm text-gray-600 border border-gray-200 px-3 py-1 rounded bg-gray-50">{file.name}</span>}
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editingId ? 'Update Book' : (file ? 'Upload & Add to Library' : 'Add to Library')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500 z-10 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          Loading library...
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-10 text-gray-500 border border-dashed border-gray-300 rounded-xl">
          No books found. Be the first to add one!
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col group">
              <div className="flex-1 relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <BookMarked className="w-5 h-5" />
                    <span className="text-sm font-medium">Public Resource</span>
                  </div>
                  {user?.uid === book.authorId && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(book)} className="text-gray-400 hover:text-blue-600 p-1">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(book.id)} className="text-gray-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{book.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-4">{book.description}</p>
                {book.fileName && (
                  <div className="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 flex items-center gap-2">
                    <Upload className="w-3 h-3 text-gray-400" /> Attached: {book.fileName}
                  </div>
                )}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{book.authorName}</span>
                  {user && user.uid !== book.authorId && (
                    <Link href={`/messages?userId=${book.authorId}&name=${encodeURIComponent(book.authorName)}`} className="text-blue-600 hover:text-blue-700 ml-1" title="Message Author">
                      <Send className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                <span>{book.createdAt?.toDate ? new Date(book.createdAt.toDate()).toLocaleDateString() : 'Just now'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
