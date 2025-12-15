import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotesEditor from '@/components/NotesEditor';
import NotesList from '@/components/NotesList';
import { useNotes } from '@/hooks/useNotes';
import { useUserStore } from '@/store/userStore';
import { useArticlesStore } from '@/store/articlesStore';
import type { Note } from '@shared/types/note';

export default function NotesPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { articles } = useArticlesStore();
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);

  const {
    notes,
    isLoading,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes(user?.id || '');

  const handleSave = (data: any) => {
    if ('id' in data) {
      // Update existing note
      updateNote(data);
      setShowEditor(false);
      setEditingNote(undefined);
    } else {
      // Create new note
      createNote(data);
      setShowEditor(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowEditor(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  const handleNewNote = () => {
    setEditingNote(undefined);
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingNote(undefined);
  };

  const handleSelectArticle = (articleId: string) => {
    navigate(`/article/${articleId}`);
  };

  const handleExport = async () => {
    // TODO: Implement export functionality
    console.log('Export notes');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading notes...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
        <div className="flex gap-3">
          {notes && notes.length > 0 && (
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          )}
          <button
            onClick={handleNewNote}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      </div>

      {/* Editor */}
      {showEditor && (
        <div className="mb-6">
          <NotesEditor
            note={editingNote}
            userId={user?.id || ''}
            onSave={handleSave}
            onCancel={handleCancel}
            autoSave={true}
          />
        </div>
      )}

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <NotesList
          notes={notes}
          articles={articles}
          onEditNote={handleEditNote}
          onDeleteNote={handleDeleteNote}
          onSelectArticle={handleSelectArticle}
        />
      ) : (
        !showEditor && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-600 mb-4">You don't have any notes yet.</p>
            <button
              onClick={handleNewNote}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Note
            </button>
          </div>
        )
      )}
    </div>
  );
}
