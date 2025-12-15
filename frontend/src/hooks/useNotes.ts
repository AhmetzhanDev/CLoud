import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/services/notesApi';
import { useNotesStore } from '@/store/notesStore';

export const useNotes = (userId: string) => {
  const queryClient = useQueryClient();
  const { setNotes, addNote, updateNote: updateInStore, deleteNote: removeFromStore } = useNotesStore();

  const notesQuery = useQuery({
    queryKey: ['notes', userId],
    queryFn: async () => {
      const notes = await notesApi.getAll(userId);
      setNotes(notes);
      return notes;
    },
    enabled: !!userId,
  });

  const createMutation = useMutation({
    mutationFn: notesApi.create,
    onSuccess: (note: any) => {
      addNote(note);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      notesApi.update(id, updates),
    onSuccess: (note: any) => {
      updateInStore(note.id, note);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notesApi.delete,
    onSuccess: (_: void, id: string) => {
      removeFromStore(id);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes: notesQuery.data,
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createNote: createMutation.mutate,
    updateNote: updateMutation.mutate,
    deleteNote: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
