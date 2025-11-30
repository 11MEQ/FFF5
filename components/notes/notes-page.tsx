"use client";

import React, { useState, useEffect } from "react";
import { getNotes, addNote, updateNote, deleteNote } from "@/lib/storage";

type Note = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newContent, setNewContent] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    setNotes(getNotes());
  }, []);

  const handleAddNote = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    addNote({ title: newTitle, content: newContent });
    setNotes(getNotes());
    setNewTitle("");
    setNewContent("");
  };

  const handleEditNote = (note: Note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const handleUpdateNote = () => {
    if (!editingId) return;
    updateNote(editingId, { title: editingTitle, content: editingContent });
    setNotes(getNotes());
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="font-bold text-3xl mb-8 flex items-center gap-2">
        <span role="img" aria-label="notes">📝</span>
        الملاحظات
      </h2>
      <div className="mb-8 p-6 bg-bg-secondary rounded-xl border border-border shadow flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="عنوان الملاحظة"
            className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-primary text-lg"
          />
          <button
            onClick={handleAddNote}
            className="bg-primary text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          >
            إضافة ملاحظة
          </button>
        </div>
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="محتوى الملاحظة"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-primary text-base resize-none"
          rows={3}
        />
      </div>
      <div className="space-y-6">
        {notes.length === 0 ? (
          <div className="text-center text-text-secondary py-12">
            <span role="img" aria-label="empty">🗒️</span>
            <p className="mt-2">لا توجد ملاحظات بعد.</p>
          </div>
        ) : (
          notes
            .slice()
            .sort((a, b) =>
              new Date(a.created_at ?? 0).getTime() < new Date(b.created_at ?? 0).getTime() ? 1 : -1
            )
            .map((note: Note) => (
              <div key={note.id} className="bg-white rounded-xl border border-border shadow p-5 flex flex-col gap-2">
                {editingId === note.id ? (
                  <>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      className="w-full mb-2 px-4 py-2 border border-border rounded-lg text-lg"
                    />
                    <textarea
                      value={editingContent}
                      onChange={e => setEditingContent(e.target.value)}
                      className="w-full mb-2 px-4 py-2 border border-border rounded-lg text-base resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleUpdateNote}
                        className="bg-success text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-success/90 transition"
                      >
                        حفظ
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-danger text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-danger/90 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-xl text-primary mb-1">{note.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="bg-info text-white px-3 py-1 rounded-lg font-semibold shadow hover:bg-info/90 transition"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="bg-danger text-white px-3 py-1 rounded-lg font-semibold shadow hover:bg-danger/90 transition"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <p className="mb-2 text-base text-text">{note.content}</p>
                    <span className="text-xs text-text-secondary self-end">{new Date((note as any).created_at).toLocaleString()}</span>
                  </>
                )}
              </div>
            ))
        )}
      </div>
    </div>
  );
}
