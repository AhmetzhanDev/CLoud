import { useState, useEffect, useRef } from 'react';
import { Save, Tag, X, FileText } from 'lucide-react';
import type { Note, CreateNote, UpdateNote } from '@shared/types/note';

interface NotesEditorProps {
  note?: Note;
  articleId?: string;
  articleTitle?: string;
  userId: string;
  onSave: (note: CreateNote | { id: string; updates: UpdateNote }) => void;
  onCancel?: () => void;
  autoSave?: boolean;
}

export default function NotesEditor({
  note,
  articleId,
  articleTitle,
  userId,
  onSave,
  onCancel,
  autoSave = true,
}: NotesEditorProps) {
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [articleSection, setArticleSection] = useState(note?.articleSection || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !content.trim()) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [content, tags, articleSection, autoSave]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      if (note) {
        // Update existing note
        const updates: UpdateNote = {
          content,
          tags,
          articleSection: articleSection || undefined,
          userId,
          articleId: articleId || note.articleId,
        };
        onSave({ id: note.id, updates });
      } else {
        // Create new note
        if (!articleId) {
          console.error('Article ID is required for new notes');
          return;
        }
        const newNote: CreateNote = {
          userId,
          articleId,
          content,
          tags,
          articleSection: articleSection || undefined,
        };
        onSave(newNote);
      }
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const formatBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const newContent =
        content.substring(0, start) +
        `**${selectedText}**` +
        content.substring(end);
      setContent(newContent);
    }
  };

  const formatItalic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      const newContent =
        content.substring(0, start) +
        `*${selectedText}*` +
        content.substring(end);
      setContent(newContent);
    }
  };

  const insertBulletList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newContent =
      content.substring(0, start) +
      '\n- ' +
      content.substring(start);
    setContent(newContent);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {note ? 'Edit Note' : 'New Note'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {isSaving && (
            <span className="text-sm text-blue-600">Saving...</span>
          )}
        </div>
      </div>

      {/* Article Info */}
      {articleTitle && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Article:</span> {articleTitle}
          </p>
        </div>
      )}

      {/* Article Section */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Article Section (optional)
        </label>
        <input
          type="text"
          value={articleSection}
          onChange={(e) => setArticleSection(e.target.value)}
          placeholder="e.g., Introduction, Methodology, Results..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="flex gap-2 mb-2 pb-2 border-b border-gray-200">
        <button
          type="button"
          onClick={formatBold}
          className="px-3 py-1 text-sm font-bold border border-gray-300 rounded hover:bg-gray-100"
          title="Bold (select text first)"
        >
          B
        </button>
        <button
          type="button"
          onClick={formatItalic}
          className="px-3 py-1 text-sm italic border border-gray-300 rounded hover:bg-gray-100"
          title="Italic (select text first)"
        >
          I
        </button>
        <button
          type="button"
          onClick={insertBulletList}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          title="Bullet list"
        >
          • List
        </button>
      </div>

      {/* Content Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note Content
        </label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your notes here... Use **bold** for bold text, *italic* for italic text."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[200px]"
          rows={8}
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports basic markdown: **bold**, *italic*, - bullet lists
        </p>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add tags (press Enter)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!content.trim() || isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
