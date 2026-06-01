import { Platform } from 'react-native';
import type { Category, CreateNoteInput, Note, UpdateNoteInput } from '@/types/note';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

let tokenGetter: (() => string | null) | null = null;

export function setTokenGetter(getter: () => string | null) {
  tokenGetter = getter;
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const token = tokenGetter?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? body.message ?? `Error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
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
    return request<void>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },

  uploadImage(uri: string, filename: string, mimeType: string) {
    return new Promise<string>(async (resolve, reject) => {
      try {
        const formData = new FormData();

        if (Platform.OS === 'web') {
          const res = await fetch(uri);
          const blobData = await res.blob();
          const fileObj = new File([blobData], filename, { type: mimeType });
          formData.append('image', fileObj);
        } else {
          formData.append('image', {
            uri,
            name: filename,
            type: mimeType,
          } as unknown as Blob);
        }

        const headers: Record<string, string> = {};
        const token = tokenGetter?.();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}/notes/upload`, {
          method: 'POST',
          headers,
          body: formData,
        });

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body.error ?? body.message ?? `Error ${response.status}`);
        }

        const data = await response.json();
        resolve(data.imageUrl);
      } catch (e) {
        reject(e);
      }
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

export const authApi = {
  login(email: string, password: string) {
    return request<{ token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register(email: string, password: string) {
    return request<{ token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};
