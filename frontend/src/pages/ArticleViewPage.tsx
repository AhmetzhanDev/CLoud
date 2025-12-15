import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useArticle } from '@/hooks/useArticles';
import { useNotes } from '@/hooks/useNotes';
import { articlesApi } from '@/services/articlesApi';
import ArticleSummary from '@/components/ArticleSummary';
import NotesEditor from '@/components/NotesEditor';
import { useUserStore } from '@/store/userStore';
import type { Note } from '@shared/types/note';

export default function ArticleViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  
  const { data: article, isLoading: articleLoading, error: articleError } = useArticle(id!);
  const { notes, createNote, updateNote, deleteNote, isLoading: notesLoading } = useNotes(user?.id || '');
  
  const [activeTab, setActiveTab] = useState<'content' | 'summary' | 'notes'>('content');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>(undefined);
  
  // Filter notes for this article
  const articleNotes = notes?.filter(note => note.articleId === id) || [];

  // Fetch article content
  const { data: contentData, isLoading: contentLoading } = useQuery({
    queryKey: ['article-content', id],
    queryFn: () => articlesApi.getContent(id!),
    enabled: !!id && activeTab === 'content',
  });

  const handleSaveNote = (data: any) => {
    if ('id' in data) {
      // Update existing note
      updateNote(data);
      setShowNoteForm(false);
      setEditingNote(undefined);
    } else {
      // Create new note
      createNote(data);
      setShowNoteForm(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setShowNoteForm(true);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const handleCancelNote = () => {
    setShowNoteForm(false);
    setEditingNote(undefined);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (articleLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (articleError || !article) {
    return (
      <div className="card bg-red-50 border-red-200">
        <p className="text-red-600">Error loading article</p>
        <button onClick={() => navigate('/library')} className="btn btn-secondary mt-4">
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/library')}
          className="text-indigo-600 hover:text-indigo-800 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </button>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
            <p className="text-gray-600 mb-2">{article.authors.join(', ')}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded">{article.source}</span>
              <span>Added: {formatDate(article.createdAt)}</span>
              {article.publicationDate && (
                <span>Published: {formatDate(article.publicationDate)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'content'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'summary'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'notes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notes {articleNotes.length > 0 && `(${articleNotes.length})`}
          </button>
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Abstract</h2>
              <p className="text-gray-700 leading-relaxed mb-6">{article.abstract}</p>

              {article.keywords.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold text-gray-900 mb-4">Full Content</h2>
              {contentLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : contentData ? (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {contentData.content}
                  </pre>
                </div>
              ) : (
                <p className="text-gray-500">Content not available</p>
              )}
            </div>
          </div>

          {/* Quick Notes Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Notes</h3>
              {notesLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : articleNotes.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {articleNotes.slice(0, 3).map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 line-clamp-3">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.tags.map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No notes yet</p>
              )}
              <button
                onClick={() => setActiveTab('notes')}
                className="btn btn-secondary w-full"
              >
                View All Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <ArticleSummary articleId={id!} articleTitle={article.title} />
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
            <button
              onClick={() => {
                setEditingNote(undefined);
                setShowNoteForm(!showNoteForm);
              }}
              className="btn btn-primary"
            >
              {showNoteForm ? 'Cancel' : 'Add Note'}
            </button>
          </div>

          {showNoteForm && (
            <div className="mb-6">
              <NotesEditor
                note={editingNote}
                articleId={id}
                articleTitle={article.title}
                userId={user?.id || ''}
                onSave={handleSaveNote}
                onCancel={handleCancelNote}
                autoSave={true}
              />
            </div>
          )}

          {notesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : articleNotes.length > 0 ? (
            <div className="space-y-4">
              {articleNotes.map((note) => (
                <div key={note.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      {note.articleSection && (
                        <p className="text-sm text-gray-600 mb-1">
                          Section: {note.articleSection}
                        </p>
                      )}
                      <p className="text-gray-700 leading-relaxed mb-3 whitespace-pre-wrap">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {note.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Created: {formatDate(note.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="text-gray-600 hover:text-indigo-600"
                        title="Edit note"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-gray-600 hover:text-red-600"
                        title="Delete note"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-600">No notes yet. Add your first note to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
