import type { Category, CreateNoteInput, Note, UpdateNoteInput } from '@/types/note';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  getNotes() {
    return request<Note[]>('/notes');
  },

  getNoteById(id: number) {
    return request<Note>(`/notes/${id}`);
  },

  createNote(data: CreateNoteInput) {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateNote(id: number, data: UpdateNoteInput) {
    return request<Note>(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteNote(id: number) {
    return request<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories() {
    return request<Category[]>('/categories');
  },

  createCategory(name: string) {
    return request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};
