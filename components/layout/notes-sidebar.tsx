import React, { useState, useEffect } from "react";
import { getNotes, addNote, updateNote, deleteNote } from "@/lib/storage";

export default function NotesSidebar() {
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

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

  const handleEditNote = (note) => {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  };

  const handleUpdateNote = () => {
    updateNote(editingId, { title: editingTitle, content: editingContent });
    setNotes(getNotes());
    setEditingId(null);
    setEditingTitle("");
    setEditingContent("");
  };

  const handleDeleteNote = (id) => {
    deleteNote(id);
    setNotes(getNotes());
  };

  return (
    <div className="p-4 bg-bg-secondary rounded-lg border border-border mb-4">
      <h2 className="font-bold text-lg mb-4">الملاحظات</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="عنوان الملاحظة"
          className="w-full mb-2 px-3 py-2 border border-border rounded"
        />
        <textarea
          value={newContent}
          onChange={e => setNewContent(e.target.value)}
          placeholder="محتوى الملاحظة"
          className="w-full mb-2 px-3 py-2 border border-border rounded"
        />
        <button
          onClick={handleAddNote}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          إضافة ملاحظة
        </button>
      </div>
      <div>
        {notes.length === 0 ? (
          <p className="text-text-secondary">لا توجد ملاحظات بعد.</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className="mb-4 p-3 bg-white rounded border border-border">
              {editingId === note.id ? (
                <>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-border rounded"
                  />
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border border-border rounded"
                  />
                  <button
                    onClick={handleUpdateNote}
                    className="bg-success text-white px-3 py-1 rounded mr-2"
                  >
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-danger text-white px-3 py-1 rounded"
                  >
                    إلغاء
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-1">{note.title}</h3>
                  <p className="mb-2 text-sm">{note.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="bg-info text-white px-3 py-1 rounded"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="bg-danger text-white px-3 py-1 rounded"
                    >
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
