import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import type { Note, CreateNoteInput, UpdateNoteInput } from '@/types/note';
import { useAuth } from '@/components/AuthContext';

export function useNotes() {
  const { token } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.getNotes();
      setNotes(data);
    } catch {
      setError('No se pudieron cargar las notas');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (input: CreateNoteInput) => {
    const newNote = await api.createNote(input);
    setNotes((prev) => [newNote, ...prev]);
  };

  const updateNote = async (id: number, input: UpdateNoteInput) => {
    const updated = await api.updateNote(id, input);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const deleteNote = async (id: number) => {
    await api.deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return { notes, loading, error, loadNotes, createNote, updateNote, deleteNote };
}
