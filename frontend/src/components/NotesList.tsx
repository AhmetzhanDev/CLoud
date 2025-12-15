import { useState, useMemo } from 'react';
import { Search, Tag, FileText, Edit2, Trash2, Calendar, Filter } from 'lucide-react';
import type { Note } from '@shared/types/note';
import type { Article } from '@shared/types/article';

interface NotesListProps {
  notes: Note[];
  articles: Article[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (noteId: string) => void;
  onSelectArticle?: (articleId: string) => void;
}

type GroupBy = 'none' | 'article' | 'date';
type SortBy = 'newest' | 'oldest' | 'article';

export default function NotesList({
  notes,
  articles,
  onEditNote,
  onDeleteNote,
  onSelectArticle,
}: NotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<GroupBy>('article');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique tags from notes
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes]);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        note.articleSection?.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => note.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [notes, searchQuery, selectedTags]);

  // Sort notes
  const sortedNotes = useMemo(() => {
    const sorted = [...filteredNotes];
    switch (sortBy) {
      case 'newest':
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'oldest':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'article':
        return sorted.sort((a, b) => a.articleId.localeCompare(b.articleId));
      default:
        return sorted;
    }
  }, [filteredNotes, sortBy]);

  // Group notes
  const groupedNotes = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Notes': sortedNotes };
    }

    if (groupBy === 'article') {
      const groups: Record<string, Note[]> = {};
      sortedNotes.forEach((note) => {
        const article = articles.find((a) => a.id === note.articleId);
        const groupName = article?.title || 'Unknown Article';
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(note);
      });
      return groups;
    }

    if (groupBy === 'date') {
      const groups: Record<string, Note[]> = {};
      sortedNotes.forEach((note) => {
        const date = new Date(note.createdAt);
        const groupName = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(note);
      });
      return groups;
    }

    return { 'All Notes': sortedNotes };
  }, [sortedNotes, groupBy, articles]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getArticleTitle = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    return article?.title || 'Unknown Article';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderNoteContent = (content: string) => {
    // Simple markdown rendering for preview
    let preview = content.substring(0, 200);
    if (content.length > 200) {
      preview += '...';
    }
    return preview;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes by content, tags, or section..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Group By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group By
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGroupBy('none')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    groupBy === 'none'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  None
                </button>
                <button
                  onClick={() => setGroupBy('article')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    groupBy === 'article'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Article
                </button>
                <button
                  onClick={() => setGroupBy('date')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    groupBy === 'date'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Date
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('newest')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    sortBy === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => setSortBy('oldest')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    sortBy === 'oldest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy('article')}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    sortBy === 'article'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Article
                </button>
              </div>
            </div>

            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <button
                    onClick={() => setSelectedTags([])}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Clear tag filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        </p>
      </div>

      {/* Notes List */}
      {Object.keys(groupedNotes).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No notes found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
            <div key={groupName}>
              {/* Group Header */}
              {groupBy !== 'none' && (
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {groupBy === 'article' && <FileText className="w-5 h-5" />}
                  {groupBy === 'date' && <Calendar className="w-5 h-5" />}
                  {groupName}
                  <span className="text-sm font-normal text-gray-500">
                    ({groupNotes.length})
                  </span>
                </h3>
              )}

              {/* Notes in Group */}
              <div className="space-y-3">
                {groupNotes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Note Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {groupBy !== 'article' && (
                          <button
                            onClick={() => onSelectArticle?.(note.articleId)}
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline mb-1 block"
                          >
                            {getArticleTitle(note.articleId)}
                          </button>
                        )}
                        {note.articleSection && (
                          <p className="text-sm text-gray-600 mb-1">
                            Section: {note.articleSection}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(note.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEditNote(note)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit note"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this note?'
                              )
                            ) {
                              onDeleteNote(note.id);
                            }
                          }}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div className="mb-3">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {renderNoteContent(note.content)}
                      </p>
                    </div>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
